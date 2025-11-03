import { z } from 'zod'
import { vehicleBreakdownModelSchema } from '@/domain/erp/application/auth/casl/models/vehicle-breakdown.model'

export const vehicleBreakdownSubjectSchema = z.tuple([
  z.union([
    z.literal('manage'),
    z.literal('GET'),
    z.literal('CREATE'),
    z.literal('UPDATE'),
    z.literal('DELETE'),
  ]),
  z.union([z.literal('VEHICLE_BREAKDOWN'), vehicleBreakdownModelSchema]),
])

export type VehicleBreakdownSubjectType = z.infer<
  typeof vehicleBreakdownSubjectSchema
>
