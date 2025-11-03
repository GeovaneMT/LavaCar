import { z } from 'zod/v4'
import { HttpStatus } from '@nestjs/common'

import { nonEmptyString } from '@/core/schemas/non-empty-string.schema'
import { createSuccessSchema } from '@/core/success/utils/create-success.schema'

export const ReadedSuccessStatusCode = HttpStatus.OK

const ReadedSuccessDetailsSchema = z.object({
  resource: nonEmptyString({
    title: 'Readed resource',
    description: 'The resource that was readed',
    example: 'vehicle',
  }),
})

export type ReadedSuccessDetailProps = z.infer<
  typeof ReadedSuccessDetailsSchema
>

export const ReadedSuccessSchema = createSuccessSchema<
  typeof ReadedSuccessDetailsSchema
>({
  SuccessName: 'Readed Success',
  description: 'Resource readed successfully',
  status: ReadedSuccessStatusCode,
  metaSchema: ReadedSuccessDetailsSchema,
})

export type ReadedSuccessProps = z.infer<typeof ReadedSuccessSchema> & {
  schema: typeof ReadedSuccessSchema
  className: string
}
