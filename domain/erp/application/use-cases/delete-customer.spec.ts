import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { NotAllowedError } from '@/core/errors/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found.error'

import { DeleteCustomerUseCase } from '@/domain/erp/application/use-cases/delete-customer'

import { makePhone } from 'test/factories/make-phone'
import { makeAdmin } from 'test/factories/make-admin'
import { makeCustomer } from 'test/factories/make-customer'
import { makeCustomerVehicle } from 'test/factories/make-customer-vehicle'
import { makeVehicleBreakdown } from 'test/factories/make-vehicle-breakdown'
import { makeBreakdownAttachment } from 'test/factories/make-breakdown-attachments'

import { createDomainTestsFixture } from 'test/helpers/create-domain-test-fixture'

let fixture: ReturnType<typeof createDomainTestsFixture>

let sut: DeleteCustomerUseCase

describe('Delete Customer', () => {
  beforeEach(() => {
    fixture = createDomainTestsFixture()

    sut = new DeleteCustomerUseCase(
      fixture.logger,
      fixture.customersRepo,
      fixture.caslErpService,
    )
  })

  it('should be able to delete a customer', async () => {
    await fixture.adminsRepo.create(
      makeAdmin({}, new UniqueEntityID('admin-1')),
    )

    await fixture.customersRepo.create(
      makeCustomer({}, new UniqueEntityID('customer-1')),
    )

    await fixture.phonesRepo.create(
      makePhone(
        {
          userRole: 'CUSTOMER',
          userId: new UniqueEntityID('customer-1'),
        },
        new UniqueEntityID('phone-1'),
      ),
    )

    await fixture.customerVehiclesRepo.create(
      makeCustomerVehicle(
        {
          customerId: new UniqueEntityID('customer-1'),
        },
        new UniqueEntityID('vehicle-1'),
      ),
    )

    await fixture.vehicleBreakdownsRepo.create(
      makeVehicleBreakdown(
        {
          ownerId: new UniqueEntityID('customer-1'),
          vehicleId: new UniqueEntityID('vehicle-1'),
        },
        new UniqueEntityID('breakdown-1'),
      ),
    )

    await fixture.breakdownAttachmentsRepo.createMany([
      makeBreakdownAttachment({
        breakdownId: new UniqueEntityID('breakdown-1'),
        attachmentId: new UniqueEntityID('attachment-1'),
      }),
    ])

    const result = await sut.execute({
      customerId: 'customer-1',
      currentUserId: 'admin-1',
    })

    expect(result.isRight()).toBe(true)
    expect(fixture.phonesRepo.items).toHaveLength(0)
    expect(fixture.customersRepo.items).toHaveLength(0)
    expect(fixture.customerVehiclesRepo.items).toHaveLength(0)
    expect(fixture.vehicleBreakdownsRepo.items).toHaveLength(0)
    expect(fixture.breakdownAttachmentsRepo.items).toHaveLength(0)
  })

  it('should not be able to delete a unexistent customer', async () => {
    await fixture.adminsRepo.create(
      makeAdmin({}, new UniqueEntityID('admin-1')),
    )

    const result = await sut.execute({
      customerId: 'unexistent-customer-id',
      currentUserId: 'admin-1',
    })

    expect(result.isRight()).toBe(false)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to delete an customer from a non admin account', async () => {
    await fixture.customersRepo.create(
      makeCustomer({}, new UniqueEntityID('customer-1')),
    )

    const result = await sut.execute({
      customerId: 'customer-1',
      currentUserId: 'customer-1',
    })

    expect(result.isRight()).toBe(false)
    expect(result.value).toBeInstanceOf(NotAllowedError)

    expect(fixture.customersRepo.items).toHaveLength(1)
  })
})
