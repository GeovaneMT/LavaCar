import { Error } from '@/core/errors/error'
import { Optional } from '@/core/types/optional'
import { LoggerPort } from '@/core/ports/logger.port'
import { classNameToErrorCode } from '@/core/errors/utils/class-name-to-error-code'

import {
  UserAlreadyExistsErrorTitle,
  UserAlreadyExistsErrorSchema,
  UserAlreadyExistsErrorStatus,
  UserAlreadyExistsErrorDetail,
  type UserAlreadyExistsErrorProps,
} from '@/domain/erp/application/use-cases/errors/schemas/user-already-exists.error.schema'

/**
 * Represents an application-level error thrown when
 * the attachment type is not valid for an operation.
 */
export class UserAlreadyExistsError extends Error<UserAlreadyExistsErrorProps> {
  static schema = UserAlreadyExistsErrorSchema
  static status = UserAlreadyExistsErrorStatus
  static className = UserAlreadyExistsError.name
  static detail = UserAlreadyExistsErrorDetail

  private readonly logger: LoggerPort

  constructor(props: UserAlreadyExistsErrorProps, logger: LoggerPort) {
    super(props)
    this.logger = logger
    this.logger.log(
      `❌ Invalid attachment type error: ${props.title}`,
      UserAlreadyExistsError.name,
    )
  }

  /**
   * Factory method to create an `UserAlreadyExistsError` instance.
   *
   * Automatically builds the message when not provided.
   */
  static create(
    props: Omit<
      Optional<UserAlreadyExistsErrorProps, 'detail' | 'details'>,
      'code' | 'title' | 'status' | 'schema' | 'className' | 'instance'
    >,
    logger: LoggerPort,
  ): UserAlreadyExistsError {
    const { identifier } = props.details ?? {}

    const generateDefaultMessage = () => {
      const defaultMessageParts: string[] = ['User']

      if (identifier)
        defaultMessageParts.push(` with the identifier "${identifier}"`)

      defaultMessageParts.push(' already exists.')

      return defaultMessageParts.join('')
    }

    const message = props.detail ?? generateDefaultMessage()

    logger.debug?.(
      `Created UserAlreadyExistsError instance with message: ${message}`,
      UserAlreadyExistsError.name,
    )

    return new UserAlreadyExistsError(
      {
        code: classNameToErrorCode(this.name),
        title: UserAlreadyExistsErrorTitle,
        status: this.status,
        schema: this.schema,
        className: this.className,
        detail: message,
      },
      logger,
    )
  }
}
