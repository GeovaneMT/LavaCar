import { z } from 'zod'
import { attachmentModelSchema } from '@/domain/erp/application/auth/casl/models/attachment.model'

export const attachmentSubjectSchema = z.tuple([
  z.union([
    z.literal('manage'),
    z.literal('GET'),
    z.literal('UPLOAD'),
    z.literal('DELETE'),
  ]),
  z.union([z.literal('ATTACHMENT'), attachmentModelSchema]),
])

export type AttachmentSubjectType = z.infer<typeof attachmentSubjectSchema>
