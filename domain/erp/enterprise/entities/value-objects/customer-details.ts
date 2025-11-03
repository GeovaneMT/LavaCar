import { ValueObject } from '@/core/entities/value-object'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { Phone } from '@/domain/erp/enterprise/entities/phone'
import { VehicleDetails } from '@/domain/erp/enterprise/entities/value-objects/vehicle-details'

import { Name } from '@/domain/erp/enterprise/entities/value-objects/name'
import { Email } from '@/domain/erp/enterprise/entities/value-objects/email'

export interface CustomerDetailsProps {
  customerId: UniqueEntityID
  authProviderUserId?: string

  role: 'CUSTOMER'

  name: Name
  email: Email

  phones: Phone[]
  vehiclesDetails: VehicleDetails[]

  createdAt: Date
  updatedAt?: Date | null
}

export class CustomerDetails extends ValueObject<CustomerDetailsProps> {
  get customerId() {
    return this.props.customerId
  }

  get authProviderUserId() {
    return this.props.authProviderUserId
  }

  get role() {
    return this.props.role
  }

  get name() {
    return this.props.name
  }

  get email() {
    return this.props.email
  }

  get phones() {
    return this.props.phones
  }

  get vehiclesDetails() {
    return this.props.vehiclesDetails
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  static create(props: CustomerDetailsProps) {
    return new CustomerDetails(props)
  }
}
