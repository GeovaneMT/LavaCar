import { Entity } from '@/core/entities/entity'
import { Optional } from '@/core/types/optional'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { userRoleLitteral } from '@/core/enums/prisma.enums'

export interface NotificationProps {
  title: string
  content: string
  readAt?: Date | null
  userId?: UniqueEntityID | null
  createdAt: Date
  recipientId: UniqueEntityID
  recipientRole: userRoleLitteral
}

export class Notification extends Entity<NotificationProps> {
  get recipientId() {
    return this.props.recipientId
  }

  get recipientRole() {
    return this.props.recipientRole
  }

  get userId() {
    return this.props.userId
  }

  get title() {
    return this.props.title
  }

  get content() {
    return this.props.content
  }

  get readAt() {
    return this.props.readAt
  }

  get createdAt() {
    return this.props.createdAt
  }

  read() {
    this.props.readAt = new Date()
  }

  static create(
    props: Optional<NotificationProps, 'createdAt'>,
    id?: UniqueEntityID,
  ) {
    return new Notification(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )
  }
}
