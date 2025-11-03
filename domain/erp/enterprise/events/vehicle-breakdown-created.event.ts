import { DomainEvent } from '@/core/events/domain.event'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { VehicleBreakdown } from '@/domain/erp/enterprise/entities/vehicle-breakdown'

export class VehicleBreakdownCreatedEvent implements DomainEvent {
  public occurredAt: Date
  public vehicleBreakdown: VehicleBreakdown

  constructor(vehicleBreakdown: VehicleBreakdown) {
    this.vehicleBreakdown = vehicleBreakdown
    this.occurredAt = new Date()
  }

  getAggregateId(): UniqueEntityID {
    return this.vehicleBreakdown.id
  }
}
