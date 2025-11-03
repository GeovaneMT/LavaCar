import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { NotAllowedError } from '@/core/errors/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found.error'

import { Email } from '@/domain/erp/enterprise/entities/value-objects/email'

import { GetCustomerByEmailUseCase } from '@/domain/erp/application/use-cases/get-customer-by-email'

import { makePhone } from 'test/factories/make-phone'
import { makeAdmin } from 'test/factories/make-admin'
import { makeCustomer } from 'test/factories/make-customer'
import { makeAttachment } from 'test/factories/make-attachment'
import { makeCustomerVehicle } from 'test/factories/make-customer-vehicle'
import { makeVehicleBreakdown } from 'test/factories/make-vehicle-breakdown'
import { makeBreakdownAttachment } from 'test/factories/make-breakdown-attachments'

import { createDomainTestsFixture } from 'test/helpers/create-domain-test-fixture'

let fixture: ReturnType<typeof createDomainTestsFixture>

let sut: GetCustomerByEmailUseCase

// customers MUST HAVE VEHICLES

describe('Get Customer By Email', () => {
  beforeEach(() => {
    fixture = createDomainTestsFixture()

    sut = new GetCustomerByEmailUseCase(
      fixture.logger,
      fixture.customersRepo,
      fixture.caslErpService,
    )
  })

  it('Should be able to get a customer by email from a admin account', async () => {
    await fixture.adminsRepo.create(
      makeAdmin({}, new UniqueEntityID('admin-1')),
    )

    const newCustomer = makeCustomer(
      {
        email: Email.create({ email: 'john.doe@example.com' }),
      },
      new UniqueEntityID('customer-1'),
    )

    const phone1 = makePhone(
      {
        userRole: 'CUSTOMER',
        userId: newCustomer.id,
        number: '123956789',
      },
      new UniqueEntityID('phone-1'),
    )

    const phone2 = makePhone(
      {
        userRole: 'CUSTOMER',
        userId: newCustomer.id,
      },
      new UniqueEntityID('phone-2'),
    )

    const customerVehicle1 = makeCustomerVehicle(
      {
        customerId: newCustomer.id,
      },
      new UniqueEntityID('vehicle-1'),
    )

    const customerVehicle2 = makeCustomerVehicle(
      {
        customerId: newCustomer.id,
      },
      new UniqueEntityID('vehicle-2'),
    )

    const vehicleBreakdown1 = makeVehicleBreakdown(
      {
        vehicleId: customerVehicle1.id,
      },
      new UniqueEntityID('breakdown-1'),
    )

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
    newCustomer.phones.update([phone1, phone2])
    newCustomer.vehicles.update([customerVehicle1, customerVehicle2])
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

    await fixture.attachmentsRepo.create(attachment1)
    await fixture.attachmentsRepo.create(attachment2)
    await fixture.attachmentsRepo.create(attachment3)
    await fixture.attachmentsRepo.create(attachment4)
    await fixture.attachmentsRepo.create(attachment5)
    await fixture.attachmentsRepo.create(attachment6)
    await fixture.attachmentsRepo.create(attachment7)
    await fixture.attachmentsRepo.create(attachment8)

    await fixture.customersRepo.create(newCustomer)

    const result = await sut.execute({
      email: 'john.doe@example.com',
      currentUserId: 'admin-1',
    })

    expect(result.isRight()).toBe(true)
    if (result.isLeft()) throw result.value

    const customer = result.value.customerDetails
    expect(customer.customerId).toBe(newCustomer.id)
    expect(customer.name).toBe(newCustomer.name)
    expect(customer.email).toBe(newCustomer.email)

    // Phones
    expect(customer.phones).toHaveLength(2)
    expect(customer.phones.map((p) => p.number)).toEqual(
      expect.arrayContaining([phone1.number, phone2.number]),
    )

    // Vehicles
    expect(customer.vehiclesDetails).toHaveLength(2)

    // Vehicle 1
    const vehicle1 = customer.vehiclesDetails.find(
      (v) => v.plate === customerVehicle1.plate,
    )
    expect(vehicle1).toBeDefined()

    const breakdowns1 = vehicle1!.breakdownDetails
    expect(breakdowns1).toHaveLength(2)

    // Breakdown 1 of Vehicle 1
    const bd1 = breakdowns1.find((b) => b.breakdownId === vehicleBreakdown1.id)
    expect(bd1).toBeDefined()
    expect(bd1!.attachments.map((a) => a.id)).toEqual(
      expect.arrayContaining([
        breakdownAttachment1.attachmentId,
        breakdownAttachment2.attachmentId,
      ]),
    )

    // Breakdown 2 of Vehicle 1
    const bd2 = breakdowns1.find((b) => b.breakdownId === vehicleBreakdown2.id)
    expect(bd2).toBeDefined()
    expect(bd2!.attachments.map((a) => a.id)).toEqual(
      expect.arrayContaining([
        breakdownAttachment3.attachmentId,
        breakdownAttachment4.attachmentId,
      ]),
    )

    // Vehicle 2
    const vehicle2 = customer.vehiclesDetails.find(
      (v) => v.plate === customerVehicle2.plate,
    )
    expect(vehicle2).toBeDefined()

    const breakdowns2 = vehicle2!.breakdownDetails
    expect(breakdowns2).toHaveLength(2)

    // Breakdown 1 of Vehicle 2
    const bd3 = breakdowns2.find((b) => b.breakdownId === vehicleBreakdown3.id)
    expect(bd3).toBeDefined()
    expect(bd3!.attachments.map((a) => a.id)).toEqual(
      expect.arrayContaining([
        breakdownAttachment5.attachmentId,
        breakdownAttachment6.attachmentId,
      ]),
    )

    // Breakdown 2 of Vehicle 2
    const bd4 = breakdowns2.find((b) => b.breakdownId === vehicleBreakdown4.id)
    expect(bd4).toBeDefined()
    expect(bd4!.attachments.map((a) => a.id)).toEqual(
      expect.arrayContaining([
        breakdownAttachment7.attachmentId,
        breakdownAttachment8.attachmentId,
      ]),
    )
  })

  it('Should be able to get a self customer by email from a self account', async () => {
    const newCustomer = makeCustomer(
      {
        email: Email.create({ email: 'john.doe@example.com' }),
      },
      new UniqueEntityID('customer-1'),
    )

    const phone1 = makePhone(
      {
        userRole: 'CUSTOMER',
        userId: newCustomer.id,
        number: '123956789',
      },
      new UniqueEntityID('phone-1'),
    )

    const phone2 = makePhone(
      {
        userRole: 'CUSTOMER',
        userId: newCustomer.id,
      },
      new UniqueEntityID('phone-2'),
    )

    const customerVehicle1 = makeCustomerVehicle(
      {
        customerId: newCustomer.id,
      },
      new UniqueEntityID('vehicle-1'),
    )

    const customerVehicle2 = makeCustomerVehicle(
      {
        customerId: newCustomer.id,
      },
      new UniqueEntityID('vehicle-2'),
    )

    const vehicleBreakdown1 = makeVehicleBreakdown(
      {
        vehicleId: customerVehicle1.id,
      },
      new UniqueEntityID('breakdown-1'),
    )

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
    newCustomer.phones.update([phone1, phone2])
    newCustomer.vehicles.update([customerVehicle1, customerVehicle2])
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

    await fixture.attachmentsRepo.create(attachment1)
    await fixture.attachmentsRepo.create(attachment2)
    await fixture.attachmentsRepo.create(attachment3)
    await fixture.attachmentsRepo.create(attachment4)
    await fixture.attachmentsRepo.create(attachment5)
    await fixture.attachmentsRepo.create(attachment6)
    await fixture.attachmentsRepo.create(attachment7)
    await fixture.attachmentsRepo.create(attachment8)

    await fixture.customersRepo.create(newCustomer)

    const result = await sut.execute({
      email: 'john.doe@example.com',
      currentUserId: 'customer-1',
    })

    expect(result.isRight()).toBe(true)
    if (result.isLeft()) throw result.value

    const customer = result.value.customerDetails
    expect(customer.customerId).toBe(newCustomer.id)
    expect(customer.name).toBe(newCustomer.name)
    expect(customer.email).toBe(newCustomer.email)

    // Phones
    expect(customer.phones).toHaveLength(2)
    expect(customer.phones.map((p) => p.number)).toEqual(
      expect.arrayContaining([phone1.number, phone2.number]),
    )

    // Vehicles
    expect(customer.vehiclesDetails).toHaveLength(2)

    // Vehicle 1
    const vehicle1 = customer.vehiclesDetails.find(
      (v) => v.plate === customerVehicle1.plate,
    )
    expect(vehicle1).toBeDefined()

    const breakdowns1 = vehicle1!.breakdownDetails
    expect(breakdowns1).toHaveLength(2)

    // Breakdown 1 of Vehicle 1
    const bd1 = breakdowns1.find((b) => b.breakdownId === vehicleBreakdown1.id)
    expect(bd1).toBeDefined()
    expect(bd1!.attachments.map((a) => a.id)).toEqual(
      expect.arrayContaining([
        breakdownAttachment1.attachmentId,
        breakdownAttachment2.attachmentId,
      ]),
    )

    // Breakdown 2 of Vehicle 1
    const bd2 = breakdowns1.find((b) => b.breakdownId === vehicleBreakdown2.id)
    expect(bd2).toBeDefined()
    expect(bd2!.attachments.map((a) => a.id)).toEqual(
      expect.arrayContaining([
        breakdownAttachment3.attachmentId,
        breakdownAttachment4.attachmentId,
      ]),
    )

    // Vehicle 2
    const vehicle2 = customer.vehiclesDetails.find(
      (v) => v.plate === customerVehicle2.plate,
    )
    expect(vehicle2).toBeDefined()

    const breakdowns2 = vehicle2!.breakdownDetails
    expect(breakdowns2).toHaveLength(2)

    // Breakdown 1 of Vehicle 2
    const bd3 = breakdowns2.find((b) => b.breakdownId === vehicleBreakdown3.id)
    expect(bd3).toBeDefined()
    expect(bd3!.attachments.map((a) => a.id)).toEqual(
      expect.arrayContaining([
        breakdownAttachment5.attachmentId,
        breakdownAttachment6.attachmentId,
      ]),
    )

    // Breakdown 2 of Vehicle 2
    const bd4 = breakdowns2.find((b) => b.breakdownId === vehicleBreakdown4.id)
    expect(bd4).toBeDefined()
    expect(bd4!.attachments.map((a) => a.id)).toEqual(
      expect.arrayContaining([
        breakdownAttachment7.attachmentId,
        breakdownAttachment8.attachmentId,
      ]),
    )
  })

  it('Should not be able to get unexistent customer', async () => {
    await fixture.adminsRepo.create(
      makeAdmin({}, new UniqueEntityID('admin-1')),
    )

    const result = await sut.execute({
      email: 'unexistent-admin-email',
      currentUserId: 'admin-1',
    })

    expect(result.isRight()).toBe(false)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('Should not be able to get another customer', async () => {
    async function createTwoCustomersWithChildren() {
      const customersData = [
        { id: 'customer-1', email: 'john.doe@example.com' },
        { id: 'customer-2', email: 'jane.foe@example.com' },
      ]

      for (const customerData of customersData) {
        const customer = makeCustomer(
          { email: Email.create({ email: customerData.email }) },
          new UniqueEntityID(customerData.id),
        )

        // Phones
        const phone1 = makePhone(
          { userId: customer.id, number: '123456789', userRole: 'CUSTOMER' },
          new UniqueEntityID(`phone-${customerData.id}-1`),
        )
        const phone2 = makePhone(
          { userId: customer.id, number: '987654321', userRole: 'CUSTOMER' },
          new UniqueEntityID(`phone-${customerData.id}-2`),
        )
        customer.phones.update([phone1, phone2])

        // Vehicles
        const vehicle1 = makeCustomerVehicle(
          { customerId: customer.id },
          new UniqueEntityID(`vehicle-${customerData.id}-1`),
        )
        const vehicle2 = makeCustomerVehicle(
          { customerId: customer.id },
          new UniqueEntityID(`vehicle-${customerData.id}-2`),
        )
        customer.vehicles.update([vehicle1, vehicle2])

        // Breakdowns
        const breakdowns = [
          makeVehicleBreakdown(
            { vehicleId: vehicle1.id },
            new UniqueEntityID(`breakdown-${vehicle1.id}-1`),
          ),
          makeVehicleBreakdown(
            { vehicleId: vehicle1.id },
            new UniqueEntityID(`breakdown-${vehicle1.id}-2`),
          ),
          makeVehicleBreakdown(
            { vehicleId: vehicle2.id },
            new UniqueEntityID(`breakdown-${vehicle2.id}-1`),
          ),
          makeVehicleBreakdown(
            { vehicleId: vehicle2.id },
            new UniqueEntityID(`breakdown-${vehicle2.id}-2`),
          ),
        ]

        vehicle1.breakdowns.update([breakdowns[0], breakdowns[1]])
        vehicle2.breakdowns.update([breakdowns[2], breakdowns[3]])

        // Attachments
        const attachments = breakdowns.flatMap((b, idx) => {
          const a1 = makeAttachment({
            title: `Attachment ${idx * 2 + 1}`,
            url: `https://example.com/attachment-${idx * 2 + 1}`,
          })
          const a2 = makeAttachment({
            title: `Attachment ${idx * 2 + 2}`,
            url: `https://example.com/attachment-${idx * 2 + 2}`,
          })

          b.attachments.update([
            makeBreakdownAttachment({ attachmentId: a1.id, breakdownId: b.id }),
            makeBreakdownAttachment({ attachmentId: a2.id, breakdownId: b.id }),
          ])

          return [a1, a2]
        })

        for (const attachment of attachments) {
          await fixture.attachmentsRepo.create(attachment)
        }

        await fixture.customersRepo.create(customer)
      }
    }

    await createTwoCustomersWithChildren()

    const result = await sut.execute({
      email: 'jane.foe@example.com',
      currentUserId: 'customer-1',
    })

    expect(result.isRight()).toBe(false)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })
})
