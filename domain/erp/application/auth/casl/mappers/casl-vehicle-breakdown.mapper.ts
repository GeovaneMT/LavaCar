import type { VehicleBreakdown } from '@/domain/erp/enterprise/entities/vehicle-breakdown'
import type { VehicleBreakdownModelType as caslVehicleBreakdown } from '@/domain/erp/application/auth/casl/models/vehicle-breakdown.model'

export class CaslVehicleBreakdownMapper {
  /**
   * The magic function that converts customer vehicles domain entities to casl models
   */
  static toCasl(breakdown: VehicleBreakdown): caslVehicleBreakdown {
    return {
      ...breakdown,
      id: breakdown.id.toString(),
      ownerId: breakdown.ownerId.toString(),
      vehicleId: breakdown.vehicleId.toString(),
      __typename: 'VEHICLE_BREAKDOWN',
    }
  }
}
