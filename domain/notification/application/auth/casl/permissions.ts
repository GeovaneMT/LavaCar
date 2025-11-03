import { AppAbility } from '.'
import { AbilityBuilder } from '@casl/ability'

import { UserRole } from '@/core/enums/prisma.enums'
import { UserModelType } from '@/core/auth/casl/models/user.model'

type PermissionsByRole = (
  user: UserModelType,
  builder: AbilityBuilder<AppAbility>,
) => void

export const permissions: Record<UserRole, PermissionsByRole> = {
  ADMIN({ id: adminId }, { can, cannot }) {
    can('manage', 'all')

    cannot('SEND', 'NOTIFICATION')
    can('SEND', 'NOTIFICATION', { recipientId: adminId })
    can('SEND', 'NOTIFICATION', { recipientRole: 'CUSTOMER' })

    cannot('READ', 'NOTIFICATION')
    can('READ', 'NOTIFICATION', { recipientId: adminId })
  },

  CUSTOMER({ id: customerId }, { can }) {
    can('SEND', 'NOTIFICATION', { recipientId: customerId })
    can('READ', 'NOTIFICATION', { recipientId: customerId })
  },
}
