import { Injectable } from '@nestjs/common'

import { Either, left, right } from '@/core/either'
import { LoggerPort } from '@/core/ports/logger.port'

import { UpdatedSuccess } from '@/core/success/succes/updated.success'
import { NotAllowedError } from '@/core/errors/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found.error'
import { InvalidPasswordError } from '@/domain/erp/application/use-cases/errors/errors/invalid-password.error'
import { UserAlreadyExistsError } from '@/domain/erp/application/use-cases/errors/errors/user-already-exists.error'

import { CaslAdminMapper } from '@/domain/erp/application/auth/casl/mappers/casl-admin.mapper'
import { CaslErpPolicyService } from '@/domain/erp/application/auth/casl/services/casl-erp-policy.service'

import { AdminsRepository } from '@/domain/erp/application/repositories/admins.repository'
import { CustomersRepository } from '@/domain/erp/application/repositories/customers.repository'

import { UseCaseBase } from '@/core/entities/base-use-case'
import { Name } from '@/domain/erp/enterprise/entities/value-objects/name'
import { Email } from '@/domain/erp/enterprise/entities/value-objects/email'

import { PasswordValidationSchema } from '@/domain/erp/enterprise/entities/value-objects/schemas/password.validation.schema'

interface EditAdminUseCaseRequest {
  adminId: string
  currentUserId: string

  email: string
  password: string
  username: string
  firstName: string
  lastName: string
}

type EditAdminUseCaseResponse = Either<
  | NotAllowedError
  | InvalidPasswordError
  | ResourceNotFoundError
  | UserAlreadyExistsError,
  UpdatedSuccess
>

@Injectable()
export class EditAdminUseCase extends UseCaseBase {
  static success = UpdatedSuccess

  static errors = [
    NotAllowedError,
    InvalidPasswordError,
    ResourceNotFoundError,
    UserAlreadyExistsError,
  ]

  constructor(
    logger: LoggerPort,
    private adminsRepository: AdminsRepository,
    private customersRepository: CustomersRepository,
    private caslPermissionService: CaslErpPolicyService,
  ) {
    super(logger)
  }

  async execute({
    adminId,
    currentUserId,

    email,
    password,
    username,
    firstName,
    lastName,
  }: EditAdminUseCaseRequest): Promise<EditAdminUseCaseResponse> {
    const context = EditAdminUseCase.name

    this.logger.log(`🖌️ Editing admin with ID ${currentUserId}`, context)

    const adminToEdit = await this.adminsRepository.findById(adminId)
    if (!adminToEdit) {
      return left(
        ResourceNotFoundError.create(
          { details: { resource: 'Admin', resourceId: adminId } },
          this.logger,
        ),
      )
    }

    const permissionResult = await this.caslPermissionService.verifyAbilities({
      userId: currentUserId,
      appAbilities: ['UPDATE', CaslAdminMapper.toCasl(adminToEdit)],
    })

    if (permissionResult.isLeft()) return left(permissionResult.value)

    const userWithSameEmail =
      (await this.adminsRepository.findByEmail(email)) ??
      (await this.customersRepository.findByEmail(email))

    if (userWithSameEmail && userWithSameEmail.id.toString() !== adminId) {
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

    adminToEdit.name = Name.create({
      firstName,
      lastName,
      username,
    })

    adminToEdit.password = data.password
    adminToEdit.email = Email.create({ email })

    await this.adminsRepository.save(adminToEdit)

    this.logger.log(
      `✅ Admin with ID ${currentUserId} edited successfully`,
      context,
    )

    return right(
      UpdatedSuccess.create(
        { meta: { resource: 'Admin' }, data: adminToEdit },
        this.logger,
      ),
    )
  }
}
