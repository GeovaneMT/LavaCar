import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { EditVehicleBreakdownUseCase } from '@/domain/erp/application/use-cases/edit-vehicle-breakdown'

import { NotAllowedError } from '@/core/errors/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found.error'

import { makeAdmin } from 'test/factories/make-admin'
import { makeVehicleBreakdown } from 'test/factories/make-vehicle-breakdown'
import { makeBreakdownAttachment } from 'test/factories/make-breakdown-attachments'

import { createDomainTestsFixture } from 'test/helpers/create-domain-test-fixture'
import { makeCustomer } from 'test/factories/make-customer'

let fixture: ReturnType<typeof createDomainTestsFixture>

let sut: EditVehicleBreakdownUseCase

describe('Edit breakdown', () => {
  beforeEach(() => {
    fixture = createDomainTestsFixture()

    sut = new EditVehicleBreakdownUseCase(
      fixture.logger,
      fixture.caslErpService,
      fixture.vehicleBreakdownsRepo,
    )
  })

  it('should be able to edit a breakdown', async () => {
    await fixture.adminsRepo.create(
      makeAdmin({}, new UniqueEntityID('admin-1')),
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

    fixture.breakdownAttachmentsRepo.items.push(
      makeBreakdownAttachment({
        breakdownId: new UniqueEntityID('breakdown-1'),
        attachmentId: new UniqueEntityID('attachment-1'),
      }),
      makeBreakdownAttachment({
        breakdownId: new UniqueEntityID('breakdown-1'),
        attachmentId: new UniqueEntityID('attachment-2'),
      }),
    )

    const result = await sut.execute({
      currentUserId: 'admin-1',
      breakdownId: 'breakdown-1',
      description: 'Conteúdo teste',
      attachmentsIds: ['attachment-1', 'attachment-3'],
    })

    expect(result.isRight()).toBe(true)

    expect(fixture.breakdownAttachmentsRepo.items).toHaveLength(2)
    expect(fixture.breakdownAttachmentsRepo.items).toEqual([
      expect.objectContaining({
        attachmentId: new UniqueEntityID('attachment-1'),
      }),
      expect.objectContaining({
        attachmentId: new UniqueEntityID('attachment-3'),
      }),
    ])
  })

  it('should not be able to edit a unexistent breakdown', async () => {
    await fixture.adminsRepo.create(
      makeAdmin({}, new UniqueEntityID('admin-1')),
    )

    const result = await sut.execute({
      currentUserId: 'admin-1',
      breakdownId: 'unexistent-vehicle-breakdown-id',
      description: 'Conteúdo teste',
      attachmentsIds: ['attachment-1', 'attachment-3'],
    })

    expect(result.isRight()).toBe(false)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to edit a breakdown from a non admin account', async () => {
    await fixture.customersRepo.create(
      makeCustomer({}, new UniqueEntityID('customer-1')),
    )

    await fixture.vehicleBreakdownsRepo.create(
      makeVehicleBreakdown(
        {
          description: 'Old description',
          ownerId: new UniqueEntityID('customer-1'),
          vehicleId: new UniqueEntityID('vehicle-1'),
        },
        new UniqueEntityID('breakdown-1'),
      ),
    )

    fixture.breakdownAttachmentsRepo.items.push(
      makeBreakdownAttachment({
        breakdownId: new UniqueEntityID('breakdown-1'),
        attachmentId: new UniqueEntityID('attachment-1'),
      }),
      makeBreakdownAttachment({
        breakdownId: new UniqueEntityID('breakdown-1'),
        attachmentId: new UniqueEntityID('attachment-2'),
      }),
    )

    const result = await sut.execute({
      currentUserId: 'customer-1',
      breakdownId: 'breakdown-1',
      description: 'Conteúdo teste',
      attachmentsIds: ['attachment-1', 'attachment-3'],
    })

    expect(result.isRight()).toBe(false)
    expect(result.value).toBeInstanceOf(NotAllowedError)

    expect(fixture.vehicleBreakdownsRepo.items[0].description).toBe(
      'Old description',
    )

    expect(fixture.breakdownAttachmentsRepo.items).toHaveLength(2)
    expect(fixture.breakdownAttachmentsRepo.items).toEqual([
      expect.objectContaining({
        attachmentId: new UniqueEntityID('attachment-1'),
      }),
      expect.objectContaining({
        attachmentId: new UniqueEntityID('attachment-2'),
      }),
    ])
  })

  it('should not be able to edit a breakdown with a non admin account', async () => {
    await fixture.customersRepo.create(
      makeCustomer({}, new UniqueEntityID('customer-1')),
    )

    await fixture.customersRepo.create(
      makeCustomer({}, new UniqueEntityID('customer-2')),
    )

    await fixture.vehicleBreakdownsRepo.create(
      makeVehicleBreakdown(
        {
          description: 'Old description',
          ownerId: new UniqueEntityID('customer-1'),
          vehicleId: new UniqueEntityID('vehicle-1'),
        },
        new UniqueEntityID('breakdown-1'),
      ),
    )

    fixture.breakdownAttachmentsRepo.items.push(
      makeBreakdownAttachment({
        breakdownId: new UniqueEntityID('breakdown-1'),
        attachmentId: new UniqueEntityID('attachment-1'),
      }),
      makeBreakdownAttachment({
        breakdownId: new UniqueEntityID('breakdown-1'),
        attachmentId: new UniqueEntityID('attachment-2'),
      }),
    )

    const result = await sut.execute({
      currentUserId: 'customer-2',
      breakdownId: 'breakdown-1',
      description: 'Conteúdo teste',
      attachmentsIds: ['attachment-1', 'attachment-3'],
    })

    expect(result.isRight()).toBe(false)
    expect(result.value).toBeInstanceOf(NotAllowedError)

    expect(fixture.vehicleBreakdownsRepo.items[0].description).toBe(
      'Old description',
    )

    expect(fixture.breakdownAttachmentsRepo.items).toHaveLength(2)
    expect(fixture.breakdownAttachmentsRepo.items).toEqual([
      expect.objectContaining({
        attachmentId: new UniqueEntityID('attachment-1'),
      }),
      expect.objectContaining({
        attachmentId: new UniqueEntityID('attachment-2'),
      }),
    ])
  })
})
