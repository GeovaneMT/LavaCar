import { Injectable } from '@nestjs/common'

import { Either, left, right } from '@/core/either'
import { LoggerPort } from '@/core/ports/logger.port'
import { UseCaseBase } from '@/core/entities/base-use-case'

import { NotAllowedError } from '@/core/errors/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found.error'

import { CaslErpPolicyService } from '@/domain/erp/application/auth/casl/services/casl-erp-policy.service'
import { CaslCustomerDetailsMapper } from '@/domain/erp/application/auth/casl/mappers/casl-customer-details.mapper'

import { CustomerDetails } from '@/domain/erp/enterprise/entities/value-objects/customer-details'

import { CustomersRepository } from '@/domain/erp/application/repositories/customers.repository'

interface GetCustomerByIdUseCaseRequest {
  customerId: string
  currentUserId: string
}

type GetCustomerByIdUseCaseResponse = Either<
  NotAllowedError | ResourceNotFoundError,
  {
    customerDetails: CustomerDetails
  }
>

@Injectable()
export class GetCustomerByIdUseCase extends UseCaseBase {
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
  }: GetCustomerByIdUseCaseRequest): Promise<GetCustomerByIdUseCaseResponse> {
    const context = GetCustomerByIdUseCase.name

    this.logger.log(`👤 Fetching customer details by ID ${customerId}`, context)

    const customerDetails =
      await this.customersRepository.findDetailsById(customerId)

    if (!customerDetails) {
      return left(
        ResourceNotFoundError.create(
          { details: { resource: 'Customer', resourceId: customerId } },
          this.logger,
        ),
      )
    }

    const permissionResult = await this.caslPermissionService.verifyAbilities({
      userId: currentUserId,
      appAbilities: ['GET', CaslCustomerDetailsMapper.toCasl(customerDetails)],
    })

    if (permissionResult.isLeft()) return left(permissionResult.value)

    this.logger.log(
      `✅ Successfully fetched customer details for ID ${customerId}`,
      context,
    )

    return right({
      customerDetails,
    })
  }
}
