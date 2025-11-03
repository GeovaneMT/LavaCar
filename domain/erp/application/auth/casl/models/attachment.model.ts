import { z } from 'zod/v4'

export const attachmentModelSchema = z.object({
  __typename: z.literal('ATTACHMENT').default('ATTACHMENT'),
  id: z.string(),
})

export type AttachmentModelType = z.infer<typeof attachmentModelSchema>
