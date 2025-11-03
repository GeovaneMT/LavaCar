import { z } from 'zod/v4'
import { HttpStatus } from '@nestjs/common'

import { nonEmptyString } from '@/core/schemas/non-empty-string.schema'
import { createErrorSchema } from '@/core/errors/utils/create-error.schema'

export const InvalidPasswordErrorTitle = 'The password is not valid'
export const InvalidPasswordErrorDetail =
  'The password received is not valid for the operation.'

export const InvalidPasswordErrorStatus = HttpStatus.UNPROCESSABLE_ENTITY

const baseTitle = 'Invalid password'

const InvalidPasswordErrorDetailsSchema = z.object({
  password: nonEmptyString({
    title: baseTitle,
    description: `The ${baseTitle}`,
    example: 'invalid-password',
  }).optional(),

  error: nonEmptyString({
    title: 'Error message',
    description: 'The received error message',
    example: `${baseTitle} error`,
  }).optional(),
})

export type InvalidPasswordErrorDetailProps = z.infer<
  typeof InvalidPasswordErrorDetailsSchema
>

export const InvalidPasswordErrorSchema = createErrorSchema<
  typeof InvalidPasswordErrorDetailsSchema
>({
  code: 'INVALID_PASSWORD',
  title: 'InvalidPasswordErrorTitle',
  detail: InvalidPasswordErrorDetail,
  status: InvalidPasswordErrorStatus,
  ErrorName: 'Invalid Password',

  detailsSchema: InvalidPasswordErrorDetailsSchema,
})

export type InvalidPasswordErrorProps = z.infer<
  typeof InvalidPasswordErrorSchema
> & {
  schema: typeof InvalidPasswordErrorSchema
  className: string
}
