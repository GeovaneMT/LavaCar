import { Injectable } from '@nestjs/common'

import { Either, left, right } from '@/core/either'
import { LoggerPort } from '@/core/ports/logger.port'
import { assertNever } from '@/core/utils/assert-never'
import { UseCaseBase } from '@/core/entities/base-use-case'

import { NotAllowedError } from '@/core/errors/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found.error'
import { CaslErpPolicyService } from '@/domain/erp/application/auth/casl/services/casl-erp-policy.service'

import { CaslAdminDetailsMapper } from '@/domain/erp/application/auth/casl/mappers/casl-admin-details.mapper'
import { CaslCustomerDetailsMapper } from '@/domain/erp/application/auth/casl/mappers/casl-customer-details.mapper'

import { AdminsRepository } from '@/domain/erp/application/repositories/admins.repository'
import { CustomersRepository } from '@/domain/erp/application/repositories/customers.repository'

import type { AdminDetails } from '@/domain/erp/enterprise/entities/value-objects/admin-details'
import type { CustomerDetails } from '@/domain/erp/enterprise/entities/value-objects/customer-details'

type GetMeUseCaseResponse = Either<
  NotAllowedError | ResourceNotFoundError,
  {
    meDetails: AdminDetails | CustomerDetails
  }
>

@Injectable()
export class GetMeUseCase extends UseCaseBase {
  static errors = [NotAllowedError, ResourceNotFoundError]

  constructor(
    logger: LoggerPort,
    private adminsRepository: AdminsRepository,
    private customersRepository: CustomersRepository,
    private caslPermissionService: CaslErpPolicyService,
  ) {
    super(logger)
  }

  async execute(currentUserId: string): Promise<GetMeUseCaseResponse> {
    const context = GetMeUseCase.name

    this.logger.log(`👤 Fetching me by ID ${currentUserId}`, context)

    const meDetails =
      (await this.adminsRepository.findDetailsById(currentUserId)) ??
      (await this.customersRepository.findDetailsById(currentUserId))

    if (!meDetails) {
      return left(
        ResourceNotFoundError.create(
          { details: { resource: 'Me', resourceId: currentUserId } },
          this.logger,
        ),
      )
    }

    const permissionResult = await this.caslPermissionService.verifyAbilities({
      userId: currentUserId,
      appAbilities: [
        'GET',
        (() => {
          switch (meDetails.role) {
            case 'ADMIN':
              return CaslAdminDetailsMapper.toCasl(meDetails)
            case 'CUSTOMER':
              return CaslCustomerDetailsMapper.toCasl(meDetails)
            default:
              return assertNever(meDetails)
          }
        })(),
      ],
    })

    if (permissionResult.isLeft()) return left(permissionResult.value)

    this.logger.log(
      `✅ Successfully fetched me details by ID ${currentUserId}`,
      context,
    )

    return right({
      meDetails,
    })
  }
}
