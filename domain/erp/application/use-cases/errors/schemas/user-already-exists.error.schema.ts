import { z } from 'zod/v4'
import { HttpStatus } from '@nestjs/common'

import { nonEmptyString } from '@/core/schemas/non-empty-string.schema'
import { createErrorSchema } from '@/core/errors/utils/create-error.schema'

export const UserAlreadyExistsErrorDetail =
  'The user already exists in the database when executing the operation.'

export const UserAlreadyExistsErrorTitle =
  'The user already exists in the database'

export const UserAlreadyExistsErrorStatus = HttpStatus.CONFLICT

const UserAlreadyExistsErrorDetailsSchema = z.object({
  identifier: nonEmptyString({
    title: 'User identifier',
    description: 'The identifier of the existing user',
    example: 'ABC1234',
  }).optional(),
})

export type UserAlreadyExistsErrorDetailProps = z.infer<
  typeof UserAlreadyExistsErrorDetailsSchema
>
export const UserAlreadyExistsErrorSchema = createErrorSchema<
  typeof UserAlreadyExistsErrorDetailsSchema
>({
  code: 'USER_ALREADY_EXISTS',
  title: UserAlreadyExistsErrorTitle,
  detail: UserAlreadyExistsErrorDetail,
  status: UserAlreadyExistsErrorStatus,
  ErrorName: 'User Already Exists',

  detailsSchema: UserAlreadyExistsErrorDetailsSchema,
})

export type UserAlreadyExistsErrorProps = z.infer<
  typeof UserAlreadyExistsErrorSchema
> & {
  schema: typeof UserAlreadyExistsErrorSchema
  className: string
}
