import { AggregateRoot } from '@/core/entities/aggregate-root'

import { PhoneList } from '@/domain/erp/enterprise/entities/phones-list'

import { Name } from '@/domain/erp/enterprise/entities/value-objects/name'
import { Email } from '@/domain/erp/enterprise/entities/value-objects/email'

import type { userRoleLitteral } from '@/core/enums/prisma.enums'

export interface UserProps {
  authProviderUserId?: string
  role: userRoleLitteral

  name: Name
  email: Email
  password: string

  phones: PhoneList

  createdAt: Date
  updatedAt?: Date | null
}

export abstract class User<
  Props extends UserProps,
> extends AggregateRoot<Props> {
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

  get password() {
    return this.props.password
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

  set authProviderUserId(authProviderUserId: string | undefined) {
    this.props.authProviderUserId = authProviderUserId
    this.touch()
  }

  set name(name: Name) {
    this.props.name = name
    this.touch()
  }

  set email(email: Email) {
    this.props.email = email
    this.touch()
  }

  set password(password: string) {
    this.props.password = password
    this.touch()
  }

  set phones(phones: PhoneList) {
    this.props.phones = phones
    this.touch()
  }

  touch() {
    this.props.updatedAt = new Date()
  }
}
