import { Injectable } from '@nestjs/common'

import { Either, left, right } from '@/core/either'
import { LoggerPort } from '@/core/ports/logger.port'

import { UseCaseBase } from '@/core/entities/base-use-case'

import { Uploader } from '@/domain/erp/application/storage/uploader'
import { Attachment } from '@/domain/erp/enterprise/entities/attachment'
import { AttachmentsRepository } from '@/domain/erp/application/repositories/attachments.repository'
import { InvalidAttachmentTypeError } from '@/domain/erp/application/use-cases/errors/errors/invalid-attachment-type.error'

import { CreatedSuccess } from '@/core/success/succes/created.success'

import { CaslErpPolicyService } from '@/domain/erp/application/auth/casl/services/casl-erp-policy.service'
import { CaslAttachmentMapper } from '@/domain/erp/application/auth/casl/mappers/casl-attachment.mapper'

import { NotAllowedError } from '@/core/errors/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found.error'

interface UploadAndCreateAttachmentRequest {
  buffer: Buffer
  fileName: string
  fileType: string
  currentUserId: string
}

type UploadAndCreateAttachmentResponse = Either<
  NotAllowedError | ResourceNotFoundError | InvalidAttachmentTypeError,
  CreatedSuccess
>

@Injectable()
export class UploadAndCreateAttachmentUseCase extends UseCaseBase {
  static success = CreatedSuccess
  static errors = [
    NotAllowedError,
    ResourceNotFoundError,
    InvalidAttachmentTypeError,
  ]

  constructor(
    logger: LoggerPort,
    private uploader: Uploader,
    private caslPermissionService: CaslErpPolicyService,
    private attachmentsRepository: AttachmentsRepository,
  ) {
    super(logger)
  }

  async execute({
    buffer,
    fileName,
    fileType,
    currentUserId,
  }: UploadAndCreateAttachmentRequest): Promise<UploadAndCreateAttachmentResponse> {
    const context = UploadAndCreateAttachmentUseCase.name

    this.logger.log(
      `📎 Uploading attachment with file name ${fileName} and type ${fileType}`,
      context,
    )

    const allowedFileTypes = /^(image\/(jpeg|png))$|^application\/pdf$/
    this.logger.debug?.(
      `Checking file type ${fileType} against allowed types`,
      context,
    )

    if (!allowedFileTypes.test(fileType)) {
      return left(
        InvalidAttachmentTypeError.create(
          {
            details: {
              type: fileType,
            },
          },
          this.logger,
        ),
      )
    }

    this.logger.debug?.(`Uploading file ${fileName} to storage`, context)

    const { url } = await this.uploader.upload({ fileName, fileType, buffer })

    this.logger.debug?.(`Creating attachment record for ${fileName}`, context)

    const attachment = Attachment.create({
      url,
      title: fileName,
    })

    const permissionResult = await this.caslPermissionService.verifyAbilities({
      userId: currentUserId,
      appAbilities: ['UPLOAD', CaslAttachmentMapper.toCasl(attachment)],
    })

    if (permissionResult.isLeft()) return left(permissionResult.value)

    await this.attachmentsRepository.create(attachment)

    this.logger.log(
      `✅ Successfully uploaded and created attachment for ${fileName}`,
      context,
    )

    return right(
      CreatedSuccess.create(
        { meta: { resource: 'Attachment' }, data: attachment },
        this.logger,
      ),
    )
  }
}
