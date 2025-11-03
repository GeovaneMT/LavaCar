import { z } from 'zod/v4'

/**
 * Schema for validating Brazilian vehicle plates.
 * Supports both old (ABC1234) and new Mercosur (ABC1D23) formats.
 */
export const PlateValidationSchema = z
  .object({
    plate: z
      .string({ error: 'Invalid plate.' })
      .trim()
      .toUpperCase()
      .regex(/^(?:[A-Z]{3}\d{4}|[A-Z]{3}\d[A-Z]\d{2})$/i, {
        message: 'Invalid plate. Use format ABC1234 or ABC1D23.',
      })
      .meta({
        title: 'Vehicle Plate',
        description:
          'Brazilian vehicle plate, old (ABC1234) or new Mercosur (ABC1D23) format',
        example: ['ABC1234', 'XYZ1A23'],
      }),
  })
  .meta({
    title: 'Vehicle Plate Schema',
    description: 'Schema for validating Brazilian vehicle plates',
    example: [{ plate: 'ABC1234' }, { plate: 'XYZ1A23' }],
  })

export type ZodPlateValidate = z.infer<typeof PlateValidationSchema>
