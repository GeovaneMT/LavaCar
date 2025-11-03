import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { NotAllowedError } from '@/core/errors/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found.error'

import { DeleteVehicleBreakdownUseCase } from '@/domain/erp/application/use-cases/delete-vehicle-breakdown'

import { makeAdmin } from 'test/factories/make-admin'
import { makeVehicleBreakdown } from 'test/factories/make-vehicle-breakdown'
import { makeBreakdownAttachment } from 'test/factories/make-breakdown-attachments'

import { createDomainTestsFixture } from 'test/helpers/create-domain-test-fixture'
import { makeCustomer } from 'test/factories/make-customer'

let fixture: ReturnType<typeof createDomainTestsFixture>

let sut: DeleteVehicleBreakdownUseCase

describe('Delete Customer', () => {
  beforeEach(() => {
    fixture = createDomainTestsFixture()

    sut = new DeleteVehicleBreakdownUseCase(
      fixture.logger,
      fixture.caslErpService,
      fixture.vehicleBreakdownsRepo,
    )
  })

  it('should be able to delete a vehicle breakdown from a admin account', async () => {
    await fixture.adminsRepo.create(
      makeAdmin({}, new UniqueEntityID('admin-1')),
    )

    await fixture.vehicleBreakdownsRepo.create(
      makeVehicleBreakdown(
        {
          ownerId: new UniqueEntityID('admin-1'),
          vehicleId: new UniqueEntityID('vehicle-1'),
        },
        new UniqueEntityID('vehicleBreakdown-1'),
      ),
    )

    fixture.breakdownAttachmentsRepo.items.push(
      makeBreakdownAttachment(
        {
          breakdownId: new UniqueEntityID('vehicleBreakdown-1'),
        },
        new UniqueEntityID('attachment-1'),
      ),

      makeBreakdownAttachment(
        {
          breakdownId: new UniqueEntityID('vehicleBreakdown-1'),
        },
        new UniqueEntityID('attachment-2'),
      ),
    )

    const result = await sut.execute({
      breakdownId: 'vehicleBreakdown-1',
      currentUserId: 'admin-1',
    })

    expect(result.isRight()).toBe(true)
    expect(fixture.vehicleBreakdownsRepo.items).toHaveLength(0)
    expect(fixture.breakdownAttachmentsRepo.items).toHaveLength(0)
  })

  it('should not be able to delete a breakdown from a non admin account', async () => {
    await fixture.customersRepo.create(
      makeCustomer({}, new UniqueEntityID('customer-1')),
    )

    await fixture.vehicleBreakdownsRepo.create(
      makeVehicleBreakdown(
        {
          ownerId: new UniqueEntityID('customer-1'),
          vehicleId: new UniqueEntityID('vehicle-1'),
        },
        new UniqueEntityID('vehicleBreakdown-1'),
      ),
    )

    fixture.breakdownAttachmentsRepo.items.push(
      makeBreakdownAttachment(
        {
          breakdownId: new UniqueEntityID('vehicleBreakdown-1'),
        },
        new UniqueEntityID('attachment-1'),
      ),

      makeBreakdownAttachment(
        {
          breakdownId: new UniqueEntityID('vehicleBreakdown-1'),
        },
        new UniqueEntityID('attachment-2'),
      ),
    )

    const result = await sut.execute({
      breakdownId: 'vehicleBreakdown-1',
      currentUserId: 'customer-1',
    })

    expect(result.isRight()).toBe(false)
    expect(result.value).toBeInstanceOf(NotAllowedError)

    expect(fixture.vehicleBreakdownsRepo.items).toHaveLength(1)
    expect(fixture.breakdownAttachmentsRepo.items).toHaveLength(2)
  })

  it('should not be able to delete a unexistent breakdown', async () => {
    await fixture.adminsRepo.create(
      makeAdmin({}, new UniqueEntityID('admin-1')),
    )

    const result = await sut.execute({
      breakdownId: 'unexistent vehicle breakdown id',
      currentUserId: 'admin-1',
    })

    expect(result.isRight()).toBe(false)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
