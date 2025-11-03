import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { NotAllowedError } from '@/core/errors/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found.error'

import { CreateVehicleBreakdownsUseCase } from '@/domain/erp/application/use-cases/create-vehicle-breakdown'

import { makeAdmin } from 'test/factories/make-admin'
import { makeCustomer } from 'test/factories/make-customer'
import { makeAttachment } from 'test/factories/make-attachment'
import { makeCustomerVehicle } from 'test/factories/make-customer-vehicle'

import { createDomainTestsFixture } from 'test/helpers/create-domain-test-fixture'

let sut: CreateVehicleBreakdownsUseCase
let fixture: ReturnType<typeof createDomainTestsFixture>

describe('Create Breakdown', () => {
  beforeEach(() => {
    fixture = createDomainTestsFixture()

    sut = new CreateVehicleBreakdownsUseCase(
      fixture.logger,
      fixture.caslErpService,
      fixture.attachmentsRepo,
      fixture.customerVehiclesRepo,
      fixture.vehicleBreakdownsRepo,
    )
  })

  it('should be able to create a breakdown', async () => {
    await fixture.adminsRepo.create(
      makeAdmin({}, new UniqueEntityID('admin-1')),
    )

    await fixture.customerVehiclesRepo.create(
      makeCustomerVehicle(
        {
          customerId: new UniqueEntityID('customer-1'),
        },
        new UniqueEntityID('vehicle-1'),
      ),
    )

    await fixture.attachmentsRepo.createMany([
      makeAttachment(
        {
          title: 'Attachment 1',
          url: 'https://example.com/attachment-1',
        },
        new UniqueEntityID('attachment-1'),
      ),
      makeAttachment(
        {
          title: 'Attachment 2',
          url: 'https://example.com/attachment-2',
        },
        new UniqueEntityID('attachment-2'),
      ),
    ])

    const result = await sut.execute({
      currentUserId: 'admin-1',
      vehicleId: 'vehicle-1',
      description: 'Conteúdo da descrição',
      attachmentsIds: ['attachment-1', 'attachment-2'],
    })

    expect(result.isRight()).toBe(true)
    expect(
      fixture.vehicleBreakdownsRepo.items[0].attachments.currentItems,
    ).toHaveLength(2)
    expect(
      fixture.vehicleBreakdownsRepo.items[0].attachments.currentItems,
    ).toEqual([
      expect.objectContaining({
        attachmentId: new UniqueEntityID('attachment-1'),
      }),
      expect.objectContaining({
        attachmentId: new UniqueEntityID('attachment-2'),
      }),
    ])
  })

  it('should not be able to create a breakdown for a unexisting vehicle', async () => {
    await fixture.customersRepo.create(
      makeCustomer({}, new UniqueEntityID('customer-1')),
    )

    const result = await sut.execute({
      currentUserId: 'customer-1',
      vehicleId: 'unexisting-vehicle-id',
      description: 'Conteúdo da descrição',
      attachmentsIds: ['1', '2'],
    })

    expect(result.isRight()).toBe(false)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
    expect(fixture.vehicleBreakdownsRepo.items).toHaveLength(0)
  })

  it('should not be able to create a breakdown if target attachments does not exists', async () => {
    await fixture.adminsRepo.create(
      makeAdmin({}, new UniqueEntityID('admin-1')),
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
      currentUserId: 'admin-1',
      vehicleId: 'vehicle-1',
      description: 'Conteúdo da descrição',
      attachmentsIds: [
        'unexisting-attachment-id-1',
        'unexisting-attachment-id-2',
      ],
    })

    expect(result.isRight()).toBe(false)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
    expect(fixture.vehicleBreakdownsRepo.items).toHaveLength(0)
  })

  it('should not be able to create a breakdown to another customer', async () => {
    await fixture.customersRepo.create(
      makeCustomer({}, new UniqueEntityID('customer-1')),
    )

    await fixture.customersRepo.create(
      makeCustomer({}, new UniqueEntityID('customer-2')),
    )

    await fixture.customerVehiclesRepo.create(
      makeCustomerVehicle(
        {
          customerId: new UniqueEntityID('customer-2'),
        },
        new UniqueEntityID('vehicle-1'),
      ),
    )

    const result = await sut.execute({
      currentUserId: 'customer-1',
      vehicleId: 'vehicle-1',
      description: 'Conteúdo da descrição',
      attachmentsIds: ['1', '2'],
    })

    expect(result.isRight()).toBe(false)
    expect(result.value).toBeInstanceOf(NotAllowedError)
    expect(fixture.vehicleBreakdownsRepo.items).toHaveLength(0)
  })
})
