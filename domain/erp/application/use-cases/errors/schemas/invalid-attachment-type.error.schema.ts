import { z } from 'zod/v4'
import { HttpStatus } from '@nestjs/common'

import { nonEmptyString } from '@/core/schemas/non-empty-string.schema'
import { createErrorSchema } from '@/core/errors/utils/create-error.schema'

export const InvalidAttachmentTypeErrorStatus =
  HttpStatus.UNSUPPORTED_MEDIA_TYPE

export const InvalidAttachmentTypeErrorTitle = 'Attachment type is invalid'
export const InvalidAttachmentTypeErrorDetail =
  'The attachment type uploaded in the operation is not valid.'

const baseTitle = 'Invalid attachment type'

const InvalidAttachmentTypeErrorDetailsSchema = z.object({
  type: nonEmptyString({
    title: baseTitle,
    description: `The ${baseTitle}`,
    example: 'pdf',
  }).optional(),
})

export type InvalidAttachmentTypeErrorDetailProps = z.infer<
  typeof InvalidAttachmentTypeErrorDetailsSchema
>

export const InvalidAttachmentTypeErrorSchema = createErrorSchema<
  typeof InvalidAttachmentTypeErrorDetailsSchema
>({
  code: 'INVALID_ATTACHMENT_TYPE',
  title: InvalidAttachmentTypeErrorTitle,
  detail: InvalidAttachmentTypeErrorDetail,
  status: InvalidAttachmentTypeErrorStatus,
  ErrorName: 'Invalid Attachment Type',

  detailsSchema: InvalidAttachmentTypeErrorDetailsSchema,
})

export type InvalidAttachmentTypeErrorProps = z.infer<
  typeof InvalidAttachmentTypeErrorSchema
> & {
  schema: typeof InvalidAttachmentTypeErrorSchema
  className: string
}
