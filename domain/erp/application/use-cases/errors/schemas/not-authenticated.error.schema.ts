import { z } from 'zod/v4'
import { HttpStatus } from '@nestjs/common'

import { nonEmptyString } from '@/core/schemas/non-empty-string.schema'
import { createErrorSchema } from '@/core/errors/utils/create-error.schema'

export const NotAuthenticatedErrorTitle = 'user not authenticated'
export const NotAuthenticatedErrorDetail =
  'The user is not authenticated for this operation.'
export const NotAuthenticatedErrorStatus = HttpStatus.UNAUTHORIZED

const baseTitle = 'Not authenticated'
const description1 = 'This is the'
const description2 = 'of the user that is not authenticated'

const NotAuthenticatedErrorDetailsSchema = z.object({
  userId: nonEmptyString({
    title: `${baseTitle} user id`,
    description: `${description1} id ${description2}`,
    example: 'This-is-the-user-id',
  }).optional(),

  userName: nonEmptyString({
    title: `${baseTitle} user name`,
    description: `${description1} name ${description2}`,
    example: 'john doe',
  }).optional(),
})

export type NotAuthenticatedErrorDetailProps = z.infer<
  typeof NotAuthenticatedErrorDetailsSchema
>

export const NotAuthenticatedErrorSchema = createErrorSchema<
  typeof NotAuthenticatedErrorDetailsSchema
>({
  code: 'NOT_AUTHENTICATED',
  title: NotAuthenticatedErrorTitle,
  detail: NotAuthenticatedErrorDetail,
  status: NotAuthenticatedErrorStatus,
  ErrorName: 'Not Authenticated',

  detailsSchema: NotAuthenticatedErrorDetailsSchema,
})

export type NotAuthenticatedErrorProps = z.infer<
  typeof NotAuthenticatedErrorSchema
> & {
  schema: typeof NotAuthenticatedErrorSchema
  className: string
}
