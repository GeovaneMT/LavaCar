import { Injectable } from '@nestjs/common'
import { vehicleType } from '@prisma/client'

import { Either, left, right } from '@/core/either'
import { LoggerPort } from '@/core/ports/logger.port'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { UseCaseBase } from '@/core/entities/base-use-case'

import { Plate } from '@/domain/erp/enterprise/entities/value-objects/plate'

import { CustomerVehicle } from '@/domain/erp/enterprise/entities/customer-vehicle'

import { CaslErpPolicyService } from '@/domain/erp/application/auth/casl/services/casl-erp-policy.service'
import { CaslCustomerVehicleMapper } from '@/domain/erp/application/auth/casl/mappers/casl-customer-vehicle.mapper'

import { CreatedSuccess } from '@/core/success/succes/created.success'
import { NotAllowedError } from '@/core/errors/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found.error'
import { VehicleAlreadyExistsError } from '@/domain/erp/application/use-cases/errors/errors/vehicle-already-exists.error'

import { CustomersRepository } from '@/domain/erp/application/repositories/customers.repository'
import { CustomerVehiclesRepository } from '@/domain/erp/application/repositories/customer-vehicles.repository'

interface CreateCustomerVehiclesUseCaseRequest {
  customerId: string
  currentUserId: string

  year: string
  model: string
  plate: string
  type: vehicleType
}

type CreateCustomerVehiclesUseCaseResponse = Either<
  NotAllowedError | ResourceNotFoundError | VehicleAlreadyExistsError,
  CreatedSuccess
>

@Injectable()
export class CreateCustomerVehiclesUseCase extends UseCaseBase {
  static success = CreatedSuccess

  static errors = [
    NotAllowedError,
    ResourceNotFoundError,
    VehicleAlreadyExistsError,
  ]

  constructor(
    logger: LoggerPort,
    private customersRepository: CustomersRepository,
    private caslPermissionService: CaslErpPolicyService,
    private customerVehiclesRepository: CustomerVehiclesRepository,
  ) {
    super(logger)
  }

  async execute({
    type,
    year,
    model,
    plate,
    customerId,
    currentUserId,
  }: CreateCustomerVehiclesUseCaseRequest): Promise<CreateCustomerVehiclesUseCaseResponse> {
    const context = CreateCustomerVehiclesUseCase.name

    this.logger.log(
      `🚗 Creating customer vehicle for customer ${customerId}`,
      context,
    )

    const vehicleWithSamePlate =
      await this.customerVehiclesRepository.findByPlate(plate)

    if (vehicleWithSamePlate) {
      return left(
        VehicleAlreadyExistsError.create(
          { details: { plate: vehicleWithSamePlate.plate.plate } },
          this.logger,
        ),
      )
    }

    const targetCustomer = await this.customersRepository.findById(customerId)

    if (!targetCustomer) {
      return left(
        ResourceNotFoundError.create(
          { details: { resource: 'Customer', resourceId: customerId } },
          this.logger,
        ),
      )
    }

    this.logger.debug?.(`targetCustomer=${targetCustomer}`, context)

    const customerVehicle = CustomerVehicle.create({
      type,
      year,
      model,
      plate: Plate.create({ plate }),
      customerId: new UniqueEntityID(customerId),
    })

    const permissionResult = await this.caslPermissionService.verifyAbilities({
      userId: currentUserId,
      appAbilities: [
        'CREATE',
        CaslCustomerVehicleMapper.toCasl(customerVehicle),
      ],
    })

    if (permissionResult.isLeft()) return left(permissionResult.value)

    await this.customerVehiclesRepository.create(customerVehicle)

    this.logger.log(
      `✅ Customer vehicle created with id ${customerVehicle.id.toString()}`,
      context,
    )

    return right(
      CreatedSuccess.create(
        { meta: { resource: 'Customer Vehicle' }, data: customerVehicle },
        this.logger,
      ),
    )
  }
}
