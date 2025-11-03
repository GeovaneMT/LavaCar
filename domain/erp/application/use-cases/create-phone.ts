import { PhoneType } from '@prisma/client'
import { Injectable } from '@nestjs/common'

import { Either, left, right } from '@/core/either'
import { LoggerPort } from '@/core/ports/logger.port'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { Phone } from '@/domain/erp/enterprise/entities/phone'

import { UseCaseBase } from '@/core/entities/base-use-case'

import { CaslPhoneMapper } from '@/domain/erp/application/auth/casl/mappers/casl-phone.mapper'

import { CreatedSuccess } from '@/core/success/succes/created.success'
import { NotAllowedError } from '@/core/errors/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found.error'

import { PhonesRepository } from '@/domain/erp/application/repositories/phones.repository'
import { AdminsRepository } from '@/domain/erp/application/repositories/admins.repository'
import { CustomersRepository } from '@/domain/erp/application/repositories/customers.repository'
import { CaslErpPolicyService } from '@/domain/erp/application/auth/casl/services/casl-erp-policy.service'

interface CreatePhonesUseCaseRequest {
  userId: string
  currentUserId: string

  type: PhoneType
  number: string
  isWhatsapp: boolean
}

type CreatePhonesUseCaseResponse = Either<
  NotAllowedError | ResourceNotFoundError,
  CreatedSuccess
>

@Injectable()
export class CreatePhonesUseCase extends UseCaseBase {
  static success = CreatedSuccess

  static errors = [NotAllowedError, ResourceNotFoundError]

  constructor(
    logger: LoggerPort,
    private phonesRepository: PhonesRepository,
    private adminsRepository: AdminsRepository,
    private customersRepository: CustomersRepository,
    private caslPermissionService: CaslErpPolicyService,
  ) {
    super(logger)
  }

  async execute({
    userId,
    currentUserId,

    type,
    number,
    isWhatsapp,
  }: CreatePhonesUseCaseRequest): Promise<CreatePhonesUseCaseResponse> {
    const context = CreatePhonesUseCase.name

    this.logger.log(`📞 Creating phone for user ${userId}`, context)

    const targetUser =
      (await this.adminsRepository.findById(userId)) ??
      (await this.customersRepository.findById(userId))

    if (!targetUser) {
      return left(
        ResourceNotFoundError.create(
          { details: { resource: 'User', resourceId: userId } },
          this.logger,
        ),
      )
    }

    this.logger.debug?.(`targetUser=${targetUser}`, context)

    const phone = Phone.create({
      userId: new UniqueEntityID(userId),
      type,
      number,
      userRole: targetUser.role,
      isWhatsapp,
    })

    const permissionResult = await this.caslPermissionService.verifyAbilities({
      userId: currentUserId,
      appAbilities: ['CREATE', CaslPhoneMapper.toCasl(phone)],
    })

    if (permissionResult.isLeft()) return left(permissionResult.value)

    await this.phonesRepository.create(phone)

    this.logger.log(
      `✅ Phone created with id ${phone.id.toString()} for user ${userId}`,
      context,
    )

    return right(
      CreatedSuccess.create(
        { meta: { resource: 'Phone' }, data: phone },
        this.logger,
      ),
    )
  }
}
