import { z } from 'zod'
import { meModelSchema } from '@/domain/erp/application/auth/casl/models/me.model'

export const meSubjectSchema = z.tuple([
  z.union([
    z.literal('manage'),
    z.literal('GET'),
    z.literal('CREATE'),
    z.literal('UPDATE'),
    z.literal('DELETE'),
  ]),
  z.union([z.literal('ME'), meModelSchema]),
])

export type MeSubjectType = z.infer<typeof meSubjectSchema>
