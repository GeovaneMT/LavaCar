import { Injectable } from '@nestjs/common'

import { Either, left, right } from '@/core/either'
import { LoggerPort } from '@/core/ports/logger.port'
import { UseCaseBase } from '@/core/entities/base-use-case'

import { NotAllowedError } from '@/core/errors/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found.error'
import { CaslErpPolicyService } from '@/domain/erp/application/auth/casl/services/casl-erp-policy.service'

import { VehicleBreakdown } from '@/domain/erp/enterprise/entities/vehicle-breakdown'
import { CaslVehicleBreakdownMapper } from '@/domain/erp/application/auth/casl/mappers/casl-vehicle-breakdown.mapper'

import { VehicleBreakdownsRepository } from '@/domain/erp/application/repositories/vehicle-breakdowns.repository'

interface FetchVehicleBreakdownsUseCaseRequest {
  page: number
  limit: number
  currentUserId: string
}

type FetchVehicleBreakdownsUseCaseResponse = Either<
  NotAllowedError | ResourceNotFoundError,
  {
    vehicleBreakdowns: VehicleBreakdown[]
  }
>

@Injectable()
export class FetchVehicleBreakdownsUseCase extends UseCaseBase {
  static errors = [NotAllowedError, ResourceNotFoundError]

  constructor(
    logger: LoggerPort,
    private caslPermissionService: CaslErpPolicyService,
    private vehicleBreakdownsRepository: VehicleBreakdownsRepository,
  ) {
    super(logger)
  }

  async execute({
    page,
    limit,
    currentUserId,
  }: FetchVehicleBreakdownsUseCaseRequest): Promise<FetchVehicleBreakdownsUseCaseResponse> {
    const context = FetchVehicleBreakdownsUseCase.name

    this.logger.log(
      `🚨 Fetching vehicle breakdowns for page ${page} with limit ${limit}`,
      context,
    )

    const vehicleBreakdowns =
      await this.vehicleBreakdownsRepository.findManyRecent({
        page,
        limit,
      })

    if (!vehicleBreakdowns || !vehicleBreakdowns.length) {
      return left(
        ResourceNotFoundError.create(
          { details: { resource: 'Vehicle breakdowns' } },
          this.logger,
        ),
      )
    }

    for (const vehicleBreakdown of vehicleBreakdowns) {
      const permissionResult = await this.caslPermissionService.verifyAbilities(
        {
          userId: currentUserId,
          appAbilities: [
            'GET',
            CaslVehicleBreakdownMapper.toCasl(vehicleBreakdown),
          ],
        },
      )

      if (permissionResult.isLeft()) return left(permissionResult.value)
    }

    this.logger.log(
      `✅ Successfully fetched ${vehicleBreakdowns.length} vehicle breakdowns`,
      context,
    )

    return right({
      vehicleBreakdowns,
    })
  }
}
