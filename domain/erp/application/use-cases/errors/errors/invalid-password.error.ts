import { Error } from '@/core/errors/error'
import { Optional } from '@/core/types/optional'
import { LoggerPort } from '@/core/ports/logger.port'
import { classNameToErrorCode } from '@/core/errors/utils/class-name-to-error-code'

import {
  InvalidPasswordErrorTitle,
  InvalidPasswordErrorSchema,
  InvalidPasswordErrorStatus,
  InvalidPasswordErrorDetail,
  type InvalidPasswordErrorProps,
} from '@/domain/erp/application/use-cases/errors/schemas/invalid-password.error.schema'

/**
 * Represents an application-level error thrown when
 * the attachment type is not valid for an operation.
 */
export class InvalidPasswordError extends Error<InvalidPasswordErrorProps> {
  static schema = InvalidPasswordErrorSchema
  static status = InvalidPasswordErrorStatus
  static className = InvalidPasswordError.name
  static detail = InvalidPasswordErrorDetail

  private readonly logger: LoggerPort

  constructor(props: InvalidPasswordErrorProps, logger: LoggerPort) {
    super(props)
    this.logger = logger
    this.logger.log(
      `❌ Invalid attachment type error: ${props.title}`,
      InvalidPasswordError.name,
    )
  }

  /**
   * Factory method to create an `InvalidPasswordError` instance.
   *
   * Automatically builds the message when not provided.
   */
  static create(
    props: Omit<
      Optional<InvalidPasswordErrorProps, 'detail' | 'details'>,
      'code' | 'title' | 'status' | 'schema' | 'className' | 'instance'
    >,
    logger: LoggerPort,
  ): InvalidPasswordError {
    const { password, error } = props.details ?? {}

    const generateDefaultMessage = () => {
      const defaultMessageParts: string[] = ['Password']

      if (password) defaultMessageParts.push(password)
      defaultMessageParts.push(' is not valid')

      if (error) defaultMessageParts.push(`: ${error}`)

      defaultMessageParts.push('.')

      return defaultMessageParts.join('')
    }

    const message = props.detail ?? generateDefaultMessage()

    logger.debug?.(
      `Created InvalidPasswordError instance with message: ${message}`,
      InvalidPasswordError.name,
    )

    return new InvalidPasswordError(
      {
        code: classNameToErrorCode(this.name),
        title: InvalidPasswordErrorTitle,
        status: this.status,
        schema: this.schema,
        className: this.className,
        detail: message,
      },
      logger,
    )
  }
}
