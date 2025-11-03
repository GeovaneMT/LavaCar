import { z } from 'zod'
import { notificationModelSchema } from '@/domain/notification/application/auth/casl/models/notification.model'

export const notificationSubjectSchema = z.tuple([
  z.union([z.literal('SEND'), z.literal('READ')]),
  z.union([z.literal('NOTIFICATION'), notificationModelSchema]),
])

export type NotificationSubjectType = z.infer<typeof notificationSubjectSchema>
