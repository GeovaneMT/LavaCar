import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@/core/either'
import { LoggerPort } from '@/core/ports/logger.port'

import { NotAllowedError } from '@/core/errors/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found.error'
import { ReadedSuccess } from '@/domain/notification/application/use-cases/success/succes/readed.success'

import { CaslNotificationMapper } from '@/domain/notification/application/auth/casl/mappers/casl-notification.mapper'

import { UseCaseBase } from '@/core/entities/base-use-case'

import { CaslNotificationPolicyService } from '@/domain/notification/application/auth/casl/services/casl-notification-policy.service'
import { NotificationsRepository } from '@/domain/notification/application/repositories/notifications.repository'

interface ReadNotificationUseCaseRequest {
  currentUserId: string
  notificationId: string
}

type ReadNotificationUseCaseResponse = Either<
  NotAllowedError | ResourceNotFoundError,
  ReadedSuccess
>

@Injectable()
export class ReadNotificationUseCase extends UseCaseBase {
  static success = ReadedSuccess
  static errors = [NotAllowedError, ResourceNotFoundError]

  constructor(
    logger: LoggerPort,
    private caslPermissionService: CaslNotificationPolicyService,
    private notificationsRepository: NotificationsRepository,
  ) {
    super(logger)
  }

  async execute({
    currentUserId,
    notificationId,
  }: ReadNotificationUseCaseRequest): Promise<ReadNotificationUseCaseResponse> {
    const context = ReadNotificationUseCase.name

    this.logger.log(
      `📬 Attempting to read notification ${notificationId} for recipient ${currentUserId}`,
      context,
    )

    const notification =
      await this.notificationsRepository.findById(notificationId)

    if (!notification) {
      return left(
        ResourceNotFoundError.create(
          { details: { resource: 'notification', resourceId: notificationId } },
          this.logger,
        ),
      )
    }

    this.logger.debug?.(`Notification found=${!!notification}`, context)

    const permissionResult = await this.caslPermissionService.verifyAbilities({
      userId: currentUserId,
      appAbilities: ['READ', CaslNotificationMapper.toCasl(notification)],
    })

    if (permissionResult.isLeft()) return left(permissionResult.value)

    this.logger.debug?.(
      `Marking notification ${notificationId} as read`,
      context,
    )

    notification.read()

    this.logger.debug?.(
      `Saving updated notification ${notificationId}`,
      context,
    )

    await this.notificationsRepository.save(notification)

    this.logger.log(
      `✅ Successfully read notification ${notificationId}`,
      context,
    )

    return right(
      ReadedSuccess.create(
        { meta: { resource: 'notification' }, data: notification },
        this.logger,
      ),
    )
  }
}
