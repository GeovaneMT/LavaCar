import { Injectable } from '@nestjs/common'

import { Either, left, right } from '@/core/either'
import { LoggerPort } from '@/core/ports/logger.port'

import { DeletedSuccess } from '@/core/success/succes/deleted.success'
import { NotAllowedError } from '@/core/errors/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found.error'

import { CaslAdminMapper } from '@/domain/erp/application/auth/casl/mappers/casl-admin.mapper'
import { CaslErpPolicyService } from '@/domain/erp/application/auth/casl/services/casl-erp-policy.service'

import { UseCaseBase } from '@/core/entities/base-use-case'

import { AdminsRepository } from '@/domain/erp/application/repositories/admins.repository'

interface DeleteAdminUseCaseRequest {
  adminId: string
  currentUserId: string
}

type DeleteAdminUseCaseResponse = Either<
  NotAllowedError | ResourceNotFoundError,
  DeletedSuccess
>

@Injectable()
export class DeleteAdminUseCase extends UseCaseBase {
  static success = DeletedSuccess
  static errors = [NotAllowedError, ResourceNotFoundError]

  constructor(
    logger: LoggerPort,
    private adminsRepository: AdminsRepository,
    private caslPermissionService: CaslErpPolicyService,
  ) {
    super(logger)
  }

  async execute({
    adminId,
    currentUserId,
  }: DeleteAdminUseCaseRequest): Promise<DeleteAdminUseCaseResponse> {
    const context = DeleteAdminUseCase.name

    this.logger.log(`🗑️ Deleting admin with ID ${adminId}`, context)

    const adminToDelete = await this.adminsRepository.findById(adminId)
    if (!adminToDelete) {
      return left(
        ResourceNotFoundError.create(
          {
            details: {
              resource: 'admin',
              resourceId: adminId,
            },
          },
          this.logger,
        ),
      )
    }

    const permissionResult = await this.caslPermissionService.verifyAbilities({
      userId: currentUserId,
      appAbilities: ['DELETE', CaslAdminMapper.toCasl(adminToDelete)],
    })

    if (permissionResult.isLeft()) return left(permissionResult.value)

    await this.adminsRepository.delete(adminToDelete)

    this.logger.log(
      `✅ Admin with ID ${currentUserId} deleted successfully`,
      context,
    )

    return right(
      DeletedSuccess.create({ meta: { resource: 'Admin' } }, this.logger),
    )
  }
}
