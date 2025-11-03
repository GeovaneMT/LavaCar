import { z } from 'zod'
import { phoneModelSchema } from '@/domain/erp/application/auth/casl/models/phone.model'

export const phoneSubjectSchema = z.tuple([
  z.union([
    z.literal('manage'),
    z.literal('GET'),
    z.literal('CREATE'),
    z.literal('UPDATE'),
    z.literal('DELETE'),
  ]),
  z.union([z.literal('PHONE'), phoneModelSchema]),
])

export type PhoneSubjectType = z.infer<typeof phoneSubjectSchema>
