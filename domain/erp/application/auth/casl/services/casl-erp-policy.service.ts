import { Injectable } from '@nestjs/common'

import { Either, left, right } from '@/core/either'
import { LoggerPort } from '@/core/ports/logger.port'

import { NotAllowedError } from '@/core/errors/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found.error'

import { CaslUserMapper } from '@/domain/erp/application/auth/casl/mappers/casl-user.mapper'

import { AdminsRepository } from '@/domain/erp/application/repositories/admins.repository'
import { CustomersRepository } from '@/domain/erp/application/repositories/customers.repository'

import {
  AppAbility,
  AppAbilities,
  defineAbilityFor,
} from '@/domain/erp/application/auth/casl'

type verifyAbilitiesProps = {
  userId: string
  appAbilities: AppAbilities
}

type verifyAbilitiesResult = Either<
  NotAllowedError | ResourceNotFoundError,
  null
>

type buildAbilityResult = Either<ResourceNotFoundError, AppAbility>

@Injectable()
export class CaslErpPolicyService {
  constructor(
    private readonly logger: LoggerPort,
    private readonly adminsRepository: AdminsRepository,
    private readonly customersRepository: CustomersRepository,
  ) {}

  /**
   * Resolve user entity (Admin or Customer) and define ability.
   */
  async buildAbility(userId: string): Promise<buildAbilityResult> {
    const user =
      (await this.adminsRepository.findById(userId)) ??
      (await this.customersRepository.findById(userId))

    if (!user) {
      return left(
        ResourceNotFoundError.create(
          { details: { resource: 'User', resourceId: userId } },
          this.logger,
        ),
      )
    }

    return right(defineAbilityFor(CaslUserMapper.toCasl(user)))
  }

  /**
   * Direct permission check (Domain-level use cases)
   */
  async verifyAbilities({
    userId,
    appAbilities,
  }: verifyAbilitiesProps): Promise<verifyAbilitiesResult> {
    const ability = await this.buildAbility(userId)
    if (ability.isLeft()) return left(ability.value)

    const can = ability.value.can(...appAbilities)

    this.logger.debug?.(
      `CASL permission result: ${can}`,
      CaslErpPolicyService.name,
    )

    if (!can)
      return left(NotAllowedError.create({ details: { userId } }, this.logger))

    return right(null)
  }
}
