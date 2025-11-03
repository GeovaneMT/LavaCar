import { z } from 'zod/v4'
import { userRole } from '@/core/enums/prisma.enums'

export const phoneModelSchema = z.object({
  __typename: z.literal('PHONE').default('PHONE'),
  id: z.string(),
  userId: z.string(),
  userRole: z.literal(userRole),
})

export type PhoneModelType = z.infer<typeof phoneModelSchema>
