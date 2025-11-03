import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { NotAllowedError } from '@/core/errors/errors/not-allowed.error'

import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found.error'

import { ReadNotificationUseCase } from '@/domain/notification/application/use-cases/read-notification'
import { makeCustomer } from 'test/factories/make-customer'

import { makeNotification } from 'test/factories/make-notification'

import { createDomainTestsFixture } from 'test/helpers/create-domain-test-fixture'

let fixture: ReturnType<typeof createDomainTestsFixture>

let sut: ReadNotificationUseCase

describe('Send Notification', () => {
  beforeEach(() => {
    fixture = createDomainTestsFixture()

    sut = new ReadNotificationUseCase(
      fixture.logger,
      fixture.caslNotificationService,
      fixture.notificationsRepo,
    )
  })

  it('should be able to read a notification', async () => {
    await fixture.customersRepo.create(
      makeCustomer({}, new UniqueEntityID('recipient-2')),
    )

    const notification = makeNotification({
      recipientId: new UniqueEntityID('recipient-2'),
    })

    await fixture.notificationsRepo.create(notification)

    const result = await sut.execute({
      currentUserId: notification.recipientId.toString(),
      notificationId: notification.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    expect(fixture.notificationsRepo.items[0].readAt).toEqual(expect.any(Date))
  })

  it('should not be able to read a unexistent notification', async () => {
    const result = await sut.execute({
      notificationId: 'unexistent-notification-id',
      currentUserId: 'recipient-2',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to read a notification from another user', async () => {
    await fixture.customersRepo.create(
      makeCustomer({}, new UniqueEntityID('recipient-1')),
    )

    const notification = makeNotification({
      recipientId: new UniqueEntityID('recipient-1'),
    })

    await fixture.customersRepo.create(
      makeCustomer({}, new UniqueEntityID('recipient-2')),
    )

    await fixture.notificationsRepo.create(notification)

    const result = await sut.execute({
      notificationId: notification.id.toString(),
      currentUserId: 'recipient-2',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })
})
