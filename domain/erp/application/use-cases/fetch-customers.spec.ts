import { FetchCustomersUseCase } from '@/domain/erp/application/use-cases/fetch-customers'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { NotAllowedError } from '@/core/errors/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found.error'

import { Name } from '@/domain/erp/enterprise/entities/value-objects/name'
import { Email } from '@/domain/erp/enterprise/entities/value-objects/email'

import { makePhone } from 'test/factories/make-phone'
import { makeAdmin } from 'test/factories/make-admin'
import { makeCustomer } from 'test/factories/make-customer'
import { makeAttachment } from 'test/factories/make-attachment'
import { makeCustomerVehicle } from 'test/factories/make-customer-vehicle'
import { makeVehicleBreakdown } from 'test/factories/make-vehicle-breakdown'
import { makeBreakdownAttachment } from 'test/factories/make-breakdown-attachments'

import { createDomainTestsFixture } from 'test/helpers/create-domain-test-fixture'

let fixture: ReturnType<typeof createDomainTestsFixture>

let sut: FetchCustomersUseCase

describe('Fetch customers', () => {
  beforeEach(() => {
    fixture = createDomainTestsFixture()

    sut = new FetchCustomersUseCase(
      fixture.logger,
      fixture.customersRepo,
      fixture.caslErpService,
    )
  })

  it('Should be able to fetch customers from a admin account', async () => {
    await fixture.adminsRepo.create(makeAdmin({}, new UniqueEntityID('admin')))

    const customer1 = makeCustomer(
      {
        name: Name.create({
          firstName: 'John',
          lastName: 'Doe',
          username: 'John Doe',
        }),

        email: Email.create({ email: 'john.doe@example.com' }),
      },
      new UniqueEntityID('customer-1'),
    )

    const customer2 = makeCustomer(
      {
        name: Name.create({
          firstName: 'John',
          lastName: 'Foe',
          username: 'John Foe',
        }),

        email: Email.create({ email: 'john.foe@example.com' }),
      },
      new UniqueEntityID('customer-2'),
    )

    const phone1 = makePhone(
      {
        userRole: 'CUSTOMER',
        userId: customer1.id,
        number: '123956789',
      },
      new UniqueEntityID('phone-1'),
    )

    const phone2 = makePhone(
      {
        userRole: 'CUSTOMER',
        userId: customer1.id,
      },
      new UniqueEntityID('phone-2'),
    )

    const customerVehicle1 = makeCustomerVehicle(
      {
        customerId: customer1.id,
      },
      new UniqueEntityID('vehicle-1'),
    )

    const customerVehicle2 = makeCustomerVehicle(
      {
        customerId: customer1.id,
      },
      new UniqueEntityID('vehicle-2'),
    )

    const vehicleBreakdown1 = makeVehicleBreakdown({
      vehicleId: customerVehicle1.id,
    })

    const vehicleBreakdown2 = makeVehicleBreakdown({
      vehicleId: customerVehicle1.id,
    })

    const vehicleBreakdown3 = makeVehicleBreakdown({
      vehicleId: customerVehicle2.id,
    })

    const vehicleBreakdown4 = makeVehicleBreakdown({
      vehicleId: customerVehicle2.id,
    })

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

    const attachment5 = makeAttachment({
      title: 'Attachment 5',
      url: 'https://example.com/attachment-5',
    })

    const attachment6 = makeAttachment({
      title: 'Attachment 6',
      url: 'https://example.com/attachment-6',
    })

    const attachment7 = makeAttachment({
      title: 'Attachment 7',
      url: 'https://example.com/attachment-7',
    })

    const attachment8 = makeAttachment({
      title: 'Attachment 8',
      url: 'https://example.com/attachment-8',
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

    const breakdownAttachment5 = makeBreakdownAttachment({
      attachmentId: attachment5.id,
      breakdownId: vehicleBreakdown3.id,
    })

    const breakdownAttachment6 = makeBreakdownAttachment({
      attachmentId: attachment6.id,
      breakdownId: vehicleBreakdown3.id,
    })

    const breakdownAttachment7 = makeBreakdownAttachment({
      attachmentId: attachment7.id,
      breakdownId: vehicleBreakdown4.id,
    })

    const breakdownAttachment8 = makeBreakdownAttachment({
      attachmentId: attachment8.id,
      breakdownId: vehicleBreakdown4.id,
    })

    // entities association
    customer1.phones.update([phone1, phone2])
    customer1.vehicles.update([customerVehicle1, customerVehicle2])
    customerVehicle1.breakdowns.update([vehicleBreakdown1, vehicleBreakdown2])
    customerVehicle2.breakdowns.update([vehicleBreakdown3, vehicleBreakdown4])
    vehicleBreakdown1.attachments.update([
      breakdownAttachment1,
      breakdownAttachment2,
    ])
    vehicleBreakdown2.attachments.update([
      breakdownAttachment3,
      breakdownAttachment4,
    ])
    vehicleBreakdown3.attachments.update([
      breakdownAttachment5,
      breakdownAttachment6,
    ])
    vehicleBreakdown4.attachments.update([
      breakdownAttachment7,
      breakdownAttachment8,
    ])

    // in memories adding to repository
    await fixture.attachmentsRepo.create(attachment1)
    await fixture.attachmentsRepo.create(attachment2)
    await fixture.attachmentsRepo.create(attachment3)
    await fixture.attachmentsRepo.create(attachment4)
    await fixture.attachmentsRepo.create(attachment5)
    await fixture.attachmentsRepo.create(attachment6)
    await fixture.attachmentsRepo.create(attachment7)
    await fixture.attachmentsRepo.create(attachment8)

    await fixture.customersRepo.create(customer1)
    await fixture.customersRepo.create(customer2)

    const result = await sut.execute({
      page: 1,
      limit: 10,
      currentUserId: 'admin',
    })

    expect(result.isRight()).toBe(true)
    if (result.isLeft()) throw new Error(result.value.detail)

    expect(result.value.customers).toHaveLength(2)

    // Find the customer by ID
    const customer = result.value.customers.find(
      (customer) => customer.id === customer1.id,
    )
    expect(customer).toBeDefined()

    // Basic fields
    expect(customer!.id).toBe(customer1.id)
    expect(customer!.name).toBe(customer1.name)
    expect(customer!.email).toBe(customer1.email)

    // Phones
    const phones = customer!.phones.getItems()
    expect(phones).toHaveLength(2)
    expect(phones.map((phone) => phone.number)).toEqual(
      expect.arrayContaining([phone1.number, phone2.number]),
    )

    // Vehicles
    const vehicles = customer!.vehicles.getItems()
    expect(vehicles).toHaveLength(2)

    // Vehicle 1
    const vehicle1 = vehicles.find((v) => v.plate === customerVehicle1.plate)
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
    const vehicle2 = vehicles.find((v) => v.plate === customerVehicle2.plate)
    expect(vehicle2).toBeDefined()

    const breakdowns2 = vehicle2!.breakdowns.getItems()
    expect(breakdowns2).toHaveLength(2)

    // Breakdown 1 of Vehicle 2
    const bd3 = breakdowns2.find((b) => b.id === vehicleBreakdown3.id)
    expect(bd3).toBeDefined()
    expect(bd3!.attachments.getItems().map((a) => a.id)).toEqual(
      expect.arrayContaining([
        breakdownAttachment5.id,
        breakdownAttachment6.id,
      ]),
    )

    // Breakdown 2 of Vehicle 2
    const bd4 = breakdowns2.find((b) => b.id === vehicleBreakdown4.id)
    expect(bd4).toBeDefined()
    expect(bd4!.attachments.getItems().map((a) => a.id)).toEqual(
      expect.arrayContaining([
        breakdownAttachment7.id,
        breakdownAttachment8.id,
      ]),
    )
  })

  it('Should respect the page parameter when fetching customers', async () => {
    await fixture.adminsRepo.create(makeAdmin({}, new UniqueEntityID('admin')))

    const customers = Array.from({ length: 20 }).map((_, i) =>
      makeCustomer({}, new UniqueEntityID(`customer-${i + 1}`)),
    )

    for (const customer of customers) {
      await fixture.customersRepo.create(customer)
    }

    const result = await sut.execute({
      page: 2, // should skip first 10
      limit: 10,
      currentUserId: 'admin',
    })

    expect(result.isRight()).toBe(true)
    if (result.isLeft()) throw new Error(result.value.detail)

    expect(result.value.customers).toHaveLength(10)
  })

  it('Should respect the limit parameter when fetching customers', async () => {
    await fixture.adminsRepo.create(makeAdmin({}, new UniqueEntityID('admin')))

    const customers = Array.from({ length: 5 }).map((_, i) =>
      makeCustomer({}, new UniqueEntityID(`customer-${i + 1}`)),
    )

    for (const customer of customers) {
      await fixture.customersRepo.create(customer)
    }

    const result = await sut.execute({
      page: 1,
      limit: 2, // should only return 2
      currentUserId: 'admin',
    })

    expect(result.isRight()).toBe(true)
    if (result.isLeft()) throw new Error(result.value.detail)

    expect(result.value.customers).toHaveLength(2)
  })

  it('Should not be able to fetch unexistent customers', async () => {
    await fixture.adminsRepo.create(makeAdmin({}, new UniqueEntityID('admin')))

    const result = await sut.execute({
      page: 1,
      limit: 10,
      currentUserId: 'admin',
    })

    expect(result.isRight()).toBe(false)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('Should not be able to fetch customers from another customer account', async () => {
    await fixture.customersRepo.create(
      makeCustomer({}, new UniqueEntityID('customer-1')),
    )

    await fixture.customersRepo.create(
      makeCustomer({}, new UniqueEntityID('customer-2')),
    )

    await fixture.customersRepo.create(
      makeCustomer({}, new UniqueEntityID('customer-3')),
    )

    const result = await sut.execute({
      page: 1,
      limit: 10,
      currentUserId: 'customer-1',
    })

    expect(result.isRight()).toBe(false)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })
})
