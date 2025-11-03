import type { Admin } from '@/domain/erp/enterprise/entities/admin'
import type { Customer } from '@/domain/erp/enterprise/entities/customer'

import type { MeModelType as caslme } from '@/domain/erp/application/auth/casl/models/me.model'

export class CaslAdminMapper {
  /**
   * The magic function that converts admin or customer domain entities to casl me model
   */
  static toCasl(me: Admin | Customer): caslme {
    return {
      ...me,
      role: me.role,
      id: me.id.toString(),
      __typename: 'ME',
    }
  }
}
