import { z } from 'zod/v4'
import { HttpStatus } from '@nestjs/common'

import { nonEmptyString } from '@/core/schemas/non-empty-string.schema'
import { createErrorSchema } from '@/core/errors/utils/create-error.schema'

export const VehicleAlreadyExistsErrorDetail =
  'The vehicle already exists in the database when executing the operation.'
export const VehicleAlreadyExistsErrorTitle =
  'The vehicle already exists in the database'
export const VehicleAlreadyExistsErrorStatus = HttpStatus.CONFLICT

const VehicleAlreadyExistsErrorDetailsSchema = z.object({
  plate: nonEmptyString({
    title: 'Vehicle plate',
    description: 'The plate of the existing vehicle',
    example: 'ABC1234',
  }).optional(),
})

export type VehicleAlreadyExistsErrorDetailProps = z.infer<
  typeof VehicleAlreadyExistsErrorDetailsSchema
>

export const VehicleAlreadyExistsErrorSchema = createErrorSchema<
  typeof VehicleAlreadyExistsErrorDetailsSchema
>({
  code: 'VEHICLE_ALREADY_EXISTS',
  title: VehicleAlreadyExistsErrorTitle,
  detail: VehicleAlreadyExistsErrorDetail,
  status: VehicleAlreadyExistsErrorStatus,
  ErrorName: 'Vehicle Already Exists',

  detailsSchema: VehicleAlreadyExistsErrorDetailsSchema,
})

export type VehicleAlreadyExistsErrorProps = z.infer<
  typeof VehicleAlreadyExistsErrorSchema
> & {
  schema: typeof VehicleAlreadyExistsErrorSchema
  className: string
}
