import { ValueObject } from '@/core/entities/value-object'
import { NameValidationSchema } from '@/domain/erp/enterprise/entities/value-objects/schemas/name.validation.schema'

export interface NameProps {
  firstName: string
  lastName: string
  username: string
}

export class Name extends ValueObject<NameProps> {
  get firstName() {
    return this.props.firstName
  }

  get lastName() {
    return this.props.lastName
  }

  get username() {
    return this.props.username
  }

  static create(props: NameProps) {
    const { data: nameData, error } = NameValidationSchema.safeParse(props)
    if (error) throw new Error(error.message)

    return new Name(nameData)
  }
}
