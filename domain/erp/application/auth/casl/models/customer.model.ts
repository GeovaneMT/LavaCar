import { z } from 'zod/v4'
import { userModelSchema } from '@/core/auth/casl/models/user.model'

import { UserRole, userRoleLitteral } from '@/core/enums/prisma.enums'

const customerRole: userRoleLitteral = UserRole.CUSTOMER

export const customerModelSchema = userModelSchema.extend({
  __typename: z.literal(customerRole).default(customerRole),
  role: z.literal(customerRole),
})

export type CustomerModelType = z.infer<typeof customerModelSchema>
