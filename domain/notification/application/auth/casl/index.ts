import { z } from 'zod/v4'

import { permissions } from '@/domain/notification/application/auth/casl/permissions'

import { notificationSubjectSchema } from '@/domain/notification/application/auth/casl/subjects/notification.subject'

import type { UserModelType } from '@/core/auth/casl/models/user.model'

import {
  MongoAbility,
  CreateAbility,
  AbilityBuilder,
  createMongoAbility,
} from '@casl/ability'

const _appAbilitiesSchema = z.union([
  notificationSubjectSchema,
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
