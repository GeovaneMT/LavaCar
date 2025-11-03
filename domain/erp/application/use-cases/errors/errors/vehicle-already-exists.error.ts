import { Error } from '@/core/errors/error'
import { Optional } from '@/core/types/optional'
import { LoggerPort } from '@/core/ports/logger.port'
import { classNameToErrorCode } from '@/core/errors/utils/class-name-to-error-code'

import {
  VehicleAlreadyExistsErrorTitle,
  VehicleAlreadyExistsErrorSchema,
  VehicleAlreadyExistsErrorStatus,
  VehicleAlreadyExistsErrorDetail,
  type VehicleAlreadyExistsErrorProps,
} from '@/domain/erp/application/use-cases/errors/schemas/vehicle-already-exists.error.schema'

/**
 * Represents an application-level error thrown when
 * the attachment type is not valid for an operation.
 */
export class VehicleAlreadyExistsError extends Error<VehicleAlreadyExistsErrorProps> {
  static schema = VehicleAlreadyExistsErrorSchema
  static status = VehicleAlreadyExistsErrorStatus
  static className = VehicleAlreadyExistsError.name
  static detail = VehicleAlreadyExistsErrorDetail

  private readonly logger: LoggerPort

  constructor(props: VehicleAlreadyExistsErrorProps, logger: LoggerPort) {
    super(props)
    this.logger = logger
    this.logger.log(
      `❌ Invalid attachment type error: ${props.title}`,
      VehicleAlreadyExistsError.name,
    )
  }

  /**
   * Factory method to create an `VehicleAlreadyExistsError` instance.
   *
   * Automatically builds the message when not provided.
   */
  static create(
    props: Omit<
      Optional<VehicleAlreadyExistsErrorProps, 'detail' | 'details'>,
      'code' | 'title' | 'status' | 'schema' | 'className' | 'instance'
    >,
    logger: LoggerPort,
  ): VehicleAlreadyExistsError {
    const { plate } = props.details ?? {}

    const generateDefaultMessage = () => {
      const defaultMessageParts: string[] = ['Vehicle']

      if (plate) defaultMessageParts.push(` with the plate "${plate}"`)

      defaultMessageParts.push(' already exists.')

      return defaultMessageParts.join('')
    }

    const message = props.detail ?? generateDefaultMessage()

    logger.debug?.(
      `Created VehicleAlreadyExistsError instance with message: ${message}`,
      VehicleAlreadyExistsError.name,
    )

    return new VehicleAlreadyExistsError(
      {
        code: classNameToErrorCode(this.name),
        title: VehicleAlreadyExistsErrorTitle,
        status: this.status,
        schema: this.schema,
        className: this.className,
        detail: message,
      },
      logger,
    )
  }
}
