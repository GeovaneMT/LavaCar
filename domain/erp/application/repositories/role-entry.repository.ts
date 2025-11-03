import type { userRoleLitteral } from '@/core/enums/prisma.enums'
import type { PaginationParams } from '@/core/params/pagination-params'
import type { RoleEntry } from '@/domain/erp/enterprise/entities/value-objects/role-entry'

export abstract class RoleEntriesRepository {
  abstract create(customer: RoleEntry): Promise<void>
  abstract save(customer: RoleEntry): Promise<void>
  abstract delete(customer: RoleEntry): Promise<void>

  abstract findById(id: string): Promise<RoleEntry | null>

  abstract findManyByUserRole(
    role: userRoleLitteral,
    { page, limit }: PaginationParams,
  ): Promise<{ entries: RoleEntry[]; hasMore: boolean }>

  abstract findManyByUserRoleAndName(
    name: string,
    role: userRoleLitteral,
    { page, limit }: PaginationParams,
  ): Promise<{ entries: RoleEntry[]; hasMore: boolean }>

  abstract findManyByUserRoleAndPhone(
    phone: string,
    role: userRoleLitteral,
    { page, limit }: PaginationParams,
  ): Promise<{ entries: RoleEntry[]; hasMore: boolean }>
}
