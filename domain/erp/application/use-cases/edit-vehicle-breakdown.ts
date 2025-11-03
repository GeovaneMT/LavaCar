import { Injectable } from '@nestjs/common'

import { Either, left, right } from '@/core/either'
import { LoggerPort } from '@/core/ports/logger.port'
import { UseCaseBase } from '@/core/entities/base-use-case'

import { UpdatedSuccess } from '@/core/success/succes/updated.success'
import { NotAllowedError } from '@/core/errors/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found.error'

import { CaslVehicleBreakdownMapper } from '@/domain/erp/application/auth/casl/mappers/casl-vehicle-breakdown.mapper'
import { CaslErpPolicyService } from '@/domain/erp/application/auth/casl/services/casl-erp-policy.service'

import { BreakdownAttachment } from '@/domain/erp/enterprise/entities/breakdown-attachment'

import { VehicleBreakdownsRepository } from '@/domain/erp/application/repositories/vehicle-breakdowns.repository'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'

interface EditVehicleBreakdownUseCaseRequest {
  description: string

  breakdownId: string
  currentUserId: string
  attachmentsIds: string[]
}

type EditVehicleBreakdownUseCaseResponse = Either<
  NotAllowedError | ResourceNotFoundError,
  UpdatedSuccess
>

@Injectable()
export class EditVehicleBreakdownUseCase extends UseCaseBase {
  static success = UpdatedSuccess

  static errors = [NotAllowedError, ResourceNotFoundError]

  constructor(
    logger: LoggerPort,
    private caslPermissionService: CaslErpPolicyService,
    private vehicleBreakdownsRepository: VehicleBreakdownsRepository,
  ) {
    super(logger)
  }

  async execute({
    description,

    breakdownId,
    currentUserId,
    attachmentsIds,
  }: EditVehicleBreakdownUseCaseRequest): Promise<EditVehicleBreakdownUseCaseResponse> {
    const context = EditVehicleBreakdownUseCase.name

    this.logger.log(
      `🚨 Editing vehicle breakdown with ID ${breakdownId}`,
      context,
    )

    const breakdownToEdit =
      await this.vehicleBreakdownsRepository.findById(breakdownId)

    if (!breakdownToEdit) {
      return left(
        ResourceNotFoundError.create(
          {
            details: { resource: 'vehicle breakdown', resourceId: breakdownId },
          },
          this.logger,
        ),
      )
    }

    const permissionResult = await this.caslPermissionService.verifyAbilities({
      userId: currentUserId,
      appAbilities: [
        'UPDATE',
        CaslVehicleBreakdownMapper.toCasl(breakdownToEdit),
      ],
    })

    if (permissionResult.isLeft()) return left(permissionResult.value)

    this.logger.debug?.(
      `Processing ${attachmentsIds.length} attachment(s) for vehicle breakdown`,
      context,
    )

    breakdownToEdit.attachments.update(
      attachmentsIds.map((attachmentId) =>
        BreakdownAttachment.create({
          breakdownId: breakdownToEdit.id,
          attachmentId: new UniqueEntityID(attachmentId),
        }),
      ),
    )

    breakdownToEdit.description = description

    await this.vehicleBreakdownsRepository.save(breakdownToEdit)

    this.logger.log(
      `✅ Vehicle breakdown with ID ${breakdownId} edited successfully`,
      context,
    )

    return right(
      UpdatedSuccess.create(
        { meta: { resource: 'vehicle breakdown' }, data: breakdownToEdit },
        this.logger,
      ),
    )
  }
}
