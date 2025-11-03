import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { EditAdminUseCase } from '@/domain/erp/application/use-cases/edit-admin'

import { NotAllowedError } from '@/core/errors/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found.error'
import { InvalidPasswordError } from '@/domain/erp/application/use-cases/errors/errors/invalid-password.error'
import { UserAlreadyExistsError } from '@/domain/erp/application/use-cases/errors/errors/user-already-exists.error'

import { Email } from '@/domain/erp/enterprise/entities/value-objects/email'

import { makeAdmin } from 'test/factories/make-admin'
import { makePhone } from 'test/factories/make-phone'

import { createDomainTestsFixture } from 'test/helpers/create-domain-test-fixture'
import { makeCustomer } from 'test/factories/make-customer'

let fixture: ReturnType<typeof createDomainTestsFixture>

let sut: EditAdminUseCase

describe('Edit vehicle', () => {
  beforeEach(() => {
    fixture = createDomainTestsFixture()

    sut = new EditAdminUseCase(
      fixture.logger,
      fixture.adminsRepo,
      fixture.customersRepo,
      fixture.caslErpService,
    )
  })

  it('should be able to edit a self admin', async () => {
    await fixture.adminsRepo.create(
      makeAdmin({}, new UniqueEntityID('admin-1')),
    )

    await fixture.phonesRepo.createMany([
      makePhone(
        {
          userRole: 'ADMIN',
          userId: new UniqueEntityID('admin-1'),
        },
        new UniqueEntityID('phone-1'),
      ),
      makePhone(
        {
          userRole: 'ADMIN',
          userId: new UniqueEntityID('admin-1'),
        },
        new UniqueEntityID('phone-2'),
      ),
    ])

    const result = await sut.execute({
      adminId: 'admin-1',
      currentUserId: 'admin-1',

      firstName: 'Nome',
      lastName: 'Teste',
      username: 'Nome Teste',

      email: 'new-admin@example.com',
      password: 'Tester1@Test',
    })

    expect(result.isRight()).toBe(true)

    expect(fixture.adminsRepo.items).toHaveLength(1)
    expect(fixture.phonesRepo.items).toHaveLength(2)
  })

  it('should be able to edit a self admin without changing the email', async () => {
    await fixture.adminsRepo.create(
      makeAdmin(
        {
          email: Email.create({ email: 'previous-admin@example.com' }),
        },
        new UniqueEntityID('admin-1'),
      ),
    )

    await fixture.phonesRepo.createMany([
      makePhone(
        {
          userRole: 'ADMIN',
          userId: new UniqueEntityID('admin-1'),
        },
        new UniqueEntityID('phone-1'),
      ),
      makePhone(
        {
          userRole: 'ADMIN',
          userId: new UniqueEntityID('admin-1'),
        },
        new UniqueEntityID('phone-2'),
      ),
    ])

    const result = await sut.execute({
      adminId: 'admin-1',
      currentUserId: 'admin-1',

      firstName: 'Nome',
      lastName: 'Teste',
      username: 'Nome Teste',

      email: 'previous-admin@example.com',
      password: 'Tester1@Test',
    })

    expect(result.isRight()).toBe(true)

    expect(fixture.adminsRepo.items).toHaveLength(1)
    expect(fixture.phonesRepo.items).toHaveLength(2)
  })

  it('should not be able to edit a unexistent admin', async () => {
    const result = await sut.execute({
      adminId: 'unexistent-admin-id',
      currentUserId: 'unexistent-admin-id',

      firstName: 'Nome',
      lastName: 'Teste',
      username: 'Nome Teste',

      email: 'vD6a4@example.com',
      password: 'Tester1@Test',
    })

    expect(result.isRight()).toBe(false)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to edit a admin with an email already in use', async () => {
    await fixture.adminsRepo.create(
      makeAdmin(
        {
          email: Email.create({ email: 'previous-admin@example.com' }),
        },
        new UniqueEntityID('admin-1'),
      ),
    )

    await fixture.adminsRepo.create(
      makeAdmin(
        {
          email: Email.create({ email: 'existent-admin@example.com' }),
        },
        new UniqueEntityID('admin-2'),
      ),
    )

    const result = await sut.execute({
      adminId: 'admin-1',
      currentUserId: 'admin-1',

      firstName: 'Nome',
      lastName: 'Teste',
      username: 'Nome Teste',

      email: 'existent-admin@example.com',
      password: 'Tester1@Test',
    })

    expect(result.isRight()).toBe(false)
    expect(result.value).toBeInstanceOf(UserAlreadyExistsError)

    expect(fixture.adminsRepo.items).toHaveLength(2)
    expect(fixture.adminsRepo.items[0].email.email).toEqual(
      'previous-admin@example.com',
    )
  })

  it('should not be able to edit a admin with a non admin role', async () => {
    await fixture.customersRepo.create(
      makeCustomer({}, new UniqueEntityID('customer-1')),
    )

    await fixture.adminsRepo.create(
      makeAdmin({}, new UniqueEntityID('admin-1')),
    )

    await fixture.phonesRepo.createMany([
      makePhone(
        {
          userRole: 'ADMIN',
          userId: new UniqueEntityID('admin-1'),
        },
        new UniqueEntityID('phone-1'),
      ),
      makePhone(
        {
          userRole: 'ADMIN',
          userId: new UniqueEntityID('admin-1'),
        },
        new UniqueEntityID('phone-2'),
      ),
    ])

    const result = await sut.execute({
      adminId: 'admin-1',
      currentUserId: 'customer-1',

      firstName: 'Nome',
      lastName: 'Teste',
      username: 'Nome Teste',

      email: 'new-admin@example.com',
      password: 'Tester1@Test',
    })

    expect(result.isRight()).toBe(false)
    expect(result.value).toBeInstanceOf(NotAllowedError)

    expect(fixture.adminsRepo.items).toHaveLength(1)
  })

  it('should not be able to edit a admin with an invalid password', async () => {
    await fixture.adminsRepo.create(
      makeAdmin(
        {
          email: Email.create({ email: 'previous-admin@example.com' }),
        },
        new UniqueEntityID('admin-1'),
      ),
    )

    const result = await sut.execute({
      adminId: 'admin-1',
      currentUserId: 'admin-1',

      firstName: 'Nome',
      lastName: 'Teste',
      username: 'Nome Teste',

      email: 'new-admin@example.com',
      password: 'invalid',
    })

    expect(result.isRight()).toBe(false)
    expect(result.value).toBeInstanceOf(InvalidPasswordError)

    expect(fixture.adminsRepo.items).toHaveLength(1)
    expect(fixture.adminsRepo.items[0].email.email).toEqual(
      'previous-admin@example.com',
    )
  })
})
