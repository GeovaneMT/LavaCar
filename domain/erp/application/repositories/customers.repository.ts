import type { PaginationParams } from '@/core/params/pagination-params'

import type { Customer } from '@/domain/erp/enterprise/entities/customer'
import type { CustomerDetails } from '@/domain/erp/enterprise/entities/value-objects/customer-details'

interface manyProps {
  hasMore: boolean
  customers: Customer[]
}

export abstract class CustomersRepository {
  abstract create(customer: Customer): Promise<void>
  abstract save(customer: Customer): Promise<void>
  abstract delete(customer: Customer): Promise<void>

  abstract findById(id: string): Promise<Customer | null>
  abstract findByEmail(email: string): Promise<Customer | null>

  abstract findDetailsById(id: string): Promise<CustomerDetails | null>
  abstract findDetailsByEmail(email: string): Promise<CustomerDetails | null>

  abstract findManyRecent(params: PaginationParams): Promise<manyProps | null>

  abstract findManyByName(
    name: string,
    params: PaginationParams,
  ): Promise<manyProps | null>

  abstract findManyByPhoneNumber(
    phone: string,
    params: PaginationParams,
  ): Promise<manyProps | null>

  abstract findManyByNameOrPhone(
    query: string,
    params: PaginationParams,
  ): Promise<manyProps | null>
}
