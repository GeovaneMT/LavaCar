import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found.error'

import { GetMeUseCase } from '@/domain/erp/application/use-cases/get-me'

import { makePhone } from 'test/factories/make-phone'
import { makeAdmin } from 'test/factories/make-admin'
import { makeCustomer } from 'test/factories/make-customer'

import { createDomainTestsFixture } from 'test/helpers/create-domain-test-fixture'
import { makeCustomerVehicle } from 'test/factories/make-customer-vehicle'
import { makeVehicleBreakdown } from 'test/factories/make-vehicle-breakdown'
import { makeBreakdownAttachment } from 'test/factories/make-breakdown-attachments'
import { makeAttachment } from 'test/factories/make-attachment'

let fixture: ReturnType<typeof createDomainTestsFixture>

let sut: GetMeUseCase

describe('Get me', () => {
  beforeEach(() => {
    fixture = createDomainTestsFixture()

    sut = new GetMeUseCase(
      fixture.logger,
      fixture.adminsRepo,
      fixture.customersRepo,
      fixture.caslErpService,
    )
  })

  it('Should be able to get me admin', async () => {
    const meAdmin = makeAdmin({}, new UniqueEntityID('admin-1'))

    const phone1 = makePhone(
      {
        userRole: 'ADMIN',
        userId: meAdmin.id,
        number: '123956789',
      },
      new UniqueEntityID('phone-1'),
    )

    const phone2 = makePhone(
      {
        userRole: 'ADMIN',
        userId: meAdmin.id,
      },
      new UniqueEntityID('phone-2'),
    )

    // entities association
    meAdmin.phones.update([phone1, phone2])
    await fixture.adminsRepo.create(meAdmin)

    const result = await sut.execute('admin-1')

    if (result.isLeft()) throw result.value
    expect(result.isRight()).toBe(true)

    const admin = result.value.meDetails
    expect(admin.name).toBe(meAdmin.name)
    expect(admin.email).toBe(meAdmin.email)

    // Phones
    expect(admin.phones).toHaveLength(2)
    expect(admin.phones.map((p) => p.number)).toEqual(
      expect.arrayContaining([phone1.number, phone2.number]),
    )
  })

  it('Should be able to get me customer', async () => {
    const meCustomer = makeCustomer({}, new UniqueEntityID('customer-1'))

    const phone1 = makePhone(
      {
        userRole: 'CUSTOMER',
        userId: meCustomer.id,
        number: '123956789',
      },
      new UniqueEntityID('phone-1'),
    )

    const phone2 = makePhone(
      {
        userRole: 'CUSTOMER',
        userId: meCustomer.id,
      },
      new UniqueEntityID('phone-2'),
    )

    const vehicle = makeCustomerVehicle(
      {
        customerId: meCustomer.id,
      },
      new UniqueEntityID('vehicle-1'),
    )

    const breakdown = makeVehicleBreakdown(
      {
        vehicleId: vehicle.id,
        ownerId: meCustomer.id,
      },
      new UniqueEntityID('breakdown-1'),
    )

    const attachment = makeAttachment(
      {
        title: 'Attachment 1',
        url: 'https://example.com/attachment-1',
      },
      new UniqueEntityID('attachment-1'),
    )

    const breakdownAttachment = makeBreakdownAttachment(
      {
        attachmentId: attachment.id,
        breakdownId: breakdown.id,
      },
      new UniqueEntityID('breakdown-attachment-1'),
    )

    // entities association
    await fixture.attachmentsRepo.create(attachment)
    breakdown.attachments.update([breakdownAttachment])
    vehicle.breakdowns.update([breakdown])
    meCustomer.vehicles.update([vehicle])
    meCustomer.phones.update([phone1, phone2])
    await fixture.customersRepo.create(meCustomer)

    const result = await sut.execute('customer-1')

    if (result.isLeft()) throw result.value
    expect(result.isRight()).toBe(true)

    const customer = result.value.meDetails
    expect(customer.name).toBe(meCustomer.name)
    expect(customer.email).toBe(meCustomer.email)

    // Phones
    expect(customer.phones).toHaveLength(2)
    expect(customer.phones.map((p) => p.number)).toEqual(
      expect.arrayContaining([phone1.number, phone2.number]),
    )
  })

  it('Should not be able to get unexistent admin', async () => {
    const result = await sut.execute('unexistent-admin-id')

    expect(result.isRight()).toBe(false)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
