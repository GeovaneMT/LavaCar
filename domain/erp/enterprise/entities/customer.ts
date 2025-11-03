import { Optional } from '@/core/types/optional'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { User, UserProps } from '@/domain/erp/enterprise/entities/user'

import { PhoneList } from '@/domain/erp/enterprise/entities/phones-list'
import { CustomerVehicleList } from '@/domain/erp/enterprise/entities/customer-vehicle-list'

import type { userRoleLitteral } from '@/core/enums/prisma.enums'

const _role: userRoleLitteral = 'CUSTOMER'

export interface CustomerProps extends UserProps {
  vehicles: CustomerVehicleList
  role: typeof _role
}

export class Customer extends User<CustomerProps> {
  get role() {
    return this.props.role
  }

  get phones() {
    return this.props.phones
  }

  get vehicles() {
    return this.props.vehicles
  }

  set vehicles(vehicles: CustomerVehicleList) {
    this.props.vehicles = vehicles
    this.touch()
  }

  static create(
    props: Omit<
      Optional<CustomerProps, 'createdAt' | 'vehicles' | 'phones'>,
      'role'
    >,
    id?: UniqueEntityID,
  ) {
    return new Customer(
      {
        ...props,
        role: 'CUSTOMER',
        createdAt: props.createdAt ?? new Date(),
        phones: props.phones ?? new PhoneList(),
        vehicles: props.vehicles ?? new CustomerVehicleList(),
      },
      id,
    )
  }
}
