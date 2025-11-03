import { WatchedList } from '@/core/entities/watched-list'
import { BreakdownAttachment } from '@/domain/erp/enterprise/entities/breakdown-attachment'

export class BreakdownAttachmentList extends WatchedList<BreakdownAttachment> {
  compareItems(a: BreakdownAttachment, b: BreakdownAttachment): boolean {
    return a.attachmentId.equals(b.attachmentId)
  }
}
