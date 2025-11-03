import { Attachment } from '@/domain/erp/enterprise/entities/attachment'

export abstract class AttachmentsRepository {
  abstract create(attachment: Attachment): Promise<void>
  abstract delete(attachment: Attachment): Promise<void>

  abstract createMany(attachment: Attachment[]): Promise<void>
  abstract deleteMany(attachment: Attachment[]): Promise<void>

  abstract findById(id: string): Promise<Attachment | null>
}
