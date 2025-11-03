import { createDomainTestsFixture } from 'test/helpers/create-domain-test-fixture'
import { SendNotificationUseCase } from '@/domain/notification/application/use-cases/send-notification'

let fixture: ReturnType<typeof createDomainTestsFixture>

let sut: SendNotificationUseCase

describe('Send Notification', () => {
  beforeEach(() => {
    fixture = createDomainTestsFixture()
    sut = new SendNotificationUseCase(fixture.logger, fixture.notificationsRepo)
  })

  it('should be able to send a notification', async () => {
    const result = await sut.execute({
      recipientId: '1',
      recipientRole: 'CUSTOMER',
      title: 'Nova notificação',
      content: 'Conteúdo da notificação',
    })

    expect(result.isRight()).toBe(true)
    expect(fixture.notificationsRepo.items[0]).toEqual(
      result.value?.notification,
    )
  })
})
