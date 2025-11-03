import { z } from 'zod/v4'

export const PasswordValidationDTOSchema = z.object({
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long.' })
    .meta({
      title: 'Password',
      description: "User's password with complexity requirements",
      example: 'StrongPass@123',
    })
    .meta({
      title: 'Password Validation Schema',
      description:
        'Schema for validating passwords including length, uppercase, lowercase, numeric, and special character requirements',
      example: [{ password: 'StrongPass@123' }],
    }),
})

/**
 * Schema for validating user passwords.
 */
export const PasswordValidationSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long.' })
      .regex(/[A-Z]/, {
        message: 'Password must contain at least one uppercase letter.',
      })
      .regex(/[a-z]/, {
        message: 'Password must contain at least one lowercase letter.',
      })
      .regex(/\d/, { message: 'Password must contain at least one number.' })
      .regex(/[!@#$%^&*(),.?":{}|<>]/, {
        message: 'Password must contain at least one special character.',
      })
      .meta({
        title: 'Password',
        description: "User's password with complexity requirements",
        example: 'StrongPass@123',
      }),
  })
  .meta({
    id: 'PasswordValidationSchema',
    title: 'Password Validation Schema',
    description:
      'Schema for validating passwords including length, uppercase, lowercase, numeric, and special character requirements',
    example: [{ password: 'StrongPass@123' }],
  })

export type ZodPasswordValidate = z.infer<typeof PasswordValidationSchema>
