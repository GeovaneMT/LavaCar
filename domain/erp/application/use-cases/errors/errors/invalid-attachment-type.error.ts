import { Error } from '@/core/errors/error'
import { Optional } from '@/core/types/optional'
import { LoggerPort } from '@/core/ports/logger.port'
import { classNameToErrorCode } from '@/core/errors/utils/class-name-to-error-code'

import {
  InvalidAttachmentTypeErrorTitle,
  InvalidAttachmentTypeErrorSchema,
  InvalidAttachmentTypeErrorStatus,
  InvalidAttachmentTypeErrorDetail,
  type InvalidAttachmentTypeErrorProps,
} from '@/domain/erp/application/use-cases/errors/schemas/invalid-attachment-type.error.schema'

/**
 * Represents an application-level error thrown when
 * the attachment type is not valid for an operation.
 */
export class InvalidAttachmentTypeError extends Error<InvalidAttachmentTypeErrorProps> {
  static schema = InvalidAttachmentTypeErrorSchema
  static status = InvalidAttachmentTypeErrorStatus
  static detail = InvalidAttachmentTypeErrorDetail
  static className = InvalidAttachmentTypeError.name

  private readonly logger: LoggerPort

  constructor(props: InvalidAttachmentTypeErrorProps, logger: LoggerPort) {
    super(props)
    this.logger = logger
    this.logger.log(
      `❌ Invalid attachment type error: ${props.title}`,
      InvalidAttachmentTypeError.name,
    )
  }

  /**
   * Factory method to create an `InvalidAttachmentTypeError` instance.
   *
   * Automatically builds the message when not provided.
   */
  static create(
    props: Omit<
      Optional<InvalidAttachmentTypeErrorProps, 'detail' | 'details'>,
      'code' | 'title' | 'status' | 'schema' | 'className' | 'instance'
    >,
    logger: LoggerPort,
  ): InvalidAttachmentTypeError {
    const { type } = props.details ?? {}

    const generateDefaultMessage = () => {
      const defaultMessageParts: string[] = ['File type']

      if (type) defaultMessageParts.push(` "${type}"`)

      defaultMessageParts.push(' is not valid.')

      return defaultMessageParts.join('')
    }

    const message = props.detail ?? generateDefaultMessage()

    logger.debug?.(
      `Created InvalidAttachmentTypeError instance with message: ${message}`,
      InvalidAttachmentTypeError.name,
    )

    return new InvalidAttachmentTypeError(
      {
        code: classNameToErrorCode(this.name),
        title: InvalidAttachmentTypeErrorTitle,
        status: this.status,
        schema: this.schema,
        className: this.className,
        detail: message,
      },
      logger,
    )
  }
}
