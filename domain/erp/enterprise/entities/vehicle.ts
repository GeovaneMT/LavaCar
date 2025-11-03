import { AggregateRoot } from '@/core/entities/aggregate-root'

import { vehicleType } from '@prisma/client'

import { Plate } from '@/domain/erp/enterprise/entities/value-objects/plate'
import { VehicleBreakdownList } from '@/domain/erp/enterprise/entities/vehicle-breakdown-list'

export interface VehicleProps {
  type: vehicleType
  year: string
  plate: Plate
  model: string

  breakdowns: VehicleBreakdownList

  createdAt: Date
  updatedAt?: Date | null
}

export abstract class Vehicle<
  Props extends VehicleProps,
> extends AggregateRoot<Props> {
  get type() {
    return this.props.type
  }

  get year() {
    return this.props.year
  }

  get plate() {
    return this.props.plate
  }

  get model() {
    return this.props.model
  }

  get breakdowns() {
    return this.props.breakdowns
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  set type(type: vehicleType) {
    this.props.type = type
    this.touch()
  }

  set year(year: string) {
    this.props.year = year
    this.touch()
  }

  set plate(plate: Plate) {
    this.props.plate = plate
    this.touch()
  }

  set model(model: string) {
    this.props.model = model
    this.touch()
  }

  set breakdowns(breakdowns: VehicleBreakdownList) {
    this.props.breakdowns = breakdowns
    this.touch()
  }

  touch() {
    this.props.updatedAt = new Date()
  }
}
