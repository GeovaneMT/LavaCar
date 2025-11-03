import type { PaginationParams } from '@/core/params/pagination-params'

import type { VehicleBreakdown } from '@/domain/erp/enterprise/entities/vehicle-breakdown'
import type { BreakdownDetails } from '@/domain/erp/enterprise/entities/value-objects/breakdown-details'

export abstract class VehicleBreakdownsRepository {
  abstract create(vehicleBreakdown: VehicleBreakdown): Promise<void>
  abstract save(vehicleBreakdown: VehicleBreakdown): Promise<void>
  abstract delete(vehicleBreakdown: VehicleBreakdown): Promise<void>

  abstract findById(id: string): Promise<VehicleBreakdown | null>

  abstract findDetailsById(id: string): Promise<BreakdownDetails | null>

  abstract createMany(vehicleBreakdowns: VehicleBreakdown[]): Promise<void>

  abstract deleteMany(vehicleBreakdowns: VehicleBreakdown[]): Promise<void>
  abstract deleteManyByVehicleId(vehicleId: string): Promise<void>

  abstract findManyRecent(params: PaginationParams): Promise<VehicleBreakdown[]>
  abstract findManyByDescription(
    description: string,
    params: PaginationParams,
  ): Promise<VehicleBreakdown[] | null>

  abstract findManyByVehicleId(
    vehicleId: string,
  ): Promise<VehicleBreakdown[] | null>
}
