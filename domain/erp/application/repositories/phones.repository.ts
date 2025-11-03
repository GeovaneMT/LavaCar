import type { PaginationParams } from '@/core/params/pagination-params'

import type { Phone } from '@/domain/erp/enterprise/entities/phone'

export abstract class PhonesRepository {
  abstract create(customer: Phone): Promise<void>
  abstract save(customer: Phone): Promise<void>
  abstract delete(customer: Phone): Promise<void>

  abstract findById(id: string): Promise<Phone | null>

  abstract createMany(phoneToCreate: Phone[]): Promise<void>

  abstract deleteMany(phonesToDelete: Phone[]): Promise<void>

  abstract deleteManyByUserId(userId: string): Promise<void>

  abstract findManyByNumber(
    number: string,
    params: PaginationParams,
  ): Promise<Phone[] | null>

  abstract findManyByUserId(userId: string): Promise<Phone[] | null>
}
