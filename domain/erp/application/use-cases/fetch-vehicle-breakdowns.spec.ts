import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { NotAllowedError } from '@/core/errors/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found.error'

import { FetchVehicleBreakdownsUseCase } from '@/domain/erp/application/use-cases/fetch-vehicle-breakdowns'

import { makeAdmin } from 'test/factories/make-admin'
import { makeAttachment } from 'test/factories/make-attachment'
import { makeVehicleBreakdown } from 'test/factories/make-vehicle-breakdown'
import { makeBreakdownAttachment } from 'test/factories/make-breakdown-attachments'

import { createDomainTestsFixture } from 'test/helpers/create-domain-test-fixture'
import { makeCustomer } from 'test/factories/make-customer'

let fixture: ReturnType<typeof createDomainTestsFixture>

let sut: FetchVehicleBreakdownsUseCase

describe('Get vehicle breakdowns', () => {
  beforeEach(() => {
    fixture = createDomainTestsFixture()

    sut = new FetchVehicleBreakdownsUseCase(
      fixture.logger,
      fixture.caslErpService,
      fixture.vehicleBreakdownsRepo,
    )
  })

  it('Should be able to get vehicle breakdowns by description', async () => {
    await fixture.adminsRepo.create(makeAdmin({}, new UniqueEntityID('admin')))

    const vehicleBreakdown1 = makeVehicleBreakdown({
      description: 'Description 1',
    })

    const vehicleBreakdown2 = makeVehicleBreakdown({
      description: 'Description 2',
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

    await fixture.vehicleBreakdownsRepo.createMany([
      vehicleBreakdown1,
      vehicleBreakdown2,
    ])

    const result = await sut.execute({
      page: 1,
      limit: 10,
      currentUserId: 'admin',
    })

    expect(result.isRight()).toBe(true)
    if (result.isLeft()) throw new Error(result.value.detail)

    const breakdowns = result.value.vehicleBreakdowns
    expect(breakdowns).toHaveLength(2)

    // Breakdown 1
    const bd1 = breakdowns.find((b) => b.id === vehicleBreakdown1.id)
    expect(bd1).toBeDefined()
    expect(bd1!.attachments.getItems().map((a) => a.id)).toEqual(
      expect.arrayContaining([
        breakdownAttachment1.id,
        breakdownAttachment2.id,
      ]),
    )

    // Breakdown 2
    const bd2 = breakdowns.find((b) => b.id === vehicleBreakdown2.id)
    expect(bd2).toBeDefined()
    expect(bd2!.attachments.getItems().map((a) => a.id)).toEqual(
      expect.arrayContaining([
        breakdownAttachment3.id,
        breakdownAttachment4.id,
      ]),
    )
  })

  it('Should respect the page parameter when fetching vehicle breakdowns', async () => {
    await fixture.adminsRepo.create(makeAdmin({}, new UniqueEntityID('admin')))

    const breakdowns = Array.from({ length: 20 }).map((_, i) =>
      makeVehicleBreakdown({}, new UniqueEntityID(`customer-${i + 1}`)),
    )

    for (const breakdown of breakdowns) {
      await fixture.vehicleBreakdownsRepo.create(breakdown)
    }

    const result = await sut.execute({
      page: 2, // should skip first 10
      limit: 10,
      currentUserId: 'admin',
    })

    expect(result.isRight()).toBe(true)
    if (result.isLeft()) throw new Error(result.value.detail)

    expect(result.value.vehicleBreakdowns).toHaveLength(10)
  })

  it('Should respect the limit parameter when fetching vehicle breakdowns', async () => {
    await fixture.adminsRepo.create(makeAdmin({}, new UniqueEntityID('admin')))

    const breakdowns = Array.from({ length: 5 }).map((_, i) =>
      makeVehicleBreakdown({}, new UniqueEntityID(`customer-${i + 1}`)),
    )

    for (const breakdown of breakdowns) {
      await fixture.vehicleBreakdownsRepo.create(breakdown)
    }

    const result = await sut.execute({
      page: 1,
      limit: 2, // should only return 2
      currentUserId: 'admin',
    })

    expect(result.isRight()).toBe(true)
    if (result.isLeft()) throw new Error(result.value.detail)

    expect(result.value.vehicleBreakdowns).toHaveLength(2)
  })

  it('Should not be able to get unexistent vehicle breakdowns', async () => {
    await fixture.adminsRepo.create(makeAdmin({}, new UniqueEntityID('admin')))

    const result = await sut.execute({
      page: 1,
      limit: 10,
      currentUserId: 'admin',
    })

    expect(result.isRight()).toBe(false)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('Should not be able to fetch vehicle breakdowns from a non-admin account', async () => {
    await fixture.customersRepo.create(
      makeCustomer({}, new UniqueEntityID('customer-1')),
    )

    await fixture.vehicleBreakdownsRepo.create(makeVehicleBreakdown())

    const result = await sut.execute({
      page: 1,
      limit: 10,
      currentUserId: 'customer-1',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })
})
