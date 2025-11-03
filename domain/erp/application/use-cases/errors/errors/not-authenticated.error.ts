import { Error } from '@/core/errors/error'
import { Optional } from '@/core/types/optional'
import { LoggerPort } from '@/core/ports/logger.port'
import { classNameToErrorCode } from '@/core/errors/utils/class-name-to-error-code'

import {
  NotAuthenticatedErrorTitle,
  NotAuthenticatedErrorSchema,
  NotAuthenticatedErrorStatus,
  NotAuthenticatedErrorDetail,
  type NotAuthenticatedErrorProps,
} from '@/domain/erp/application/use-cases/errors/schemas/not-authenticated.error.schema'

/**
 * Represents an application-level error thrown when
 * the attachment type is not valid for an operation.
 */
export class NotAuthenticatedError extends Error<NotAuthenticatedErrorProps> {
  static schema = NotAuthenticatedErrorSchema
  static status = NotAuthenticatedErrorStatus
  static className = NotAuthenticatedError.name
  static detail = NotAuthenticatedErrorDetail

  private readonly logger: LoggerPort

  constructor(props: NotAuthenticatedErrorProps, logger: LoggerPort) {
    super(props)
    this.logger = logger
    this.logger.log(
      `❌ Invalid attachment type error: ${props.title}`,
      NotAuthenticatedError.name,
    )
  }

  /**
   * Factory method to create an `NotAuthenticatedError` instance.
   *
   * Automatically builds the message when not provided.
   */
  static create(
    props: Omit<
      Optional<NotAuthenticatedErrorProps, 'detail' | 'details'>,
      'code' | 'title' | 'status' | 'schema' | 'className' | 'instance'
    >,
    logger: LoggerPort,
  ): NotAuthenticatedError {
    const { userName, userId } = props.details ?? {}

    const generateDefaultMessage = () => {
      const defaultMessageParts: string[] = ['User']

      if (userName) defaultMessageParts.push(` ${userName}`)
      if (userId) defaultMessageParts.push(` with ID ${userId}`)

      defaultMessageParts.push(' not authenticated')

      return defaultMessageParts.join('')
    }

    const message = props.detail ?? generateDefaultMessage()

    logger.debug?.(
      `Created NotAuthenticatedError instance with message: ${message}`,
      NotAuthenticatedError.name,
    )

    return new NotAuthenticatedError(
      {
        code: classNameToErrorCode(this.name),
        title: NotAuthenticatedErrorTitle,
        status: this.status,
        schema: this.schema,
        className: this.className,
        detail: message,
      },
      logger,
    )
  }
}
