import { Injectable } from '@nestjs/common'

import { Either, left, right } from '@/core/either'
import { LoggerPort } from '@/core/ports/logger.port'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { UseCaseBase } from '@/core/entities/base-use-case'

import { CreatedSuccess } from '@/core/success/succes/created.success'
import { NotAllowedError } from '@/core/errors/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found.error'

import { VehicleBreakdown } from '@/domain/erp/enterprise/entities/vehicle-breakdown'
import { BreakdownAttachment } from '@/domain/erp/enterprise/entities/breakdown-attachment'

import { CaslErpPolicyService } from '@/domain/erp/application/auth/casl/services/casl-erp-policy.service'
import { CaslVehicleBreakdownMapper } from '@/domain/erp/application/auth/casl/mappers/casl-vehicle-breakdown.mapper'

import { CustomerVehiclesRepository } from '@/domain/erp/application/repositories/customer-vehicles.repository'
import { VehicleBreakdownsRepository } from '@/domain/erp/application/repositories/vehicle-breakdowns.repository'
import { AttachmentsRepository } from '../repositories/attachments.repository'

interface CreateVehicleBreakdownsUseCaseRequest {
  vehicleId: string
  description: string
  currentUserId: string
  attachmentsIds: string[]
}

type CreateVehicleBreakdownsUseCaseResponse = Either<
  NotAllowedError | ResourceNotFoundError,
  CreatedSuccess
>

@Injectable()
export class CreateVehicleBreakdownsUseCase extends UseCaseBase {
  static success = CreatedSuccess
  static errors = [NotAllowedError, ResourceNotFoundError]

  constructor(
    logger: LoggerPort,
    private caslPermissionService: CaslErpPolicyService,
    private attachmentsRepository: AttachmentsRepository,
    private customerVehiclesRepository: CustomerVehiclesRepository,
    private vehicleBreakdownsRepository: VehicleBreakdownsRepository,
  ) {
    super(logger)
  }

  async execute({
    vehicleId,
    description,
    currentUserId,
    attachmentsIds,
  }: CreateVehicleBreakdownsUseCaseRequest): Promise<CreateVehicleBreakdownsUseCaseResponse> {
    const context = CreateVehicleBreakdownsUseCase.name

    this.logger.log(
      `🚨 Creating vehicle breakdown for vehicle ${vehicleId}`,
      context,
    )

    const vehicle = await this.customerVehiclesRepository.findById(vehicleId)
    if (!vehicle) {
      return left(
        ResourceNotFoundError.create(
          {
            details: { resourceId: vehicleId, resource: 'vehicle' },
          },
          this.logger,
        ),
      )
    }

    const vehicleBreakdown = VehicleBreakdown.create({
      ownerId: new UniqueEntityID(vehicle.customerId.toString()),
      vehicleId: new UniqueEntityID(vehicleId),
      description,
    })

    const permissionResult = await this.caslPermissionService.verifyAbilities({
      userId: currentUserId,
      appAbilities: [
        'CREATE',
        CaslVehicleBreakdownMapper.toCasl(vehicleBreakdown),
      ],
    })

    if (permissionResult.isLeft()) return left(permissionResult.value)

    for (const attachmentId of attachmentsIds) {
      const attachment = await this.attachmentsRepository.findById(attachmentId)

      if (!attachment) {
        return left(
          ResourceNotFoundError.create(
            {
              details: { resourceId: attachmentId, resource: 'attachment' },
            },
            this.logger,
          ),
        )
      }
    }

    vehicleBreakdown.attachments.update(
      attachmentsIds.map((attachmentId) =>
        BreakdownAttachment.create({
          breakdownId: vehicleBreakdown.id,
          attachmentId: new UniqueEntityID(attachmentId),
        }),
      ),
    )
    await this.vehicleBreakdownsRepository.create(vehicleBreakdown)

    this.logger.log(
      `✅ Vehicle breakdown created with id ${vehicleBreakdown.id.toString()} for vehicle ${vehicleId}`,
      context,
    )

    return right(
      CreatedSuccess.create(
        { meta: { resource: 'vehicle Breakdown' }, data: vehicleBreakdown },
        this.logger,
      ),
    )
  }
}
