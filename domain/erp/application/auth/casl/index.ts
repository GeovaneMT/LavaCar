import { z } from 'zod/v4'

import { meSubjectSchema } from '@/domain/erp/application/auth/casl/subjects/me.subject'
import { adminSubjectSchema } from '@/domain/erp/application/auth/casl/subjects/admin.subject'
import { phoneSubjectSchema } from '@/domain/erp/application/auth/casl/subjects/phone.subject'
import { customerSubjectSchema } from '@/domain/erp/application/auth/casl/subjects/customer.subject'
import { attachmentSubjectSchema } from '@/domain/erp/application/auth/casl/subjects/attachment.subject'
import { customerVehicleSubjectSchema } from '@/domain/erp/application/auth/casl/subjects/customer-vehicle.subject'
import { vehicleBreakdownSubjectSchema } from '@/domain/erp/application/auth/casl/subjects/vehicle-breakdown.subject'

import { permissions } from '@/domain/erp/application/auth/casl/permissions'

import type { UserModelType } from '@/core/auth/casl/models/user.model'

import {
  MongoAbility,
  CreateAbility,
  AbilityBuilder,
  createMongoAbility,
} from '@casl/ability'

const _appAbilitiesSchema = z.union([
  meSubjectSchema,
  phoneSubjectSchema,
  adminSubjectSchema,
  customerSubjectSchema,
  attachmentSubjectSchema,
  customerVehicleSubjectSchema,
  vehicleBreakdownSubjectSchema,
  z.tuple([z.literal('manage'), z.literal('all')]),
])

export type AppAbilities = z.infer<typeof _appAbilitiesSchema>
export type AppAbility = MongoAbility<AppAbilities>
export const createAppAbility: CreateAbility<AppAbility> = createMongoAbility

export function defineAbilityFor(user: UserModelType) {
  const builder = new AbilityBuilder(createAppAbility)

  const definePermissions = permissions[user.role]
  if (!definePermissions)
    throw new Error(`Permissions for role ${user.role} not found.`)

  definePermissions(user, builder)

  return builder.build({
    detectSubjectType: ({ __typename }) => __typename,
  })
}
