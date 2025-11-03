import { CreatePhonesUseCase } from '@/domain/erp/application/use-cases/create-phone'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { NotAllowedError } from '@/core/errors/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found.error'

import { createDomainTestsFixture } from 'test/helpers/create-domain-test-fixture'

import { makeAdmin } from 'test/factories/make-admin'
import { makeCustomer } from 'test/factories/make-customer'

describe('Create phone', () => {
  let sut: CreatePhonesUseCase
  let fixture: ReturnType<typeof createDomainTestsFixture>

  beforeEach(() => {
    fixture = createDomainTestsFixture()

    sut = new CreatePhonesUseCase(
      fixture.logger,
      fixture.phonesRepo,
      fixture.adminsRepo,
      fixture.customersRepo,
      fixture.caslErpService,
    )
  })

  it('should be able to create a phone to a self admin', async () => {
    await fixture.adminsRepo.create(
      makeAdmin({}, new UniqueEntityID('admin-1')),
    )

    const result = await sut.execute({
      userId: 'admin-1',
      currentUserId: 'admin-1',
      type: 'MOBILE',
      number: '19912345678',
      isWhatsapp: false,
    })

    expect(result.isRight()).toBe(true)
    expect(fixture.phonesRepo.items).toHaveLength(1)
  })

  it('should be able to create a phone to a self customer', async () => {
    await fixture.customersRepo.create(
      makeCustomer({}, new UniqueEntityID('customer-1')),
    )

    const result = await sut.execute({
      userId: 'customer-1',
      currentUserId: 'customer-1',
      type: 'MOBILE',
      number: '19912345678',
      isWhatsapp: false,
    })

    expect(result.isRight()).toBe(true)
    expect(fixture.phonesRepo.items).toHaveLength(1)
  })

  it('should be able to create a phone to any customer from an admin account', async () => {
    await fixture.adminsRepo.create(
      makeAdmin({}, new UniqueEntityID('admin-1')),
    )
    await fixture.customersRepo.create(
      makeCustomer({}, new UniqueEntityID('customer-1')),
    )

    const result = await sut.execute({
      userId: 'customer-1',
      currentUserId: 'admin-1',
      type: 'MOBILE',
      number: '19912345678',
      isWhatsapp: false,
    })

    expect(result.isRight()).toBe(true)
    expect(fixture.phonesRepo.items).toHaveLength(1)
  })

  it('should not be able to create a phone to a non-existent user', async () => {
    await fixture.adminsRepo.create(
      makeAdmin({}, new UniqueEntityID('admin-1')),
    )

    const result = await sut.execute({
      userId: 'unexistent-user-id',
      currentUserId: 'admin-1',
      type: 'MOBILE',
      number: '19912345678',
      isWhatsapp: false,
    })

    expect(result.isRight()).toBe(false)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
    expect(fixture.phonesRepo.items).toHaveLength(0)
  })

  it('should not be able to create a phone to another customer', async () => {
    await fixture.customersRepo.create(
      makeCustomer({}, new UniqueEntityID('customer-1')),
    )
    await fixture.customersRepo.create(
      makeCustomer({}, new UniqueEntityID('customer-2')),
    )

    const result = await sut.execute({
      userId: 'customer-1',
      currentUserId: 'customer-2',
      type: 'MOBILE',
      number: '19912345678',
      isWhatsapp: false,
    })

    expect(result.isRight()).toBe(false)
    expect(result.value).toBeInstanceOf(NotAllowedError)
    expect(fixture.phonesRepo.items).toHaveLength(0)
  })

  it('should not be able to create a phone to another admin', async () => {
    await fixture.adminsRepo.create(
      makeAdmin({}, new UniqueEntityID('admin-1')),
    )
    await fixture.adminsRepo.create(
      makeAdmin({}, new UniqueEntityID('admin-2')),
    )

    const result = await sut.execute({
      userId: 'admin-1',
      currentUserId: 'admin-2',
      type: 'MOBILE',
      number: '19912345678',
      isWhatsapp: false,
    })

    expect(result.isRight()).toBe(false)
    expect(result.value).toBeInstanceOf(NotAllowedError)
    expect(fixture.phonesRepo.items).toHaveLength(0)
  })
})
