import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

export interface BreakdownAttachmentProps {
  breakdownId: UniqueEntityID
  attachmentId: UniqueEntityID
}

export class BreakdownAttachment extends Entity<BreakdownAttachmentProps> {
  get breakdownId() {
    return this.props.breakdownId
  }

  get attachmentId() {
    return this.props.attachmentId
  }

  static create(props: BreakdownAttachmentProps, id?: UniqueEntityID) {
    return new BreakdownAttachment(props, id)
  }
}
