import type { AdminDetails } from '@/domain/erp/enterprise/entities/value-objects/admin-details'
import type { AdminModelType as caslAdmin } from '@/domain/erp/application/auth/casl/models/admin.model'

export class CaslAdminDetailsMapper {
  /**
   * The magic function that converts admin domain entities to casl models
   */
  static toCasl(admin: AdminDetails): caslAdmin {
    return {
      ...admin,
      role: admin.role,
      id: admin.adminId.toString(),
      __typename: admin.role,
    }
  }
}
