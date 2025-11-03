import { AppAbility } from '.'
import { AbilityBuilder } from '@casl/ability'
import { UserRole } from '@/core/enums/prisma.enums'

import type { UserModelType } from '@/core/auth/casl/models/user.model'

type PermissionsByRole = (
  user: UserModelType,
  builder: AbilityBuilder<AppAbility>,
) => void

export const permissions: Record<UserRole, PermissionsByRole> = {
  ADMIN({ id: adminId }, { can, cannot }) {
    can('manage', 'all')

    cannot('manage', 'ME')
    can(['GET', 'UPDATE'], 'ME', { id: adminId })

    cannot('manage', 'PHONE')
    can('manage', 'PHONE', { userId: adminId })
    can('manage', 'PHONE', { userRole: 'CUSTOMER' })
  },

  CUSTOMER({ id: customerId }, { can }) {
    can('manage', 'PHONE', {
      userId: customerId,
    })

    can('GET', 'ME', { id: customerId })

    can('GET', 'CUSTOMER', { id: customerId })

    can(['GET', 'CREATE'], 'CUSTOMER_VEHICLE', {
      customerId,
    })

    can(['GET', 'CREATE'], 'VEHICLE_BREAKDOWN', {
      ownerId: customerId,
    })

    can(['GET', 'UPLOAD'], 'ATTACHMENT')
  },
}
