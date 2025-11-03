import { Injectable } from '@nestjs/common'

import { Either, left, right } from '@/core/either'
import { LoggerPort } from '@/core/ports/logger.port'

import { UseCaseBase } from '@/core/entities/base-use-case'

import { DeletedSuccess } from '@/core/success/succes/deleted.success'
import { NotAllowedError } from '@/core/errors/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found.error'

import { CaslErpPolicyService } from '@/domain/erp/application/auth/casl/services/casl-erp-policy.service'
import { CaslVehicleBreakdownMapper } from '@/domain/erp/application/auth/casl/mappers/casl-vehicle-breakdown.mapper'

import { VehicleBreakdownsRepository } from '@/domain/erp/application/repositories/vehicle-breakdowns.repository'

interface DeleteVehicleBreakdownUseCaseRequest {
  breakdownId: string
  currentUserId: string
}

type DeleteVehicleBreakdownUseCaseResponse = Either<
  NotAllowedError | ResourceNotFoundError,
  DeletedSuccess
>

@Injectable()
export class DeleteVehicleBreakdownUseCase extends UseCaseBase {
  static success = DeletedSuccess
  static errors = [NotAllowedError, ResourceNotFoundError]

  constructor(
    logger: LoggerPort,
    private caslPermissionService: CaslErpPolicyService,
    private vehicleBreakdownsRepository: VehicleBreakdownsRepository,
  ) {
    super(logger)
  }

  async execute({
    breakdownId,
    currentUserId,
  }: DeleteVehicleBreakdownUseCaseRequest): Promise<DeleteVehicleBreakdownUseCaseResponse> {
    const context = DeleteVehicleBreakdownUseCase.name

    this.logger.log(
      `🚨 Deleting vehicle breakdown with ID ${breakdownId}`,
      context,
    )

    const breakdownToDelete =
      await this.vehicleBreakdownsRepository.findById(breakdownId)

    if (!breakdownToDelete) {
      return left(
        ResourceNotFoundError.create(
          {
            details: {
              resource: 'vehicle breakdown',
              resourceId: breakdownId,
            },
          },
          this.logger,
        ),
      )
    }

    const permissionResult = await this.caslPermissionService.verifyAbilities({
      userId: currentUserId,
      appAbilities: [
        'DELETE',
        CaslVehicleBreakdownMapper.toCasl(breakdownToDelete),
      ],
    })

    if (permissionResult.isLeft()) return left(permissionResult.value)

    await this.vehicleBreakdownsRepository.delete(breakdownToDelete)

    this.logger.log(
      `✅ Vehicle breakdown with ID ${breakdownId} deleted successfully`,
      context,
    )

    return right(
      DeletedSuccess.create(
        { meta: { resource: 'vehicle breakdown' } },
        this.logger,
      ),
    )
  }
}
