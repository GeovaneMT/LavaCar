import { z } from 'zod/v4'

/**
 * Schema for validating an email address.
 */
export const EmailValidationSchema = z
  .object({
    email: z.email({ error: 'The provided email is invalid.' }).meta({
      title: 'Email',
      description: "User's email address",
      example: 'user@example.com',
    }),
  })
  .meta({
    id: 'EmailValidationSchema',
    title: 'Email Validation Schema',
    description: "Schema for validating a user's email address",
    example: [{ email: 'user@example.com' }],
  })

export type ZodEmail = z.infer<typeof EmailValidationSchema>
