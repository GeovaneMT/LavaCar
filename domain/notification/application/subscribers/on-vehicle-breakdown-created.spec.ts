import { MockInstance } from 'vitest'

import { OnVehicleBreakdownCreated } from '@/domain/notification/application/subscribers/on-vehicle-breakdown-created'

import { waitFor } from 'test/setup/wait-for'

import { makeCustomer } from 'test/factories/make-customer'
import { makeCustomerVehicle } from 'test/factories/make-customer-vehicle'

import {
  SendNotificationUseCase,
  SendNotificationUseCaseRequest,
  SendNotificationUseCaseResponse,
} from '@/domain/notification/application/use-cases/send-notification'

import { makeAttachment } from 'test/factories/make-attachment'
import { makeVehicleBreakdown } from 'test/factories/make-vehicle-breakdown'
import { makeBreakdownAttachment } from 'test/factories/make-breakdown-attachments'

import { createDomainTestsFixture } from 'test/helpers/create-domain-test-fixture'

let fixture: ReturnType<typeof createDomainTestsFixture>

let sendNotificationUseCase: SendNotificationUseCase

let sendNotificationExecuteSpy: MockInstance<
  (
    request: SendNotificationUseCaseRequest,
  ) => Promise<SendNotificationUseCaseResponse>
>

describe('On Customer Created', () => {
  beforeEach(() => {
    fixture = createDomainTestsFixture()

    sendNotificationUseCase = new SendNotificationUseCase(
      fixture.logger,
      fixture.notificationsRepo,
    )

    sendNotificationExecuteSpy = vi.spyOn(sendNotificationUseCase, 'execute')

    // eslint-disable-next-line no-new
    new OnVehicleBreakdownCreated(
      fixture.logger,
      sendNotificationUseCase,
      fixture.customerVehiclesRepo,
    )
  })

  it('should send a notification when a customer is created', async () => {
    const customer = makeCustomer()
    const customerVehicle = makeCustomerVehicle({ customerId: customer.id })
    const vehicleBreakdown = makeVehicleBreakdown({
      vehicleId: customerVehicle.id,
    })

    const breakdownAttachment1 = makeBreakdownAttachment({
      attachmentId: makeAttachment().id,
      breakdownId: vehicleBreakdown.id,
    })

    const breakdownAttachment2 = makeBreakdownAttachment({
      attachmentId: makeAttachment().id,
      breakdownId: vehicleBreakdown.id,
    })

    await fixture.customersRepo.create(customer)
    await fixture.customerVehiclesRepo.create(customerVehicle)
    await fixture.vehicleBreakdownsRepo.create(vehicleBreakdown)
    await fixture.breakdownAttachmentsRepo.createMany([
      breakdownAttachment1,
      breakdownAttachment2,
    ])

    await waitFor(() => {
      expect(sendNotificationExecuteSpy).toHaveBeenCalled()
    })
  })
})
