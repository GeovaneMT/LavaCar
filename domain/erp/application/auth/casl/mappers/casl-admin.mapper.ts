import type { Admin } from '@/domain/erp/enterprise/entities/admin'
import type { AdminModelType as caslAdmin } from '@/domain/erp/application/auth/casl/models/admin.model'

export class CaslAdminMapper {
  /**
   * The magic function that converts admin domain entities to casl models
   */
  static toCasl(admin: Admin): caslAdmin {
    return {
      ...admin,
      role: admin.role,
      id: admin.id.toString(),
      __typename: admin.role,
    }
  }
}
