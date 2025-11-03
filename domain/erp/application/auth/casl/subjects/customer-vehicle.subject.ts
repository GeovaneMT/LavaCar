import { z } from 'zod'
import { customerVehicleModelSchema } from '@/domain/erp/application/auth/casl/models/customer-vehicle.model'

export const customerVehicleSubjectSchema = z.tuple([
  z.union([
    z.literal('manage'),
    z.literal('GET'),
    z.literal('CREATE'),
    z.literal('UPDATE'),
    z.literal('DELETE'),
  ]),
  z.union([z.literal('CUSTOMER_VEHICLE'), customerVehicleModelSchema]),
])

export type CustomerVehicleSubjectType = z.infer<
  typeof customerVehicleSubjectSchema
>
