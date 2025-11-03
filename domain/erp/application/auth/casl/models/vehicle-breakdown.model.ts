import { z } from 'zod/v4'

export const vehicleBreakdownModelSchema = z.object({
  __typename: z.literal('VEHICLE_BREAKDOWN').default('VEHICLE_BREAKDOWN'),
  id: z.string(),
  ownerId: z.string(),
  vehicleId: z.string(),
})

export type VehicleBreakdownModelType = z.infer<
  typeof vehicleBreakdownModelSchema
>
