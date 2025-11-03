import { Injectable } from '@nestjs/common'

import { Either, left, right } from '@/core/either'
import { LoggerPort } from '@/core/ports/logger.port'
import { UseCaseBase } from '@/core/entities/base-use-case'

import { NotAllowedError } from '@/core/errors/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found.error'
import { CaslErpPolicyService } from '@/domain/erp/application/auth/casl/services/casl-erp-policy.service'

import { CustomerVehicle } from '@/domain/erp/enterprise/entities/customer-vehicle'
import { CaslCustomerVehicleMapper } from '@/domain/erp/application/auth/casl/mappers/casl-customer-vehicle.mapper'

import { CustomerVehiclesRepository } from '@/domain/erp/application/repositories/customer-vehicles.repository'

interface FetchCustomerVehiclesUseCaseRequest {
  page: number
  limit: number
  currentUserId: string
}

type FetchCustomerVehiclesUseCaseResponse = Either<
  NotAllowedError | ResourceNotFoundError,
  {
    customerVehicles: CustomerVehicle[]
  }
>

@Injectable()
export class FetchCustomerVehiclesUseCase extends UseCaseBase {
  static errors = [NotAllowedError, ResourceNotFoundError]

  constructor(
    logger: LoggerPort,
    private caslPermissionService: CaslErpPolicyService,
    private customerVehiclesRepository: CustomerVehiclesRepository,
  ) {
    super(logger)
  }

  async execute({
    page,
    limit,
    currentUserId,
  }: FetchCustomerVehiclesUseCaseRequest): Promise<FetchCustomerVehiclesUseCaseResponse> {
    const context = FetchCustomerVehiclesUseCase.name

    this.logger.log(
      `🚗 Fetching customer vehicles for page ${page} with limit ${limit}`,
      context,
    )

    const customerVehicles =
      await this.customerVehiclesRepository.findManyRecent({
        page,
        limit,
      })

    if (!customerVehicles || !customerVehicles.length) {
      return left(
        ResourceNotFoundError.create(
          { details: { resource: 'Customer vehicles' } },
          this.logger,
        ),
      )
    }

    for (const customerVehicle of customerVehicles) {
      const permissionResult = await this.caslPermissionService.verifyAbilities(
        {
          userId: currentUserId,
          appAbilities: [
            'GET',
            CaslCustomerVehicleMapper.toCasl(customerVehicle),
          ],
        },
      )

      if (permissionResult.isLeft()) return left(permissionResult.value)
    }

    this.logger.log(
      `✅ Successfully fetched ${customerVehicles.length} customer vehicles`,
      context,
    )

    return right({
      customerVehicles,
    })
  }
}
