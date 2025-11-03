import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { NotAllowedError } from '@/core/errors/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found.error'
import { InvalidPasswordError } from '@/domain/erp/application/use-cases/errors/errors/invalid-password.error'
import { UserAlreadyExistsError } from '@/domain/erp/application/use-cases/errors/errors/user-already-exists.error'

import { EditCustomerUseCase } from '@/domain/erp/application/use-cases/edit-customer'

import { Name } from '@/domain/erp/enterprise/entities/value-objects/name'
import { Email } from '@/domain/erp/enterprise/entities/value-objects/email'

import { makePhone } from 'test/factories/make-phone'
import { makeAdmin } from 'test/factories/make-admin'
import { makeCustomer } from 'test/factories/make-customer'
import { makeCustomerVehicle } from 'test/factories/make-customer-vehicle'

import { createDomainTestsFixture } from 'test/helpers/create-domain-test-fixture'

let fixture: ReturnType<typeof createDomainTestsFixture>

let sut: EditCustomerUseCase

describe('Edit vehicle', () => {
  beforeEach(() => {
    fixture = createDomainTestsFixture()

    sut = new EditCustomerUseCase(
      fixture.logger,
      fixture.customersRepo,
      fixture.caslErpService,
    )
  })

  it('should be able to edit a customer from a admin account', async () => {
    await fixture.adminsRepo.create(
      makeAdmin({}, new UniqueEntityID('admin-1')),
    )

    await fixture.customersRepo.create(
      makeCustomer({}, new UniqueEntityID('customer-1')),
    )

    await fixture.phonesRepo.createMany([
      makePhone(
        {
          userRole: 'CUSTOMER',
          userId: new UniqueEntityID('customer-1'),
        },
        new UniqueEntityID('phone-1'),
      ),
      makePhone(
        {
          userRole: 'CUSTOMER',
          userId: new UniqueEntityID('customer-1'),
        },
        new UniqueEntityID('phone-2'),
      ),
    ])

    await fixture.customerVehiclesRepo.createMany([
      makeCustomerVehicle(
        {
          customerId: new UniqueEntityID('customer-1'),
        },
        new UniqueEntityID('vehicle-1'),
      ),
      makeCustomerVehicle(
        {
          customerId: new UniqueEntityID('customer-1'),
        },
        new UniqueEntityID('vehicle-2'),
      ),
    ])

    const result = await sut.execute({
      customerId: 'customer-1',
      currentUserId: 'admin-1',

      firstName: 'New',
      lastName: 'Name',
      username: 'New Name',

      email: 'new-email@example.com',
      password: 'NewTester1@Test',
    })

    const updatedCustomer = fixture.customersRepo.items[0]

    expect(result.isRight()).toBe(true)
    expect(updatedCustomer.password).toBe('NewTester1@Test')
    expect(updatedCustomer.email.email).toBe('new-email@example.com')
    expect(updatedCustomer.name.username).toBe('New Name')
    expect(fixture.phonesRepo.items).toHaveLength(2)
    expect(fixture.customerVehiclesRepo.items).toHaveLength(2)
  })

  it('should not be able to edit a customer from a self account', async () => {
    await fixture.customersRepo.create(
      makeCustomer({}, new UniqueEntityID('customer-1')),
    )

    await fixture.phonesRepo.createMany([
      makePhone(
        {
          userRole: 'CUSTOMER',
          userId: new UniqueEntityID('customer-1'),
        },
        new UniqueEntityID('phone-1'),
      ),
      makePhone(
        {
          userRole: 'CUSTOMER',
          userId: new UniqueEntityID('customer-1'),
        },
        new UniqueEntityID('phone-2'),
      ),
    ])

    await fixture.customerVehiclesRepo.createMany([
      makeCustomerVehicle(
        {
          customerId: new UniqueEntityID('customer-1'),
        },
        new UniqueEntityID('vehicle-1'),
      ),
      makeCustomerVehicle(
        {
          customerId: new UniqueEntityID('customer-1'),
        },
        new UniqueEntityID('vehicle-2'),
      ),
    ])

    const result = await sut.execute({
      customerId: 'customer-1',
      currentUserId: 'customer-1',

      firstName: 'New',
      lastName: 'Name',
      username: 'New Name',

      email: 'new-email@example.com',
      password: 'NewTester1@Test',
    })

    const updatedCustomer = fixture.customersRepo.items[0]

    expect(result.isRight()).toBe(false)
    expect(updatedCustomer.password).not.toBe('NewTester1@Test')
    expect(updatedCustomer.email.email).not.toBe('new-email@example.com')
    expect(updatedCustomer.name.username).not.toBe('New Name')
    expect(fixture.phonesRepo.items).toHaveLength(2)
    expect(fixture.customerVehiclesRepo.items).toHaveLength(2)
  })

  it('should not be able to edit a unexistent customer', async () => {
    await fixture.adminsRepo.create(
      makeAdmin({}, new UniqueEntityID('admin-1')),
    )

    const result = await sut.execute({
      customerId: 'unexistent-customer-id',
      currentUserId: 'admin-1',

      firstName: 'New',
      lastName: 'Name',
      username: 'New Name',

      email: 'new-email@example.com',
      password: 'NewTester1@Test',
    })

    expect(result.isRight()).toBe(false)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)

    expect(fixture.customersRepo.items.length).toBe(0)
  })

  it('should not be able to edit another customer', async () => {
    await fixture.customersRepo.create(
      makeCustomer(
        {
          name: Name.create({
            firstName: 'Previous',
            lastName: 'Name',
            username: 'Previous Name',
          }),
          email: Email.create({ email: 'previous-customer@example.com' }),
          password: 'PreviousTester1@Test',
        },
        new UniqueEntityID('customer-1'),
      ),
    )

    await fixture.customersRepo.create(
      makeCustomer({}, new UniqueEntityID('customer-2')),
    )

    const result = await sut.execute({
      customerId: 'customer-1',
      currentUserId: 'customer-2',

      firstName: 'New',
      lastName: 'Name',
      username: 'New Name',

      email: 'new-email@example.com',
      password: 'NewTester1@Test',
    })

    const updatedCustomer = fixture.customersRepo.items[0]

    expect(result.isRight()).toBe(false)
    expect(result.value).toBeInstanceOf(NotAllowedError)

    expect(updatedCustomer.name.username).toBe('Previous Name')
    expect(updatedCustomer.password).toBe('PreviousTester1@Test')
    expect(updatedCustomer.email.email).toBe('previous-customer@example.com')
  })

  it('should not be able to edit a customer with an existing email', async () => {
    await fixture.adminsRepo.create(
      makeAdmin({}, new UniqueEntityID('admin-1')),
    )

    await fixture.customersRepo.create(
      makeCustomer(
        {
          email: Email.create({ email: 'existing-customer@example.com' }),
        },
        new UniqueEntityID('customer-1'),
      ),
    )

    await fixture.customersRepo.create(
      makeCustomer(
        {
          email: Email.create({ email: 'previous-customer@example.com' }),
        },
        new UniqueEntityID('customer-2'),
      ),
    )

    const result = await sut.execute({
      customerId: 'customer-2',
      currentUserId: 'admin-1',

      firstName: 'New',
      lastName: 'Name',
      username: 'New Name',

      email: 'existing-customer@example.com',
      password: 'NewTester1@Test',
    })

    const updatedCustomer = fixture.customersRepo.items[1]

    expect(result.isRight()).toBe(false)
    expect(result.value).toBeInstanceOf(UserAlreadyExistsError)

    expect(updatedCustomer.email.email).toBe('previous-customer@example.com')
  })

  it('should not be able to edit a customer with a incorrect password pattern', async () => {
    await fixture.adminsRepo.create(
      makeAdmin({}, new UniqueEntityID('admin-1')),
    )

    await fixture.customersRepo.create(
      makeCustomer(
        {
          password: 'Tester1@Test',
        },
        new UniqueEntityID('customer-1'),
      ),
    )

    const result = await sut.execute({
      customerId: 'customer-1',
      currentUserId: 'admin-1',

      firstName: 'New',
      lastName: 'Name',
      username: 'New Name',

      email: 'new-email@example.com',
      password: 'Incorrect-Password-Pattern',
    })

    const updatedCustomer = fixture.customersRepo.items[0]

    expect(result.isRight()).toBe(false)
    expect(result.value).toBeInstanceOf(InvalidPasswordError)

    expect(updatedCustomer.password).toBe('Tester1@Test')
  })
})
