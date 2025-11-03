import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { NotAllowedError } from '@/core/errors/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found.error'

import { DeletePhoneUseCase } from '@/domain/erp/application/use-cases/delete-phone'

import { makePhone } from 'test/factories/make-phone'
import { makeAdmin } from 'test/factories/make-admin'
import { makeCustomer } from 'test/factories/make-customer'

import { createDomainTestsFixture } from 'test/helpers/create-domain-test-fixture'

let fixture: ReturnType<typeof createDomainTestsFixture>

let sut: DeletePhoneUseCase

describe('Delete Phone', () => {
  beforeEach(() => {
    fixture = createDomainTestsFixture()

    sut = new DeletePhoneUseCase(
      fixture.logger,
      fixture.phonesRepo,
      fixture.caslErpService,
    )
  })

  it('should be able to delete a admin phone', async () => {
    await fixture.adminsRepo.create(
      makeAdmin({}, new UniqueEntityID('admin-1')),
    )

    await fixture.phonesRepo.create(
      makePhone(
        { userId: new UniqueEntityID('admin-1'), userRole: 'ADMIN' },
        new UniqueEntityID('phone-1'),
      ),
    )

    const result = await sut.execute({
      phoneId: 'phone-1',
      currentUserId: 'admin-1',
    })

    expect(result.isRight()).toBe(true)

    expect(fixture.phonesRepo.items).toHaveLength(0)
  })

  it('should be able to delete a self customer phone', async () => {
    await fixture.customersRepo.create(
      makeCustomer({}, new UniqueEntityID('customer-1')),
    )

    await fixture.phonesRepo.create(
      makePhone(
        { userId: new UniqueEntityID('customer-1'), userRole: 'CUSTOMER' },
        new UniqueEntityID('phone-1'),
      ),
    )

    const result = await sut.execute({
      phoneId: 'phone-1',
      currentUserId: 'customer-1',
    })

    expect(result.isRight()).toBe(true)
    expect(fixture.phonesRepo.items).toHaveLength(0)
  })

  it('should be able to delete a customer phone from admin account', async () => {
    await fixture.adminsRepo.create(
      makeAdmin({}, new UniqueEntityID('admin-1')),
    )

    await fixture.customersRepo.create(
      makeCustomer({}, new UniqueEntityID('customer-1')),
    )

    await fixture.phonesRepo.create(
      makePhone(
        { userId: new UniqueEntityID('customer-1'), userRole: 'CUSTOMER' },
        new UniqueEntityID('phone-1'),
      ),
    )

    const result = await sut.execute({
      phoneId: 'phone-1',
      currentUserId: 'admin-1',
    })

    expect(result.isRight()).toBe(true)
    expect(fixture.phonesRepo.items).toHaveLength(0)
  })

  it('should not be able to delete a unexistent phone', async () => {
    await fixture.customersRepo.create(
      makeCustomer({}, new UniqueEntityID('customer-1')),
    )

    const result = await sut.execute({
      phoneId: 'unexistent-phone-id',
      currentUserId: 'customer-1',
    })

    expect(result.isRight()).toBe(false)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to delete another admin phone', async () => {
    await fixture.adminsRepo.create(
      makeAdmin({}, new UniqueEntityID('admin-1')),
    )

    await fixture.adminsRepo.create(
      makeAdmin({}, new UniqueEntityID('admin-2')),
    )

    await fixture.phonesRepo.create(
      makePhone(
        { userId: new UniqueEntityID('admin-1'), userRole: 'ADMIN' },
        new UniqueEntityID('phone-1'),
      ),
    )

    const result = await sut.execute({
      phoneId: 'phone-1',
      currentUserId: 'admin-2',
    })

    expect(result.isRight()).toBe(false)
    expect(result.value).toBeInstanceOf(NotAllowedError)

    expect(fixture.phonesRepo.items).toHaveLength(1)
  })

  it('should not be able to delete another customer phone', async () => {
    await fixture.customersRepo.create(
      makeCustomer({}, new UniqueEntityID('customer-1')),
    )

    await fixture.customersRepo.create(
      makeCustomer({}, new UniqueEntityID('customer-2')),
    )

    await fixture.phonesRepo.create(
      makePhone(
        { userId: new UniqueEntityID('customer-1'), userRole: 'CUSTOMER' },
        new UniqueEntityID('phone-1'),
      ),
    )

    const result = await sut.execute({
      phoneId: 'phone-1',
      currentUserId: 'customer-2',
    })

    expect(result.isRight()).toBe(false)
    expect(result.value).toBeInstanceOf(NotAllowedError)

    expect(fixture.phonesRepo.items).toHaveLength(1)
  })
})
