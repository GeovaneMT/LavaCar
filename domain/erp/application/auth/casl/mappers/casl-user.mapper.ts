import type { UserModelType as caslUser } from '@/core/auth/casl/models/user.model'
import type { User, UserProps } from '@/domain/erp/enterprise/entities/user'

export class CaslUserMapper {
  /**
   * The magic function that converts user domain entities to casl models
   */
  static toCasl(user: User<UserProps>): caslUser {
    return {
      ...user,
      role: user.role,
      id: user.id.toString(),
      __typename: user.role,
    }
  }
}
