import { z } from 'zod'
import { adminModelSchema } from '@/domain/erp/application/auth/casl/models/admin.model'

export const adminSubjectSchema = z.tuple([
  z.union([
    z.literal('manage'),
    z.literal('GET'),
    z.literal('CREATE'),
    z.literal('UPDATE'),
    z.literal('DELETE'),
  ]),
  z.union([z.literal('ADMIN'), adminModelSchema]),
])

export type AdminSubjectType = z.infer<typeof adminSubjectSchema>
