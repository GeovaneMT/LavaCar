import { Injectable } from '@nestjs/common'

import { Either, left, right } from '@/core/either'
import { LoggerPort } from '@/core/ports/logger.port'
import { UseCaseBase } from '@/core/entities/base-use-case'

import { NotAllowedError } from '@/core/errors/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found.error'
import { CaslErpPolicyService } from '@/domain/erp/application/auth/casl/services/casl-erp-policy.service'

import { Customer } from '@/domain/erp/enterprise/entities/customer'
import { CaslCustomerMapper } from '@/domain/erp/application/auth/casl/mappers/casl-customer.mapper'

import { CustomersRepository } from '@/domain/erp/application/repositories/customers.repository'

interface FetchCustomersUseCaseRequest {
  page: number
  limit: number
  currentUserId: string
}

type FetchCustomersUseCaseResponse = Either<
  NotAllowedError | ResourceNotFoundError,
  {
    hasMore: boolean
    customers: Customer[]
  }
>

@Injectable()
export class FetchCustomersUseCase extends UseCaseBase {
  static errors = [NotAllowedError, ResourceNotFoundError]

  constructor(
    logger: LoggerPort,
    private customersRepository: CustomersRepository,
    private caslPermissionService: CaslErpPolicyService,
  ) {
    super(logger)
  }

  async execute({
    page,
    limit,
    currentUserId,
  }: FetchCustomersUseCaseRequest): Promise<FetchCustomersUseCaseResponse> {
    const context = FetchCustomersUseCase.name

    this.logger.log(
      `👤 Fetching customers for page ${page} with limit ${limit}`,
      context,
    )

    const result = await this.customersRepository.findManyRecent({
      page,
      limit,
    })

    if (!result) {
      return left(
        ResourceNotFoundError.create(
          { details: { resource: 'Result' } },
          this.logger,
        ),
      )
    }

    const { customers, hasMore } = result

    if (!customers || !customers.length) {
      return left(
        ResourceNotFoundError.create(
          { details: { resource: 'Customers' } },
          this.logger,
        ),
      )
    }

    for (const customer of customers) {
      const permissionResult = await this.caslPermissionService.verifyAbilities(
        {
          userId: currentUserId,
          appAbilities: ['GET', CaslCustomerMapper.toCasl(customer)],
        },
      )

      if (permissionResult.isLeft()) return left(permissionResult.value)
    }

    this.logger.log(
      `✅ Successfully fetched ${customers.length} customers`,
      context,
    )

    return right({
      customers,
      hasMore,
    })
  }
}
