import { ValueObject } from '@/core/entities/value-object'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { Attachment } from '@/domain/erp/enterprise/entities/attachment'

export interface BreakdownDetailsProps {
  breakdownId: UniqueEntityID
  vehicleId: UniqueEntityID
  ownerId: UniqueEntityID

  description: string

  attachments: Attachment[]

  createdAt: Date
  updatedAt?: Date | null
}

export class BreakdownDetails extends ValueObject<BreakdownDetailsProps> {
  get breakdownId() {
    return this.props.breakdownId
  }

  get ownerId() {
    return this.props.ownerId
  }

  get vehicleId() {
    return this.props.vehicleId
  }

  get description() {
    return this.props.description
  }

  get attachments() {
    return this.props.attachments
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  static create(props: BreakdownDetailsProps) {
    return new BreakdownDetails(props)
  }
}
