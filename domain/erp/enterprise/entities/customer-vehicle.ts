import { Optional } from '@/core/types/optional'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { Vehicle, VehicleProps } from '@/domain/erp/enterprise/entities/vehicle'

import { VehicleBreakdownList } from '@/domain/erp/enterprise/entities/vehicle-breakdown-list'

export interface CustomerVehicleProps extends VehicleProps {
  customerId: UniqueEntityID
}

export class CustomerVehicle extends Vehicle<CustomerVehicleProps> {
  get customerId() {
    return this.props.customerId
  }

  static create(
    props: Optional<CustomerVehicleProps, 'createdAt' | 'breakdowns'>,
    id?: UniqueEntityID,
  ) {
    return new CustomerVehicle(
      {
        ...props,
        breakdowns: props.breakdowns ?? new VehicleBreakdownList(),
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )
  }
}
