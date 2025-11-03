import { Injectable } from '@nestjs/common'

import { Either, left, right } from '@/core/either'
import { LoggerPort } from '@/core/ports/logger.port'

import { CreatedSuccess } from '@/core/success/succes/created.success'
import { NotAllowedError } from '@/core/errors/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found.error'
import { InvalidPasswordError } from '@/domain/erp/application/use-cases/errors/errors/invalid-password.error'
import { UserAlreadyExistsError } from '@/domain/erp/application/use-cases/errors/errors/user-already-exists.error'

import { CaslAdminMapper } from '@/domain/erp/application/auth/casl/mappers/casl-admin.mapper'
import { CaslErpPolicyService } from '@/domain/erp/application/auth/casl/services/casl-erp-policy.service'

import { Phone } from '@/domain/erp/enterprise/entities/phone'
import { Admin } from '@/domain/erp/enterprise/entities/admin'
import { Name } from '@/domain/erp/enterprise/entities/value-objects/name'
import { Email } from '@/domain/erp/enterprise/entities/value-objects/email'

import { AdminsRepository } from '@/domain/erp/application/repositories/admins.repository'
import { CustomersRepository } from '@/domain/erp/application/repositories/customers.repository'

import { UseCaseBase } from '@/core/entities/base-use-case'

import { PasswordValidationSchema } from '@/domain/erp/enterprise/entities/value-objects/schemas/password.validation.schema'

import type { CreatePhoneRequestProps } from '@/infra/http/schemas/http/create-phone.validation.schema'

interface RegisterAdminUseCaseRequest {
  currentUserId: string

  firstName: string
  lastName: string
  username: string

  email: string
  password: string
  phones: CreatePhoneRequestProps[]
}

type RegisterAdminUseCaseResponse = Either<
  | NotAllowedError
  | InvalidPasswordError
  | ResourceNotFoundError
  | UserAlreadyExistsError,
  CreatedSuccess
>

@Injectable()
export class RegisterAdminUseCase extends UseCaseBase {
  static success = CreatedSuccess

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
    currentUserId,

    firstName,
    lastName,
    username,

    email,
    phones,
    password,
  }: RegisterAdminUseCaseRequest): Promise<RegisterAdminUseCaseResponse> {
    const context = RegisterAdminUseCase.name

    this.logger.log(`👤 Registering new admin with email ${email}`, context)

    const userWithSameEmail =
      (await this.adminsRepository.findByEmail(email)) ??
      (await this.customersRepository.findByEmail(email))

    if (userWithSameEmail) {
      this.logger.debug?.(`userWithSameEmail=${!!userWithSameEmail}`, context)
      return left(
        UserAlreadyExistsError.create(
          { details: { identifier: currentUserId } },
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

    const admin = Admin.create({
      name: Name.create({
        firstName,
        lastName,
        username,
      }),
      password: data.password,
      email: Email.create({ email }),
    })

    this.logger.debug?.(`Adding ${phones.length} phone(s) to admin`, context)

    for (const phone of phones) {
      const newPhone = Phone.create({
        ...phone,
        userId: admin.id,
        userRole: admin.role,
      })

      admin.phones.add(newPhone)
    }

    const permissionResult = await this.caslPermissionService.verifyAbilities({
      userId: currentUserId,
      appAbilities: ['CREATE', CaslAdminMapper.toCasl(admin)],
    })

    if (permissionResult.isLeft()) return left(permissionResult.value)

    await this.adminsRepository.create(admin)

    this.logger.log(
      `✅ Successfully registered admin with email ${email}`,
      context,
    )

    return right(
      CreatedSuccess.create(
        { meta: { resource: 'admin' }, data: admin },
        this.logger,
      ),
    )
  }
}
