import type { PaginationParams } from '@/core/params/pagination-params'

import type { CustomerVehicle } from '@/domain/erp/enterprise/entities/customer-vehicle'
import type { VehicleDetails } from '@/domain/erp/enterprise/entities/value-objects/vehicle-details'

export abstract class CustomerVehiclesRepository {
  abstract create(customerVehicle: CustomerVehicle): Promise<void>
  abstract save(customerVehicle: CustomerVehicle): Promise<void>
  abstract delete(customerVehicle: CustomerVehicle): Promise<void>

  abstract findById(id: string): Promise<CustomerVehicle | null>
  abstract findByPlate(plate: string): Promise<CustomerVehicle | null>

  abstract findDetailsById(id: string): Promise<VehicleDetails | null>
  abstract findDetailsByPlate(plate: string): Promise<VehicleDetails | null>

  abstract createMany(customerVehicles: CustomerVehicle[]): Promise<void>

  abstract deleteMany(customerVehicles: CustomerVehicle[]): Promise<void>
  abstract deleteManyByCustomerId(customerId: string): Promise<void>

  abstract findManyRecent(params: PaginationParams): Promise<CustomerVehicle[]>
  abstract findManyByType(
    type: string,
    params: PaginationParams,
  ): Promise<CustomerVehicle[] | null>

  abstract findManyByModel(
    model: string,
    params: PaginationParams,
  ): Promise<CustomerVehicle[] | null>

  abstract findManyByYear(
    year: string,
    params: PaginationParams,
  ): Promise<CustomerVehicle[] | null>

  abstract findManyByCustomerId(
    customerId: string,
  ): Promise<CustomerVehicle[] | null>
}
