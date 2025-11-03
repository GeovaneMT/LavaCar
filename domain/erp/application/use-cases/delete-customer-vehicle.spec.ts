import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { NotAllowedError } from '@/core/errors/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found.error'

import { DeleteCustomerVehicleUseCase } from '@/domain/erp/application/use-cases/delete-customer-vehicle'

import { makeAdmin } from 'test/factories/make-admin'
import { makeCustomer } from 'test/factories/make-customer'
import { makeCustomerVehicle } from 'test/factories/make-customer-vehicle'
import { makeVehicleBreakdown } from 'test/factories/make-vehicle-breakdown'

import { createDomainTestsFixture } from 'test/helpers/create-domain-test-fixture'

let fixture: ReturnType<typeof createDomainTestsFixture>

let sut: DeleteCustomerVehicleUseCase

describe('Delete Vehicle', () => {
  beforeEach(() => {
    fixture = createDomainTestsFixture()

    sut = new DeleteCustomerVehicleUseCase(
      fixture.logger,
      fixture.caslErpService,
      fixture.customerVehiclesRepo,
    )
  })

  it('should be able to delete a vehicle', async () => {
    await fixture.adminsRepo.create(
      makeAdmin({}, new UniqueEntityID('admin-1')),
    )

    await fixture.customersRepo.create(
      makeCustomer({}, new UniqueEntityID('customer-1')),
    )

    await fixture.customerVehiclesRepo.create(
      makeCustomerVehicle(
        {
          customerId: new UniqueEntityID('customer-1'),
        },
        new UniqueEntityID('vehicle-1'),
      ),
    )

    fixture.vehicleBreakdownsRepo.items.push(
      makeVehicleBreakdown(
        {
          vehicleId: new UniqueEntityID('vehicle-1'),
        },
        new UniqueEntityID('breakdown-1'),
      ),

      makeVehicleBreakdown(
        {
          vehicleId: new UniqueEntityID('vehicle-1'),
        },
        new UniqueEntityID('breakdown-2'),
      ),
    )

    const result = await sut.execute({
      vehicleId: 'vehicle-1',
      currentUserId: 'admin-1',
    })

    if (result.isLeft()) {
      throw result.value
    }

    expect(result.isRight()).toBe(true)
    expect(fixture.customerVehiclesRepo.items).toHaveLength(0)
    expect(fixture.vehicleBreakdownsRepo.items).toHaveLength(0)
  })

  it('should not be able to delete a unexisting vehicle', async () => {
    await fixture.adminsRepo.create(
      makeAdmin({}, new UniqueEntityID('admin-1')),
    )

    await fixture.customersRepo.create(
      makeCustomer({}, new UniqueEntityID('customer-1')),
    )

    const result = await sut.execute({
      vehicleId: 'unexistent-vehicle-id',
      currentUserId: 'admin-1',
    })

    expect(result.isRight()).toBe(false)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to delete a vehicle from a non admin account', async () => {
    await fixture.customersRepo.create(
      makeCustomer({}, new UniqueEntityID('customer-1')),
    )

    await fixture.customerVehiclesRepo.create(
      makeCustomerVehicle(
        {
          customerId: new UniqueEntityID('customer-1'),
        },
        new UniqueEntityID('vehicle-1'),
      ),
    )

    const result = await sut.execute({
      vehicleId: 'vehicle-1',
      currentUserId: 'customer-1',
    })

    expect(result.isRight()).toBe(false)
    expect(result.value).toBeInstanceOf(NotAllowedError)

    expect(fixture.customerVehiclesRepo.items).toHaveLength(1)
  })
})
