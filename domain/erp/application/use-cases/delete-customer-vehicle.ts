import { Injectable } from '@nestjs/common'

import { Either, left, right } from '@/core/either'
import { LoggerPort } from '@/core/ports/logger.port'

import { DeletedSuccess } from '@/core/success/succes/deleted.success'
import { NotAllowedError } from '@/core/errors/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found.error'

import { CaslErpPolicyService } from '@/domain/erp/application/auth/casl/services/casl-erp-policy.service'
import { CaslCustomerVehicleMapper } from '@/domain/erp/application/auth/casl/mappers/casl-customer-vehicle.mapper'

import { UseCaseBase } from '@/core/entities/base-use-case'

import { CustomerVehiclesRepository } from '@/domain/erp/application/repositories/customer-vehicles.repository'

interface DeleteCustomerVehicleUseCaseRequest {
  vehicleId: string
  currentUserId: string
}

type DeleteCustomerVehicleUseCaseResponse = Either<
  NotAllowedError | ResourceNotFoundError,
  DeletedSuccess
>

@Injectable()
export class DeleteCustomerVehicleUseCase extends UseCaseBase {
  static success = DeletedSuccess
  static errors = [NotAllowedError, ResourceNotFoundError]

  constructor(
    logger: LoggerPort,
    private caslPermissionService: CaslErpPolicyService,
    private vehicleToDeletesRepository: CustomerVehiclesRepository,
  ) {
    super(logger)
  }

  async execute({
    vehicleId,
    currentUserId,
  }: DeleteCustomerVehicleUseCaseRequest): Promise<DeleteCustomerVehicleUseCaseResponse> {
    const context = DeleteCustomerVehicleUseCase.name

    this.logger.log(
      `🚗 Deleting customer vehicle with ID ${vehicleId}`,
      context,
    )

    const vehicleToDelete =
      await this.vehicleToDeletesRepository.findById(vehicleId)

    if (!vehicleToDelete) {
      return left(
        ResourceNotFoundError.create(
          {
            details: {
              resource: 'vehicle',
              resourceId: vehicleId,
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
        CaslCustomerVehicleMapper.toCasl(vehicleToDelete),
      ],
    })

    if (permissionResult.isLeft()) return left(permissionResult.value)

    await this.vehicleToDeletesRepository.delete(vehicleToDelete)

    this.logger.log(
      `✅ Customer vehicle with ID ${vehicleId} deleted successfully`,
      context,
    )

    return right(
      DeletedSuccess.create(
        { meta: { resource: 'Customer vehicle' } },
        this.logger,
      ),
    )
  }
}
