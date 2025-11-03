import { Injectable } from '@nestjs/common'

import { Either, left, right } from '@/core/either'
import { LoggerPort } from '@/core/ports/logger.port'

import { UpdatedSuccess } from '@/core/success/succes/updated.success'
import { NotAllowedError } from '@/core/errors/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found.error'
import { InvalidPasswordError } from '@/domain/erp/application/use-cases/errors/errors/invalid-password.error'
import { UserAlreadyExistsError } from '@/domain/erp/application/use-cases/errors/errors/user-already-exists.error'

import { CaslCustomerMapper } from '@/domain/erp/application/auth/casl/mappers/casl-customer.mapper'
import { CaslErpPolicyService } from '@/domain/erp/application/auth/casl/services/casl-erp-policy.service'

import { CustomersRepository } from '@/domain/erp/application/repositories/customers.repository'

import { UseCaseBase } from '@/core/entities/base-use-case'
import { Name } from '@/domain/erp/enterprise/entities/value-objects/name'
import { Email } from '@/domain/erp/enterprise/entities/value-objects/email'

import { PasswordValidationSchema } from '@/domain/erp/enterprise/entities/value-objects/schemas/password.validation.schema'

interface EditCustomerUseCaseRequest {
  customerId: string
  currentUserId: string

  email: string
  password: string
  username: string
  firstName: string
  lastName: string
}

type EditCustomerUseCaseResponse = Either<
  | NotAllowedError
  | InvalidPasswordError
  | ResourceNotFoundError
  | UserAlreadyExistsError,
  UpdatedSuccess
>

@Injectable()
export class EditCustomerUseCase extends UseCaseBase {
  static success = UpdatedSuccess

  static errors = [
    NotAllowedError,
    InvalidPasswordError,
    ResourceNotFoundError,
    UserAlreadyExistsError,
  ]

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

    email,
    password,
    username,
    firstName,
    lastName,
  }: EditCustomerUseCaseRequest): Promise<EditCustomerUseCaseResponse> {
    const context = EditCustomerUseCase.name

    this.logger.log(`🖌️ Editing customer with ID ${currentUserId}`, context)

    const customerToEdit = await this.customersRepository.findById(customerId)

    if (!customerToEdit) {
      return left(
        ResourceNotFoundError.create(
          { details: { resource: 'Customer', resourceId: customerId } },
          this.logger,
        ),
      )
    }

    const permissionResult = await this.caslPermissionService.verifyAbilities({
      userId: currentUserId,
      appAbilities: ['UPDATE', CaslCustomerMapper.toCasl(customerToEdit)],
    })

    if (permissionResult.isLeft()) return left(permissionResult.value)

    const userWithSameEmail = await this.customersRepository.findByEmail(email)

    if (userWithSameEmail && userWithSameEmail.id.toString() !== customerId) {
      return left(
        UserAlreadyExistsError.create(
          { details: { identifier: userWithSameEmail.id.toString() } },
          this.logger,
        ),
      )
    }

    const { error, data } = PasswordValidationSchema.safeParse({ password })
    if (error) {
      return left(
        InvalidPasswordError.create(
          { details: { error: error.message, password } },
          this.logger,
        ),
      )
    }

    customerToEdit.name = Name.create({
      firstName,
      lastName,
      username,
    })

    customerToEdit.password = data.password
    customerToEdit.email = Email.create({ email })

    await this.customersRepository.save(customerToEdit)

    this.logger.log(
      `✅ Customer with ID ${currentUserId} edited successfully`,
      context,
    )

    return right(
      UpdatedSuccess.create(
        { meta: { resource: 'Customer' }, data: customerToEdit },
        this.logger,
      ),
    )
  }
}
