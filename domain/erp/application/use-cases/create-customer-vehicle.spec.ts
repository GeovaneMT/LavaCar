import { CreateCustomerVehiclesUseCase } from '@/domain/erp/application/use-cases/create-customer-vehicle'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { Plate } from '@/domain/erp/enterprise/entities/value-objects/plate'

import { makeAdmin } from 'test/factories/make-admin'
import { makeCustomer } from 'test/factories/make-customer'
import { makeCustomerVehicle } from 'test/factories/make-customer-vehicle'

import { createDomainTestsFixture } from 'test/helpers/create-domain-test-fixture'

import { NotAllowedError } from '@/core/errors/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found.error'
import { VehicleAlreadyExistsError } from '@/domain/erp/application/use-cases/errors/errors/vehicle-already-exists.error'

import { generateRandomBRPlate } from '@/domain/erp/enterprise/utils/generate-random-br-plate'

let sut: CreateCustomerVehiclesUseCase
let fixture: ReturnType<typeof createDomainTestsFixture>

describe('Create Vehicle', () => {
  beforeEach(() => {
    fixture = createDomainTestsFixture()

    sut = new CreateCustomerVehiclesUseCase(
      fixture.logger,
      fixture.customersRepo,
      fixture.caslErpService,
      fixture.customerVehiclesRepo,
    )
  })

  it('should be able to create a vehicle to a customer from a admin account', async () => {
    await fixture.adminsRepo.create(
      makeAdmin({}, new UniqueEntityID('admin-1')),
    )

    await fixture.customersRepo.create(
      makeCustomer({}, new UniqueEntityID('customer-1')),
    )

    const result = await sut.execute({
      customerId: 'customer-1',
      currentUserId: 'admin-1',

      type: 'CAR',
      model: 'Gol',
      year: '2020',
      plate: generateRandomBRPlate(),
    })

    expect(result.isRight()).toBe(true)
    expect(fixture.customerVehiclesRepo.items).toHaveLength(1)
  })

  it('should be able to create a vehicle to a customer from a self customer', async () => {
    await fixture.customersRepo.create(
      makeCustomer({}, new UniqueEntityID('customer-1')),
    )

    const result = await sut.execute({
      customerId: 'customer-1',
      currentUserId: 'customer-1',

      type: 'CAR',
      model: 'Gol',
      year: '2020',
      plate: generateRandomBRPlate(),
    })

    expect(result.isRight()).toBe(true)
    expect(fixture.customerVehiclesRepo.items).toHaveLength(1)
  })

  it('should not be able to create a vehicle if the plate is already in use', async () => {
    await fixture.customersRepo.create(
      makeCustomer({}, new UniqueEntityID('customer-1')),
    )

    const plate = generateRandomBRPlate()

    await fixture.customerVehiclesRepo.create(
      makeCustomerVehicle(
        {
          plate: Plate.create({
            plate,
          }),
        },
        new UniqueEntityID('vehicle-1'),
      ),
    )

    const result = await sut.execute({
      customerId: 'customer-1',
      currentUserId: 'customer-1',

      type: 'CAR',
      model: 'Gol',
      year: '2020',
      plate,
    })

    expect(result.isRight()).toBe(false)
    expect(result.value).toBeInstanceOf(VehicleAlreadyExistsError)

    expect(fixture.customerVehiclesRepo.items).toHaveLength(1)
  })

  it('should not be able to create a vehicle for another customer', async () => {
    await fixture.customersRepo.create(
      makeCustomer({}, new UniqueEntityID('customer-1')),
    )

    await fixture.customersRepo.create(
      makeCustomer({}, new UniqueEntityID('customer-2')),
    )

    const result = await sut.execute({
      customerId: 'customer-2',
      currentUserId: 'customer-1',

      type: 'CAR',
      model: 'Gol',
      year: '2020',
      plate: generateRandomBRPlate(),
    })

    expect(result.isRight()).toBe(false)
    expect(result.value).toBeInstanceOf(NotAllowedError)

    expect(fixture.customerVehiclesRepo.items).toHaveLength(0)
  })

  it('should not be able to create a vehicle to a unexistent customer', async () => {
    await fixture.adminsRepo.create(
      makeAdmin({}, new UniqueEntityID('admin-1')),
    )

    const result = await sut.execute({
      customerId: 'unexistent-customer-id',
      currentUserId: 'admin-1',

      type: 'CAR',
      model: 'Gol',
      year: '2020',
      plate: generateRandomBRPlate(),
    })

    expect(result.isRight()).toBe(false)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)

    expect(fixture.customerVehiclesRepo.items).toHaveLength(0)
  })
})
