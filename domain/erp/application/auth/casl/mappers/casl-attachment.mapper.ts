import type { Attachment } from '@/domain/erp/enterprise/entities/attachment'
import type { AttachmentModelType as caslAttachment } from '@/domain/erp/application/auth/casl/models/attachment.model'

export class CaslAttachmentMapper {
  /**
   * The magic function that converts attachment domain entities to casl models
   */
  static toCasl(attachment: Attachment): caslAttachment {
    return {
      ...attachment,
      id: attachment.id.toString(),
      __typename: 'ATTACHMENT',
    }
  }
}
