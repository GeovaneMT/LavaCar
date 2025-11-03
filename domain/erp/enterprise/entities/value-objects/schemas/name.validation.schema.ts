import { z } from 'zod/v4'

/**
 * Schema for validating user names.
 */
export const NameValidationSchema = z
  .object({
    firstName: z
      .string()
      .min(3, { message: 'First name must be at least 3 characters' })
      .meta({
        title: 'First Name',
        description: "User's first name",
        example: 'John',
      }),

    lastName: z
      .string()
      .min(3, { message: 'Last name must be at least 3 characters' })
      .meta({
        title: 'Last Name',
        description: "User's last name",
        example: 'Doe',
      }),

    username: z
      .string()
      .min(3, { message: 'Username must be at least 3 characters' })
      .meta({
        title: 'Username',
        description: 'Unique username for the user',
        example: 'johndoe',
      }),
  })
  .meta({
    id: 'NameValidationSchema',
    title: 'Name Validation Schema',
    description:
      "Schema for validating user's first name, last name, and username",
    example: [
      {
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
      },
    ],
  })

export type ZodNameValidate = z.infer<typeof NameValidationSchema>
