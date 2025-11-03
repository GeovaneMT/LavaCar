import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { NotAllowedError } from '@/core/errors/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found.error'

import { FetchCustomerVehiclesUseCase } from '@/domain/erp/application/use-cases/fetch-customer-vehicles'

import { makeAdmin } from 'test/factories/make-admin'
import { makeCustomer } from 'test/factories/make-customer'
import { makeAttachment } from 'test/factories/make-attachment'
import { makeCustomerVehicle } from 'test/factories/make-customer-vehicle'
import { makeVehicleBreakdown } from 'test/factories/make-vehicle-breakdown'
import { makeBreakdownAttachment } from 'test/factories/make-breakdown-attachments'

import { createDomainTestsFixture } from 'test/helpers/create-domain-test-fixture'

let fixture: ReturnType<typeof createDomainTestsFixture>

let sut: FetchCustomerVehiclesUseCase

describe('Fetch customerVehicles', () => {
  beforeEach(() => {
    fixture = createDomainTestsFixture()

    sut = new FetchCustomerVehiclesUseCase(
      fixture.logger,
      fixture.caslErpService,
      fixture.customerVehiclesRepo,
    )
  })

  it('Should be able to fetch customerVehicles from a admin account', async () => {
    await fixture.adminsRepo.create(makeAdmin({}, new UniqueEntityID('admin')))

    await fixture.customersRepo.create(
      makeCustomer({}, new UniqueEntityID('customer')),
    )

    const customerVehicle1 = makeCustomerVehicle(
      {
        customerId: new UniqueEntityID('customer'),
      },
      new UniqueEntityID('vehicle-0001'),
    )

    const customerVehicle2 = makeCustomerVehicle(
      {
        customerId: new UniqueEntityID('customer'),
      },
      new UniqueEntityID('vehicle-0002'),
    )

    const vehicleBreakdown1 = makeVehicleBreakdown(
      {
        vehicleId: customerVehicle1.id,
        description: 'Breakdown description 1',
      },
      new UniqueEntityID('breakdown-0001'),
    )

    const vehicleBreakdown2 = makeVehicleBreakdown(
      {
        vehicleId: customerVehicle1.id,
        description: 'Breakdown description 2',
      },
      new UniqueEntityID('breakdown-0002'),
    )

    const attachment1 = makeAttachment({
      title: 'Attachment 1',
      url: 'https://example.com/attachment-1',
    })

    const attachment2 = makeAttachment({
      title: 'Attachment 2',
      url: 'https://example.com/attachment-2',
    })

    const attachment3 = makeAttachment({
      title: 'Attachment 3',
      url: 'https://example.com/attachment-3',
    })

    const attachment4 = makeAttachment({
      title: 'Attachment 4',
      url: 'https://example.com/attachment-4',
    })

    const breakdownAttachment1 = makeBreakdownAttachment({
      attachmentId: attachment1.id,
      breakdownId: vehicleBreakdown1.id,
    })

    const breakdownAttachment2 = makeBreakdownAttachment({
      attachmentId: attachment2.id,
      breakdownId: vehicleBreakdown1.id,
    })

    const breakdownAttachment3 = makeBreakdownAttachment({
      attachmentId: attachment3.id,
      breakdownId: vehicleBreakdown2.id,
    })

    const breakdownAttachment4 = makeBreakdownAttachment({
      attachmentId: attachment4.id,
      breakdownId: vehicleBreakdown2.id,
    })

    // entities association
    customerVehicle1.breakdowns.update([vehicleBreakdown1, vehicleBreakdown2])
    vehicleBreakdown1.attachments.update([
      breakdownAttachment1,
      breakdownAttachment2,
    ])
    vehicleBreakdown2.attachments.update([
      breakdownAttachment3,
      breakdownAttachment4,
    ])

    await fixture.attachmentsRepo.create(attachment1)
    await fixture.attachmentsRepo.create(attachment2)
    await fixture.attachmentsRepo.create(attachment3)
    await fixture.attachmentsRepo.create(attachment4)

    await fixture.customerVehiclesRepo.createMany([
      customerVehicle1,
      customerVehicle2,
    ])

    const result = await sut.execute({
      page: 1,
      limit: 10,
      currentUserId: 'admin',
    })

    expect(result.isRight()).toBe(true)
    if (result.isLeft()) throw new Error(result.value.detail)

    expect(result.value.customerVehicles).toHaveLength(2)

    // Vehicles
    const vehicles = result.value.customerVehicles
    expect(vehicles).toHaveLength(2)

    // Vehicle 1
    const vehicle1 = vehicles.find((v) => v.id === customerVehicle1.id)
    expect(vehicle1).toBeDefined()

    const breakdowns1 = vehicle1!.breakdowns.getItems()
    expect(breakdowns1).toHaveLength(2)

    // Breakdown 1 of Vehicle 1
    const bd1 = breakdowns1.find((b) => b.id === vehicleBreakdown1.id)
    expect(bd1).toBeDefined()
    expect(bd1!.attachments.getItems().map((a) => a.id)).toEqual(
      expect.arrayContaining([
        breakdownAttachment1.id,
        breakdownAttachment2.id,
      ]),
    )

    // Breakdown 2 of Vehicle 1
    const bd2 = breakdowns1.find((b) => b.id === vehicleBreakdown2.id)
    expect(bd2).toBeDefined()
    expect(bd2!.attachments.getItems().map((a) => a.id)).toEqual(
      expect.arrayContaining([
        breakdownAttachment3.id,
        breakdownAttachment4.id,
      ]),
    )

    // Vehicle 2
    const vehicle2 = vehicles.find((v) => v.id === customerVehicle2.id)
    expect(vehicle2).toBeDefined()

    const breakdowns2 = vehicle2!.breakdowns.getItems()
    expect(breakdowns2).toHaveLength(0)
  })

  it('Should respect the page parameter when fetching customerVehicles', async () => {
    await fixture.adminsRepo.create(makeAdmin({}, new UniqueEntityID('admin')))

    await fixture.customersRepo.create(
      makeCustomer({}, new UniqueEntityID('customer')),
    )

    const vehicles = Array.from({ length: 20 }).map((_, i) =>
      makeCustomerVehicle(
        {
          customerId: new UniqueEntityID('customer'),
        },
        new UniqueEntityID(`vehicle-${i + 1}`),
      ),
    )

    for (const vehicle of vehicles) {
      await fixture.customerVehiclesRepo.create(vehicle)
    }

    const result = await sut.execute({
      page: 2, // should skip first 10
      limit: 10,
      currentUserId: 'admin',
    })

    expect(result.isRight()).toBe(true)
    if (result.isLeft()) throw new Error(result.value.detail)

    expect(result.value.customerVehicles).toHaveLength(10)
  })

  it('Should respect the limit parameter when fetching customerVehicles', async () => {
    await fixture.adminsRepo.create(makeAdmin({}, new UniqueEntityID('admin')))

    await fixture.customersRepo.create(
      makeCustomer({}, new UniqueEntityID('customer')),
    )

    const vehicles = Array.from({ length: 5 }).map((_, i) =>
      makeCustomerVehicle(
        {
          customerId: new UniqueEntityID('customer'),
        },
        new UniqueEntityID(`vehicle-${i + 1}`),
      ),
    )

    for (const vehicle of vehicles) {
      await fixture.customerVehiclesRepo.create(vehicle)
    }

    const result = await sut.execute({
      page: 1,
      limit: 2, // should only return 2
      currentUserId: 'admin',
    })

    expect(result.isRight()).toBe(true)
    if (result.isLeft()) throw new Error(result.value.detail)

    expect(result.value.customerVehicles).toHaveLength(2)
  })

  it('Should not be able to fetch unexistent customerVehicles', async () => {
    await fixture.adminsRepo.create(makeAdmin({}, new UniqueEntityID('admin')))

    await fixture.customersRepo.create(
      makeCustomer({}, new UniqueEntityID('customer')),
    )

    const result = await sut.execute({
      page: 1,
      limit: 10,
      currentUserId: 'admin',
    })

    expect(result.isRight()).toBe(false)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('Should not be able to fetch customerVehicles from another customer account', async () => {
    await fixture.customersRepo.create(
      makeCustomer({}, new UniqueEntityID('customer-1')),
    )

    await fixture.customersRepo.create(
      makeCustomer({}, new UniqueEntityID('customer-2')),
    )

    await fixture.customerVehiclesRepo.create(
      makeCustomerVehicle({
        customerId: new UniqueEntityID('customer-1'),
      }),
    )

    const result = await sut.execute({
      page: 1,
      limit: 10,
      currentUserId: 'customer-2',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })
})
