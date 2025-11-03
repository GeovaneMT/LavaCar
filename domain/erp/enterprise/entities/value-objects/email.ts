import { ValueObject } from '@/core/entities/value-object'
import { EmailValidationSchema } from '@/domain/erp/enterprise/entities/value-objects/schemas/email.validation.schema'

export interface EmailProps {
  email: string
}

export class Email extends ValueObject<EmailProps> {
  get email() {
    return this.props.email
  }

  static create(props: EmailProps) {
    const { data: emailData, error } = EmailValidationSchema.safeParse(props)
    if (error) throw new Error(error.message)

    return new Email(emailData)
  }
}
