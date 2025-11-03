import { Injectable } from '@nestjs/common'

import { Either, left, right } from '@/core/either'
import { LoggerPort } from '@/core/ports/logger.port'
import { UseCaseBase } from '@/core/entities/base-use-case'

import { UserAlreadyExistsError } from '@/domain/erp/application/use-cases/errors/errors/user-already-exists.error'

import { AdminsRepository } from '@/domain/erp/application/repositories/admins.repository'
import { CustomersRepository } from '@/domain/erp/application/repositories/customers.repository'

interface ValidateEmailUseCaseRequest {
  email: string
}

type ValidateEmailUseCaseResponse = Either<
  UserAlreadyExistsError,
  { isValid: true }
>

@Injectable()
export class ValidateEmailUseCase extends UseCaseBase {
  static errors = [UserAlreadyExistsError]

  constructor(
    logger: LoggerPort,
    private adminsRepository: AdminsRepository,
    private customersRepository: CustomersRepository,
  ) {
    super(logger)
  }

  async execute({
    email,
  }: ValidateEmailUseCaseRequest): Promise<ValidateEmailUseCaseResponse> {
    const context = ValidateEmailUseCase.name

    this.logger.log(`👤 Fetching email ${email} owner`, context)

    const user =
      (await this.adminsRepository.findByEmail(email)) ??
      (await this.customersRepository.findByEmail(email))

    if (user) {
      return left(
        UserAlreadyExistsError.create(
          { details: { identifier: email } },
          this.logger,
        ),
      )
    }

    return right({ isValid: true })
  }
}
