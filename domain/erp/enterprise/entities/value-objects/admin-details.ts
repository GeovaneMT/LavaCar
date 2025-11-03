import { ValueObject } from '@/core/entities/value-object'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { Phone } from '@/domain/erp/enterprise/entities/phone'

import { Name } from '@/domain/erp/enterprise/entities/value-objects/name'
import { Email } from '@/domain/erp/enterprise/entities/value-objects/email'

export interface AdminDetailsProps {
  adminId: UniqueEntityID
  authProviderUserId?: string

  role: 'ADMIN'

  name: Name
  email: Email

  phones: Phone[]

  createdAt: Date
  updatedAt?: Date | null
}

export class AdminDetails extends ValueObject<AdminDetailsProps> {
  get adminId() {
    return this.props.adminId
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

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  static create(props: AdminDetailsProps) {
    return new AdminDetails(props)
  }
}
