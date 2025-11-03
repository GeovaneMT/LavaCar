import { z } from 'zod/v4'

export const customerVehicleModelSchema = z.object({
  __typename: z.literal('CUSTOMER_VEHICLE').default('CUSTOMER_VEHICLE'),
  id: z.string(),
  customerId: z.string(),
})

export type CustomerVehicleModelType = z.infer<
  typeof customerVehicleModelSchema
>
