import { Injectable } from '@nestjs/common'

import { Either, right } from '@/core/either'
import { LoggerPort } from '@/core/ports/logger.port'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { Notification } from '@/domain/notification/enterprise/entities/notification'

import { CreatedSuccess } from '@/core/success/succes/created.success'
import { NotAllowedError } from '@/core/errors/errors/not-allowed.error'

import { UseCaseBase } from '@/core/entities/base-use-case'
import { NotificationsRepository } from '@/domain/notification/application/repositories/notifications.repository'
import { userRoleLitteral } from '@/core/enums/prisma.enums'

export interface SendNotificationUseCaseRequest {
  title: string
  content: string
  recipientId: string
  recipientRole: userRoleLitteral
}

export type SendNotificationUseCaseResponse = Either<
  null,
  {
    notification: Notification
  }
>

@Injectable()
export class SendNotificationUseCase extends UseCaseBase {
  static errors = [NotAllowedError]
  static success = [CreatedSuccess]

  constructor(
    logger: LoggerPort,
    private notificationsRepository: NotificationsRepository,
  ) {
    super(logger)
  }

  async execute({
    title,
    content,
    recipientId,
    recipientRole,
  }: SendNotificationUseCaseRequest): Promise<SendNotificationUseCaseResponse> {
    const context = SendNotificationUseCase.name

    this.logger.log(
      `📬 Sending notification to recipient "${recipientId}" with title "${title}" and content: "${content}"`,
      context,
    )

    const notification = Notification.create({
      title,
      content,
      recipientRole,
      recipientId: new UniqueEntityID(recipientId),
    })

    this.logger.debug?.(
      `Saving notification ${notification.id} to repository`,
      context,
    )

    await this.notificationsRepository.create(notification)

    this.logger.log(
      `✅ Successfully sent notification ${notification.id} to recipient ${recipientId}`,
      context,
    )

    return right({
      notification,
    })
  }
}
