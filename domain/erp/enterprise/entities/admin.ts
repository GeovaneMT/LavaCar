import { Optional } from '@/core/types/optional'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { PhoneList } from '@/domain/erp/enterprise/entities/phones-list'

import { User, type UserProps } from '@/domain/erp/enterprise/entities/user'
import type { userRoleLitteral } from '@/core/enums/prisma.enums'

const _role: userRoleLitteral = 'ADMIN'

export interface AdminProps extends UserProps {
  role: typeof _role
}

export class Admin extends User<AdminProps> {
  get role() {
    return this.props.role
  }

  static create(
    props: Omit<Optional<AdminProps, 'createdAt' | 'phones'>, 'role'>,
    id?: UniqueEntityID,
  ) {
    return new Admin(
      {
        ...props,
        role: 'ADMIN',
        phones: props.phones ?? new PhoneList(),
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )
  }
}
