import { z } from 'zod/v4'
import { userRoles } from '@/core/enums/prisma.enums'

export const notificationModelSchema = z.object({
  __typename: z.literal('NOTIFICATION').default('NOTIFICATION'),
  id: z.string(),
  createdAt: z.date(),
  recipientId: z.string(),
  recipientRole: z.literal(userRoles),
  userId: z.string().optional(),
  readAt: z.date().optional(),
})

export type NotificationModelType = z.infer<typeof notificationModelSchema>
