import { describe, it, beforeEach, expect } from 'vitest'

import { ValidateEmailUseCase } from '@/domain/erp/application/use-cases/validate-email'
import { UserAlreadyExistsError } from '@/domain/erp/application/use-cases/errors/errors/user-already-exists.error'

import { makeAdmin } from 'test/factories/make-admin'
import { makeCustomer } from 'test/factories/make-customer'
import { Email } from '@/domain/erp/enterprise/entities/value-objects/email'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { createDomainTestsFixture } from 'test/helpers/create-domain-test-fixture'

let fixture: ReturnType<typeof createDomainTestsFixture>
let sut: ValidateEmailUseCase

describe('Validate Email Use Case', () => {
  beforeEach(() => {
    fixture = createDomainTestsFixture()

    sut = new ValidateEmailUseCase(
      fixture.logger,
      fixture.adminsRepo,
      fixture.customersRepo,
    )
  })

  it('should return right({ isValid: true }) when email does not exist for any user', async () => {
    const result = await sut.execute({ email: 'free@example.com' })

    expect(result.isRight()).toBe(true)
    if (result.isLeft()) throw result.value

    expect(result.value).toStrictEqual({ isValid: true })
  })

  it('should return left(UserAlreadyExistsError) when email already belongs to an admin', async () => {
    const admin = makeAdmin(
      {
        email: Email.create({ email: 'admin@example.com' }),
      },
      new UniqueEntityID('admin-1'),
    )

    await fixture.adminsRepo.create(admin)

    const result = await sut.execute({ email: 'admin@example.com' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UserAlreadyExistsError)
  })

  it('should return left(UserAlreadyExistsError) when email already belongs to a customer', async () => {
    const customer = makeCustomer(
      {
        email: Email.create({ email: 'customer@example.com' }),
      },
      new UniqueEntityID('customer-1'),
    )

    await fixture.customersRepo.create(customer)

    const result = await sut.execute({ email: 'customer@example.com' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UserAlreadyExistsError)
  })
})
