import { ValueObject } from '@/core/entities/value-object'
import { PlateValidationSchema } from '@/domain/erp/enterprise/entities/value-objects/schemas/plate.validation.schema'

export interface PlateProps {
  plate: string
}

export class Plate extends ValueObject<PlateProps> {
  get plate() {
    return this.props.plate
  }

  static create(props: PlateProps) {
    const { data: PlateData, error } = PlateValidationSchema.safeParse(props)
    if (error) throw new Error(error.message)

    return new Plate(PlateData)
  }
}
