import type { CustomerDetails } from '@/domain/erp/enterprise/entities/value-objects/customer-details'
import type { CustomerModelType as caslCustomer } from '@/domain/erp/application/auth/casl/models/customer.model'

export class CaslCustomerDetailsMapper {
  /**
   * The magic function that converts customer domain entities to casl models
   */
  static toCasl(customer: CustomerDetails): caslCustomer {
    return {
      ...customer,
      role: customer.role,
      id: customer.customerId.toString(),
      __typename: customer.role,
    }
  }
}
