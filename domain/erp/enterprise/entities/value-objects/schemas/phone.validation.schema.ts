import { z } from 'zod/v4'
import { createZodDto } from 'nestjs-zod'

import { phoneTypes } from '@/domain/erp/enterprise/utils/get-random-phone-type'
import { UserRole } from '@/core/enums/prisma.enums'

/**
 * Schema for validating user phone information.
 * Includes user ID, phone number, type, and WhatsApp flag.
 */
export const PhoneValidationSchema = z
  .object({
    id: z
      .string()
      .optional()
      .describe('Phone ID')
      .meta({
        title: 'Phone ID',
        description: 'Phone ID',
        example: ['phone-12345', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'],
      }),

    userId: z.string().meta({
      title: 'User ID',
      description:
        'The unique identifier of the user to whom the phone number is associated.',
      example: ['user-12345', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'],
    }),

    userRole: z
      .enum(UserRole)
      .describe('User role as defined in Prisma schema')
      .meta({
        title: 'User Role',
        description: 'Role of the user (used for authorization)',
        example: ['ADMIN', 'CUSTOMER'],
      }),

    number: z.coerce
      .string()
      .min(9, { error: 'Número de telefone deve ter no mínimo 9 dígitos' })
      .max(11, { error: 'Número de telefone deve ter no máximo 11 dígitos' })
      .meta({
        title: 'Phone Number',
        description:
          'Brazilian phone number including DDD (area code) with 9 to 11 digits',
        example: ['11987654321', '1123456789'],
      }),

    type: z.enum(phoneTypes, { error: 'Tipo de telefone inválido' }).meta({
      title: 'Phone Type',
      description: 'Type of phone number (mobile, home, or work)',
      example: phoneTypes,
    }),

    isWhatsapp: z.boolean().meta({
      title: 'Is WhatsApp',
      description: 'Indicates if the phone number is registered with WhatsApp',
      example: [true, false],
    }),
  })
  .meta({
    title: 'Phone Schema',
    description:
      "Schema representing a user's phone information including type and WhatsApp status",
    example: [
      {
        userId: 'user-12345',
        number: '11987654321',
        type: 'MOBILE',
        isWhatsapp: true,
      },
    ],
  })

export type ZodPhone = z.infer<typeof PhoneValidationSchema>

export class PhoneDTO extends createZodDto(PhoneValidationSchema) {}
