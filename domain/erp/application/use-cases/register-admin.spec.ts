import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { Email } from '@/domain/erp/enterprise/entities/value-objects/email'
import { RegisterAdminUseCase } from '@/domain/erp/application/use-cases/register-admin'

import { NotAllowedError } from '@/core/errors/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found.error'
import { InvalidPasswordError } from '@/domain/erp/application/use-cases/errors/errors/invalid-password.error'
import { UserAlreadyExistsError } from '@/domain/erp/application/use-cases/errors/errors/user-already-exists.error'

import { makeAdmin } from 'test/factories/make-admin'
import { makeCustomer } from 'test/factories/make-customer'

import { createDomainTestsFixture } from 'test/helpers/create-domain-test-fixture'

import type { CreatePhoneRequestProps } from '@/infra/http/schemas/http/create-phone.validation.schema'

let fixture: ReturnType<typeof createDomainTestsFixture>

let sut: RegisterAdminUseCase

describe('Register Admin', () => {
  beforeEach(() => {
    fixture = createDomainTestsFixture()

    sut = new RegisterAdminUseCase(
      fixture.logger,
      fixture.adminsRepo,
      fixture.customersRepo,
      fixture.caslErpService,
    )
  })

  it('should be able to register a new admin', async () => {
    fixture.adminsRepo.create(makeAdmin({}, new UniqueEntityID('admin-1')))

    const phone1: CreatePhoneRequestProps = {
      type: 'MOBILE',
      number: '123456789',
      isWhatsapp: true,
    }

    const phone2: CreatePhoneRequestProps = {
      type: 'MOBILE',
      number: '987654321',
      isWhatsapp: false,
    }

    const result = await sut.execute({
      firstName: 'John',
      lastName: 'Doe',
      username: 'John Doe',
      email: 'johndoe@example.com',
      password: 'Tester1@Test',
      phones: [phone1, phone2],
      currentUserId: 'admin-1',
    })

    expect(result.isRight()).toBe(true)
  })

  it('should not be able to register a new admin if there is no current user', async () => {
    fixture.customersRepo.create(
      makeCustomer({}, new UniqueEntityID('customer-1')),
    )

    const phone: CreatePhoneRequestProps = {
      type: 'MOBILE',
      number: '123456789',
      isWhatsapp: true,
    }

    const result = await sut.execute({
      firstName: 'John',
      lastName: 'Doe',
      username: 'John Doe',
      email: 'johndoe@example.com',
      password: 'Tester1@Test',
      phones: [phone],
      currentUserId: 'unexistent-user-id',
    })

    expect(result.isRight()).toBe(false)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to register a new admin from a non-admin account', async () => {
    fixture.customersRepo.create(
      makeCustomer({}, new UniqueEntityID('customer-1')),
    )

    const phone: CreatePhoneRequestProps = {
      type: 'MOBILE',
      number: '123456789',
      isWhatsapp: true,
    }

    const result = await sut.execute({
      firstName: 'John',
      lastName: 'Doe',
      username: 'John Doe',
      email: 'johndoe@example.com',
      password: 'Tester1@Test',
      phones: [phone],
      currentUserId: 'customer-1',
    })

    expect(result.isRight()).toBe(false)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })

  it('should not be able to register a new admin if the email is already in use', async () => {
    fixture.adminsRepo.create(makeAdmin({}, new UniqueEntityID('admin-1')))

    fixture.customersRepo.create(
      makeCustomer(
        {
          email: Email.create({ email: 'johndoe@example.com' }),
        },
        new UniqueEntityID('customer-1'),
      ),
    )

    const phone: CreatePhoneRequestProps = {
      type: 'MOBILE',
      number: '123456789',
      isWhatsapp: true,
    }

    const result = await sut.execute({
      firstName: 'John',
      lastName: 'Doe',
      username: 'John Doe',
      email: 'johndoe@example.com',
      password: 'Tester1@Test',
      phones: [phone],
      currentUserId: 'admin-1',
    })

    expect(result.isRight()).toBe(false)
    expect(result.value).toBeInstanceOf(UserAlreadyExistsError)
  })

  it('should not be able to register a new admin if the password does not match the requirements', async () => {
    fixture.adminsRepo.create(makeAdmin({}, new UniqueEntityID('admin-1')))

    const phone: CreatePhoneRequestProps = {
      type: 'MOBILE',
      number: '123456789',
      isWhatsapp: true,
    }

    const result = await sut.execute({
      firstName: 'John',
      lastName: 'Doe',
      username: 'John Doe',
      email: 'johndoe@example.com',
      password: 'invalid password',
      phones: [phone],
      currentUserId: 'admin-1',
    })

    expect(result.isRight()).toBe(false)
    expect(result.value).toBeInstanceOf(InvalidPasswordError)
  })
})
