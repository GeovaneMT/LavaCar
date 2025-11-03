import { vehicleType } from '@prisma/client'

import { ValueObject } from '@/core/entities/value-object'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { BreakdownDetails } from '@/domain/erp/enterprise/entities/value-objects/breakdown-details'

import { Plate } from '@/domain/erp/enterprise/entities/value-objects/plate'

export interface VehicleDetailsProps {
  vehicleId: UniqueEntityID
  ownerId: UniqueEntityID

  type: vehicleType

  year: string
  plate: Plate
  model: string

  breakdownDetails: BreakdownDetails[]

  createdAt: Date
  updatedAt?: Date | null
}

export class VehicleDetails extends ValueObject<VehicleDetailsProps> {
  get vehicleId() {
    return this.props.vehicleId
  }

  get ownerId() {
    return this.props.ownerId
  }

  get type() {
    return this.props.type
  }

  get year() {
    return this.props.year
  }

  get plate() {
    return this.props.plate
  }

  get model() {
    return this.props.model
  }

  get breakdownDetails() {
    return this.props.breakdownDetails
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  static create(props: VehicleDetailsProps) {
    return new VehicleDetails(props)
  }
}
