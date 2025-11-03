import { Optional } from '@/core/types/optional'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { BreakdownAttachmentList } from '@/domain/erp/enterprise/entities/breakdown-attachment-list'
import { VehicleBreakdownCreatedEvent } from '@/domain/erp/enterprise/events/vehicle-breakdown-created.event'

import {
  Breakdown,
  BreakdownProps,
} from '@/domain/erp/enterprise/entities/breakdown'

export interface VehicleBreakdownProps extends BreakdownProps {
  ownerId: UniqueEntityID
  vehicleId: UniqueEntityID
}

export class VehicleBreakdown extends Breakdown<VehicleBreakdownProps> {
  get ownerId() {
    return this.props.ownerId
  }

  get vehicleId() {
    return this.props.vehicleId
  }

  get excerpt() {
    return this.description.substring(0, 120).trimEnd().concat('...')
  }

  static create(
    props: Optional<VehicleBreakdownProps, 'createdAt' | 'attachments'>,
    id?: UniqueEntityID,
  ) {
    const vehicleBreakdown = new VehicleBreakdown(
      {
        ...props,
        attachments: props.attachments ?? new BreakdownAttachmentList(),
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )

    const isNewVehicleBreakdown = !id

    if (isNewVehicleBreakdown) {
      vehicleBreakdown.addDomainEvent(
        new VehicleBreakdownCreatedEvent(vehicleBreakdown),
      )
    }

    return vehicleBreakdown
  }
}
