import { Injectable } from '@nestjs/common'

import { LoggerPort } from '@/core/ports/logger.port'
import { DomainEvents } from '@/core/events/domain.events'
import { EventHandler } from '@/core/events/event.handler'

import { UseCaseBase } from '@/core/entities/base-use-case'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found.error'
import { SendNotificationUseCase } from '@/domain/notification/application/use-cases/send-notification'
import { VehicleBreakdownCreatedEvent } from '@/domain/erp/enterprise/events/vehicle-breakdown-created.event'
import { CustomerVehiclesRepository } from '@/domain/erp/application/repositories/customer-vehicles.repository'

@Injectable()
export class OnVehicleBreakdownCreated
  extends UseCaseBase
  implements EventHandler
{
  constructor(
    logger: LoggerPort,
    private readonly sendNotification: SendNotificationUseCase,
    private readonly customerVehiclesRepository: CustomerVehiclesRepository,
  ) {
    super(logger)
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    const context = OnVehicleBreakdownCreated.name

    this.logger.log('📡 Subscribing to VehicleBreakdownCreatedEvent', context)

    DomainEvents.register(
      this.handleVehicleBreakdownCreated.bind(this),
      VehicleBreakdownCreatedEvent.name,
    )
  }

  private async handleVehicleBreakdownCreated({
    vehicleBreakdown,
  }: VehicleBreakdownCreatedEvent) {
    const context = OnVehicleBreakdownCreated.name

    this.logger.log(
      `🚗 VehicleBreakdownCreatedEvent received for vehicleId=${vehicleBreakdown.vehicleId}`,
      context,
    )

    const vehicleId = vehicleBreakdown.vehicleId.toString()

    this.logger.debug?.(
      `Fetching customer vehicle for id=${vehicleId}`,
      context,
    )

    const customerVehicle =
      await this.customerVehiclesRepository.findById(vehicleId)

    if (!customerVehicle) {
      const errorMessage = `🚨 No customer vehicle found for vehicleId=${vehicleId}. Notification will not be sent.`
      this.logger.error(errorMessage, context)
      throw ResourceNotFoundError.create(
        {
          details: {
            resourceId: vehicleId,
            resource: 'customer vehicle',
          },
        },
        this.logger,
      )
    }

    const recipientId = customerVehicle.customerId.toString()

    this.logger.log(
      `📬 Sending notification to customerId=${recipientId} for vehicleId=${vehicleId}`,
      context,
    )

    await this.sendNotification.execute({
      title: `Nova avaria em "${customerVehicle.model
        .substring(0, 40)
        .concat('...')}"`,
      content: vehicleBreakdown.excerpt,
      recipientId,
      recipientRole: 'CUSTOMER',
    })

    this.logger.log(
      `✅ Notification successfully sent to customerId=${recipientId} for vehicleId=${vehicleId}`,
      context,
    )
  }
}
