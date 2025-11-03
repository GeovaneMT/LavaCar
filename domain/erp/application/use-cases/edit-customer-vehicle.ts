import { Injectable } from '@nestjs/common'
import { vehicleType } from '@prisma/client'

import { Either, left, right } from '@/core/either'
import { LoggerPort } from '@/core/ports/logger.port'
import { UseCaseBase } from '@/core/entities/base-use-case'

import { UpdatedSuccess } from '@/core/success/succes/updated.success'
import { NotAllowedError } from '@/core/errors/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found.error'
import { VehicleAlreadyExistsError } from '@/domain/erp/application/use-cases/errors/errors/vehicle-already-exists.error'

import { CaslErpPolicyService } from '@/domain/erp/application/auth/casl/services/casl-erp-policy.service'
import { CaslCustomerVehicleMapper } from '@/domain/erp/application/auth/casl/mappers/casl-customer-vehicle.mapper'

import { Plate } from '@/domain/erp/enterprise/entities/value-objects/plate'

import { AdminsRepository } from '@/domain/erp/application/repositories/admins.repository'
import { CustomerVehiclesRepository } from '@/domain/erp/application/repositories/customer-vehicles.repository'

interface EditCustomerVehicleUseCaseRequest {
  vehicleId: string
  currentUserId: string

  type: vehicleType
  year: string
  model: string
  plate: string
}

type EditCustomerVehicleUseCaseResponse = Either<
  NotAllowedError | ResourceNotFoundError | VehicleAlreadyExistsError,
  UpdatedSuccess
>

@Injectable()
export class EditCustomerVehicleUseCase extends UseCaseBase {
  static success = UpdatedSuccess

  static errors = [
    NotAllowedError,
    ResourceNotFoundError,
    VehicleAlreadyExistsError,
  ]

  constructor(
    logger: LoggerPort,
    private adminsRepository: AdminsRepository,
    private caslPermissionService: CaslErpPolicyService,
    private customerVehiclesRepository: CustomerVehiclesRepository,
  ) {
    super(logger)
  }

  async execute({
    vehicleId,
    currentUserId,

    type,
    model,
    year,
    plate,
  }: EditCustomerVehicleUseCaseRequest): Promise<EditCustomerVehicleUseCaseResponse> {
    const context = EditCustomerVehicleUseCase.name

    this.logger.log(`🚗 Editing customer vehicle with ID ${vehicleId}`, context)

    const vehicleToEdit =
      await this.customerVehiclesRepository.findById(vehicleId)

    if (!vehicleToEdit) {
      return left(
        ResourceNotFoundError.create(
          { details: { resource: 'vehicle', resourceId: vehicleId } },
          this.logger,
        ),
      )
    }

    const permissionResult = await this.caslPermissionService.verifyAbilities({
      userId: currentUserId,
      appAbilities: ['UPDATE', CaslCustomerVehicleMapper.toCasl(vehicleToEdit)],
    })

    if (permissionResult.isLeft()) return left(permissionResult.value)

    const vehicleWithSamePlate =
      await this.customerVehiclesRepository.findByPlate(plate)

    if (
      vehicleWithSamePlate &&
      vehicleWithSamePlate.id.toString() !== vehicleId
    ) {
      return left(
        VehicleAlreadyExistsError.create(
          { details: { plate: vehicleWithSamePlate.plate.plate } },
          this.logger,
        ),
      )
    }

    vehicleToEdit.type = type
    vehicleToEdit.model = model
    vehicleToEdit.year = year
    vehicleToEdit.plate = Plate.create({ plate })

    await this.customerVehiclesRepository.save(vehicleToEdit)

    this.logger.log(
      `✅ Customer vehicle with ID ${vehicleId} edited successfully`,
      context,
    )

    return right(
      UpdatedSuccess.create(
        { meta: { resource: 'vehicle' }, data: vehicleToEdit },
        this.logger,
      ),
    )
  }
}
