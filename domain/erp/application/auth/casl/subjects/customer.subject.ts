import { z } from 'zod'
import { customerModelSchema } from '@/domain/erp/application/auth/casl/models/customer.model'

export const customerSubjectSchema = z.tuple([
  z.union([
    z.literal('manage'),
    z.literal('GET'),
    z.literal('CREATE'),
    z.literal('UPDATE'),
    z.literal('DELETE'),
  ]),
  z.union([z.literal('CUSTOMER'), customerModelSchema]),
])

export type CustomerSubjectType = z.infer<typeof customerSubjectSchema>
