import type { PaginationParams } from '@/core/params/pagination-params'

import type { Admin } from '@/domain/erp/enterprise/entities/admin'
import type { AdminDetails } from '@/domain/erp/enterprise/entities/value-objects/admin-details'

interface manyProps {
  admins: Admin[]
  hasMore: boolean
}

export abstract class AdminsRepository {
  abstract create(admin: Admin): Promise<void>
  abstract save(admin: Admin): Promise<void>
  abstract delete(admin: Admin): Promise<void>

  abstract findById(id: string): Promise<Admin | null>
  abstract findByEmail(email: string): Promise<Admin | null>

  abstract findDetailsById(id: string): Promise<AdminDetails | null>
  abstract findDetailsByEmail(email: string): Promise<AdminDetails | null>

  abstract findManyRecent(params: PaginationParams): Promise<manyProps | null>

  abstract findManyByName(
    name: string,
    params: PaginationParams,
  ): Promise<manyProps | null>

  abstract findManyByPhoneNumber(
    phoneNumber: string,
    params: PaginationParams,
  ): Promise<manyProps | null>

  abstract findManyByNameOrPhone(
    query: string,
    params: PaginationParams,
  ): Promise<manyProps | null>
}
