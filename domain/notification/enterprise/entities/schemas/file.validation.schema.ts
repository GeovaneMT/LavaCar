import { z } from 'zod/v4'

/**
 * Schema for validating uploaded files.
 * Supports size limits and MIME type validation.
 */
export const FileValidationSchema = z
  .file()
  .min(10_000, { message: 'File size must be at least 10 KB' }) // minimum size in bytes
  .max(1_000_000, { message: 'File size must be at most 1 MB' }) // maximum size in bytes
  .refine((file) => file.type === 'image/png', {
    message: 'Only PNG files are allowed',
  }) // MIME type check
  .meta({
    id: 'FileValidationSchema',
    title: 'File Upload Schema',
    description: 'Schema for validating uploaded files (PNG only, 10 KB–1 MB)',
    example: [
      {
        name: 'example.png',
        size: 150_000,
        type: 'image/png',
      },
    ],
  })

export type ZodFile = z.infer<typeof FileValidationSchema>
