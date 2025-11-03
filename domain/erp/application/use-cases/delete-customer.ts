import { Injectable } from '@nestjs/common'

import { Either, left, right } from '@/core/either'
import { LoggerPort } from '@/core/ports/logger.port'

import { DeletedSuccess } from '@/core/success/succes/deleted.success'
import { NotAllowedError } from '@/core/errors/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found.error'

import { CaslCustomerMapper } from '@/domain/erp/application/auth/casl/mappers/casl-customer.mapper'
import { CaslErpPolicyService } from '@/domain/erp/application/auth/casl/services/casl-erp-policy.service'

import { UseCaseBase } from '@/core/entities/base-use-case'
import { CustomersRepository } from '@/domain/erp/application/repositories/customers.repository'

interface DeleteCustomerUseCaseRequest {
  customerId: string
  currentUserId: string
}

type DeleteCustomerUseCaseResponse = Either<
  NotAllowedError | ResourceNotFoundError,
  DeletedSuccess
>

@Injectable()
export class DeleteCustomerUseCase extends UseCaseBase {
  static success = DeletedSuccess
  static errors = [NotAllowedError, ResourceNotFoundError]

  constructor(
    logger: LoggerPort,
    private customersRepository: CustomersRepository,
    private caslPermissionService: CaslErpPolicyService,
  ) {
    super(logger)
  }

  async execute({
    customerId,
    currentUserId,
  }: DeleteCustomerUseCaseRequest): Promise<DeleteCustomerUseCaseResponse> {
    const context = DeleteCustomerUseCase.name

    this.logger.log(`👤 Deleting customer with ID ${customerId}`, context)

    const customerToDelete = await this.customersRepository.findById(customerId)

    if (!customerToDelete) {
      return left(
        ResourceNotFoundError.create(
          {
            details: {
              resource: 'Customer',
              resourceId: customerId,
            },
          },
          this.logger,
        ),
      )
    }

    const permissionResult = await this.caslPermissionService.verifyAbilities({
      userId: currentUserId,
      appAbilities: ['DELETE', CaslCustomerMapper.toCasl(customerToDelete)],
    })

    if (permissionResult.isLeft()) return left(permissionResult.value)

    await this.customersRepository.delete(customerToDelete)

    this.logger.log(
      `✅ Customer with ID ${customerId} deleted successfully`,
      context,
    )

    return right(
      DeletedSuccess.create({ meta: { resource: 'Customer' } }, this.logger),
    )
  }
}
