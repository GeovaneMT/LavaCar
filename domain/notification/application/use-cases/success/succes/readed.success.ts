import { Success } from '@/core/success/success'
import { Optional } from '@/core/types/optional'
import { LoggerPort } from '@/core/ports/logger.port'

import {
  ReadedSuccessSchema,
  ReadedSuccessStatusCode,
  type ReadedSuccessProps,
} from '@/domain/notification/application/use-cases/success/schemas/readed.success.schema'

/**
 * Represents an application-level success returned when
 * a resource is readed in an operation.
 */
export class ReadedSuccess extends Success<ReadedSuccessProps> {
  static readonly status = ReadedSuccessStatusCode
  static readonly schema = ReadedSuccessSchema
  static readonly className = ReadedSuccess.name

  private readonly logger: LoggerPort

  constructor(props: ReadedSuccessProps, logger: LoggerPort) {
    super(props)
    this.logger = logger
    this.logger.log(
      `✅ Readed success for resource: ${props.meta?.resource || 'unknown'}`,
      ReadedSuccess.name,
    )
  }

  /**
   * Factory method to create a `ReadedSuccess` instance.
   *
   * Automatically builds the message when not provided.
   */
  static create(
    props: Omit<
      Optional<ReadedSuccessProps, 'meta' | 'data' | 'description'>,
      'status' | 'schema' | 'className'
    >,
    logger: LoggerPort,
  ): ReadedSuccess {
    const { resource } = props.meta ?? {}

    const generateDefaultMessage = () => {
      const defaultMessageParts: string[] = ['Readed successfully']

      if (resource) defaultMessageParts.push(`; resource: ${resource}.`)

      return defaultMessageParts.join('')
    }

    const description = props.description ?? generateDefaultMessage()

    logger.debug?.(
      `Readed ReadedSuccess instance with message: ${description}`,
      ReadedSuccess.name,
    )

    return new ReadedSuccess(
      {
        description,
        status: this.status,
        schema: this.schema,
        className: this.className,
      },
      logger,
    )
  }
}
