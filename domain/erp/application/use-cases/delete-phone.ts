import { Injectable } from '@nestjs/common'

import { Either, left, right } from '@/core/either'
import { LoggerPort } from '@/core/ports/logger.port'

import { DeletedSuccess } from '@/core/success/succes/deleted.success'
import { NotAllowedError } from '@/core/errors/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found.error'

import { CaslPhoneMapper } from '@/domain/erp/application/auth/casl/mappers/casl-phone.mapper'
import { CaslErpPolicyService } from '@/domain/erp/application/auth/casl/services/casl-erp-policy.service'

import { UseCaseBase } from '@/core/entities/base-use-case'
import { PhonesRepository } from '@/domain/erp/application/repositories/phones.repository'

interface DeletePhoneUseCaseRequest {
  phoneId: string
  currentUserId: string
}

type DeletePhoneUseCaseResponse = Either<
  NotAllowedError | ResourceNotFoundError,
  DeletedSuccess
>

@Injectable()
export class DeletePhoneUseCase extends UseCaseBase {
  static success = DeletedSuccess

  static errors = [NotAllowedError, ResourceNotFoundError]

  constructor(
    logger: LoggerPort,
    private phonesRepository: PhonesRepository,
    private caslPermissionService: CaslErpPolicyService,
  ) {
    super(logger)
  }

  async execute({
    phoneId,
    currentUserId,
  }: DeletePhoneUseCaseRequest): Promise<DeletePhoneUseCaseResponse> {
    const context = DeletePhoneUseCase.name

    this.logger.log(`📞 Deleting phone with ID ${phoneId}`, context)

    const phoneToDelete = await this.phonesRepository.findById(phoneId)

    if (!phoneToDelete) {
      return left(
        ResourceNotFoundError.create(
          {
            details: {
              resource: 'Phone',
              resourceId: phoneId,
            },
          },
          this.logger,
        ),
      )
    }

    const permissionResult = await this.caslPermissionService.verifyAbilities({
      userId: currentUserId,
      appAbilities: ['DELETE', CaslPhoneMapper.toCasl(phoneToDelete)],
    })

    if (permissionResult.isLeft()) return left(permissionResult.value)

    await this.phonesRepository.delete(phoneToDelete)

    this.logger.log(`✅ Phone with ID ${phoneId} deleted successfully`, context)

    return right(
      DeletedSuccess.create({ meta: { resource: 'Customer' } }, this.logger),
    )
  }
}
