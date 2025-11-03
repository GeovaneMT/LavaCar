import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { userRoleLitteral, PhoneTypesLitteral } from '@/core/enums/prisma.enums'
import { PhoneValidationSchema } from '@/domain/erp/enterprise/entities/value-objects/schemas/phone.validation.schema'

export interface PhoneProps {
  userId: UniqueEntityID
  userRole: userRoleLitteral

  type: PhoneTypesLitteral
  number: string
  isWhatsapp: boolean
}

export class Phone extends Entity<PhoneProps> {
  get userId() {
    return this.props.userId
  }

  get userRole() {
    return this.props.userRole
  }

  get type() {
    return this.props.type
  }

  get number() {
    return this.props.number
  }

  get isWhatsapp() {
    return this.props.isWhatsapp
  }

  set type(type: PhoneTypesLitteral) {
    this.props.type = type
  }

  set number(number: string) {
    this.props.number = number
  }

  set isWhatsapp(isWhatsapp: boolean) {
    this.props.isWhatsapp = isWhatsapp
  }

  static create(
    props: Omit<PhoneProps, 'isWhatsapp'> &
      Partial<Pick<PhoneProps, 'isWhatsapp'>>,
    id?: UniqueEntityID,
  ) {
    const completeProps = {
      ...props,
      userId: props.userId.toString(),
      userRole: props.userRole,
      isWhatsapp: props.isWhatsapp ?? false,
    }

    const result = PhoneValidationSchema.safeParse(completeProps)

    if (result.error) {
      throw new Error(result.error.message)
    }

    const validatedPhone: PhoneProps = {
      ...result.data,
      userId: new UniqueEntityID(result.data.userId),
    }

    return new Phone(validatedPhone, id)
  }
}
