import type { Customer } from '@/domain/erp/enterprise/entities/customer'
import type { CustomerModelType as caslCustomer } from '@/domain/erp/application/auth/casl/models/customer.model'

export class CaslCustomerMapper {
  /**
   * The magic function that converts customer domain entities to casl models
   */
  static toCasl(customer: Customer): caslCustomer {
    return {
      ...customer,
      role: customer.role,
      id: customer.id.toString(),
      __typename: customer.role,
    }
  }
}
