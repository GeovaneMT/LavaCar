import { PhoneType } from '@prisma/client'
import { Injectable } from '@nestjs/common'

import { Either, left, right } from '@/core/either'
import { LoggerPort } from '@/core/ports/logger.port'
import { UseCaseBase } from '@/core/entities/base-use-case'

import { UpdatedSuccess } from '@/core/success/succes/updated.success'
import { NotAllowedError } from '@/core/errors/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found.error'

import { CaslPhoneMapper } from '@/domain/erp/application/auth/casl/mappers/casl-phone.mapper'
import { CaslErpPolicyService } from '@/domain/erp/application/auth/casl/services/casl-erp-policy.service'

import { PhonesRepository } from '@/domain/erp/application/repositories/phones.repository'

interface EditPhoneUseCaseRequest {
  type: PhoneType
  number: string
  isWhatsapp: boolean

  phoneId: string
  currentUserId: string
}

type EditPhoneUseCaseResponse = Either<
  NotAllowedError | ResourceNotFoundError,
  UpdatedSuccess
>

@Injectable()
export class EditPhoneUseCase extends UseCaseBase {
  static success = UpdatedSuccess

  static errors = [NotAllowedError, ResourceNotFoundError]

  constructor(
    logger: LoggerPort,
    private phonesRepository: PhonesRepository,
    private caslPermissionService: CaslErpPolicyService,
  ) {
    super(logger)
  }

  async execute({
    type,
    number,
    isWhatsapp,

    phoneId,
    currentUserId,
  }: EditPhoneUseCaseRequest): Promise<EditPhoneUseCaseResponse> {
    const context = EditPhoneUseCase.name

    this.logger.log(`📞 Editing phone with ID ${phoneId}`, context)

    const phoneToEdit = await this.phonesRepository.findById(phoneId)

    if (!phoneToEdit) {
      return left(
        ResourceNotFoundError.create(
          { details: { resource: 'Phone', resourceId: phoneId } },
          this.logger,
        ),
      )
    }

    const permissionResult = await this.caslPermissionService.verifyAbilities({
      userId: currentUserId,
      appAbilities: ['UPDATE', CaslPhoneMapper.toCasl(phoneToEdit)],
    })

    if (permissionResult.isLeft()) return left(permissionResult.value)

    phoneToEdit.type = type
    phoneToEdit.number = number
    phoneToEdit.isWhatsapp = isWhatsapp

    await this.phonesRepository.save(phoneToEdit)

    this.logger.log(`✅ Phone with ID ${phoneId} edited successfully`, context)

    return right(
      UpdatedSuccess.create(
        { meta: { resource: 'Phone' }, data: phoneToEdit },
        this.logger,
      ),
    )
  }
}
