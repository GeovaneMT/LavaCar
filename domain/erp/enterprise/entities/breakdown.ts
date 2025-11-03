import { AggregateRoot } from '@/core/entities/aggregate-root'
import { BreakdownAttachmentList } from '@/domain/erp/enterprise/entities/breakdown-attachment-list'

export interface BreakdownProps {
  attachments: BreakdownAttachmentList

  description: string

  createdAt: Date
  updatedAt?: Date | null
}

export abstract class Breakdown<
  Props extends BreakdownProps,
> extends AggregateRoot<Props> {
  get attachments() {
    return this.props.attachments
  }

  get description() {
    return this.props.description
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  set attachments(attachments: BreakdownAttachmentList) {
    this.props.attachments = attachments
    this.touch()
  }

  set description(description: string) {
    this.props.description = description
    this.touch()
  }

  touch() {
    this.props.updatedAt = new Date()
  }
}
