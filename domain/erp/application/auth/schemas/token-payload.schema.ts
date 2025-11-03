import { z } from 'zod/v4'

import { userRoles } from '@/core/enums/prisma.enums'

/**
 * Schema representing the payload contained in a user JWT token.
 */
export const TokenPayloadSchema = z
  .object({
    jti: z.string().meta({
      title: 'JWT ID',
      description: 'Unique identifier for the JWT token',
      example: 'token-1234567890',
    }),
    sub: z.string({ error: "Invalid 'sub' value." }).meta({
      title: 'Subject',
      description: 'The subject of the token, typically the user ID',
      example: 'user-12345',
    }),
    InternalId: z.string({ error: 'Invalid internal ID.' }).meta({
      title: 'Internal ID',
      description: 'Internal identifier of the user',
      example: 'internal-67890',
    }),

    role: z.literal(userRoles).meta({
      title: 'Role',
      description: 'Role of the user (used for authorization)',
      example: 'ADMIN',
    }),
  })
  .meta({
    id: 'TokenPayloadSchema',
    title: 'Token Payload Schema',
    description:
      'Payload contained in a JWT token representing user identity and role',
    example: [
      {
        jti: 'token-1234567890',
        sub: 'user-12345',
        InternalId: 'internal-67890',
        role: 'ADMIN',
      },
    ],
  })

export type UserPayload = z.infer<typeof TokenPayloadSchema>
