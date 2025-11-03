import type { Phone } from '@/domain/erp/enterprise/entities/phone'
import type { PhoneModelType as caslPhone } from '@/domain/erp/application/auth/casl/models/phone.model'

export class CaslPhoneMapper {
  /**
   * The magic function that converts phone domain entities to casl models
   */
  static toCasl(phone: Phone): caslPhone {
    return {
      ...phone,
      userRole: phone.userRole,
      id: phone.id.toString(),
      userId: phone.userId.toString(),
      __typename: 'PHONE',
    }
  }
}
