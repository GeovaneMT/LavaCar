import type { Notification } from '@/domain/notification/enterprise/entities/notification'
import type { NotificationModelType as caslNottification } from '@/domain/notification/application/auth/casl/models/notification.model'

export class CaslNotificationMapper {
  /**
   * The magic function that converts notification domain entities to casl models
   */
  static toCasl(notification: Notification): caslNottification {
    return {
      ...notification,
      __typename: 'NOTIFICATION',
      recipientRole: notification.recipientRole,
      id: notification.id.toString(),
      createdAt: notification.createdAt,
      recipientId: notification.recipientId.toString(),
    }
  }
}
