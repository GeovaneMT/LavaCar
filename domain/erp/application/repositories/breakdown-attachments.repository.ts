import { BreakdownAttachment } from '@/domain/erp/enterprise/entities/breakdown-attachment'

export abstract class BreakdownAttachmentsRepository {
  abstract createMany(attachments: BreakdownAttachment[]): Promise<void>

  abstract deleteMany(attachments: BreakdownAttachment[]): Promise<void>
  abstract deleteManyByBreakdownId(breakdownId: string): Promise<void>

  abstract findManyByBreakdownId(
    breakdownId: string,
  ): Promise<BreakdownAttachment[]>
}
