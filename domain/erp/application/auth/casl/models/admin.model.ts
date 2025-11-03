import { z } from 'zod/v4'
import { userModelSchema } from '@/core/auth/casl/models/user.model'

import { UserRole, userRoleLitteral } from '@/core/enums/prisma.enums'

const adminRole: userRoleLitteral = UserRole.ADMIN

export const adminModelSchema = userModelSchema.extend({
  __typename: z.literal(adminRole).default(adminRole),
  role: z.literal(adminRole),
})

export type AdminModelType = z.infer<typeof adminModelSchema>
