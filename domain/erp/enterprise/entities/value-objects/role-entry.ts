import { ValueObject } from '@/core/entities/value-object'
import { userRoleLitteral } from '@/core/enums/prisma.enums'
import { Optional } from '@/core/types/optional'

export interface RoleEntryProps {
  name: string
  phones: string[]
  userId: string
  role: userRoleLitteral

  createdAt: Date
  updatedAt?: Date | null
}

export class RoleEntry extends ValueObject<RoleEntryProps> {
  get name() {
    return this.props.name
  }

  get phones() {
    return this.props.phones
  }

  get userId() {
    return this.props.userId
  }

  get role() {
    return this.props.role
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  static create(props: Optional<RoleEntryProps, 'createdAt'>) {
    return new RoleEntry({ ...props, createdAt: props.createdAt ?? new Date() })
  }
}
