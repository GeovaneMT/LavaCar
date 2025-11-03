import type { CustomerVehicle } from '@/domain/erp/enterprise/entities/customer-vehicle'
import type { CustomerVehicleModelType as caslCustomerVehicle } from '@/domain/erp/application/auth/casl/models/customer-vehicle.model'

export class CaslCustomerVehicleMapper {
  /**
   * The magic function that converts customer vehicles domain entities to casl models
   */
  static toCasl(vehicle: CustomerVehicle): caslCustomerVehicle {
    return {
      ...vehicle,
      id: vehicle.id.toString(),
      customerId: vehicle.customerId.toString(),
      __typename: 'CUSTOMER_VEHICLE',
    }
  }
}
