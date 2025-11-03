import { z } from 'zod/v4'
import { userModelSchema } from '@/core/auth/casl/models/user.model'

import { userRole } from '@/core/enums/prisma.enums'

export const meModelSchema = userModelSchema.extend({
  __typename: z.literal('ME').default('ME'),
  role: z.literal(userRole),
})

export type MeModelType = z.infer<typeof meModelSchema>
