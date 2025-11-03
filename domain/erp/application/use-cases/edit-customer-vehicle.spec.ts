import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { NotAllowedError } from '@/core/errors/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found.error'
import { VehicleAlreadyExistsError } from '@/domain/erp/application/use-cases/errors/errors/vehicle-already-exists.error'

import { Plate } from '@/domain/erp/enterprise/entities/value-objects/plate'

import { EditCustomerVehicleUseCase } from '@/domain/erp/application/use-cases/edit-customer-vehicle'

import { makeAdmin } from 'test/factories/make-admin'
import { makeCustomer } from 'test/factories/make-customer'
import { makeCustomerVehicle } from 'test/factories/make-customer-vehicle'
import { makeVehicleBreakdown } from 'test/factories/make-vehicle-breakdown'

import { createDomainTestsFixture } from 'test/helpers/create-domain-test-fixture'

let fixture: ReturnType<typeof createDomainTestsFixture>

let sut: EditCustomerVehicleUseCase

describe('Edit vehicle', () => {
  beforeEach(() => {
    fixture = createDomainTestsFixture()

    sut = new EditCustomerVehicleUseCase(
      fixture.logger,
      fixture.adminsRepo,
      fixture.caslErpService,
      fixture.customerVehiclesRepo,
    )
  })

  it('should be able to edit a vehicle', async () => {
    await fixture.adminsRepo.create(
      makeAdmin({}, new UniqueEntityID('admin-1')),
    )

    await fixture.vehicleBreakdownsRepo.createMany([
      makeVehicleBreakdown(
        {
          vehicleId: new UniqueEntityID('vehicle-1'),
        },
        new UniqueEntityID('breakdown-1'),
      ),
      makeVehicleBreakdown(
        {
          vehicleId: new UniqueEntityID('vehicle-1'),
        },
        new UniqueEntityID('breakdown-2'),
      ),
    ])

    await fixture.customerVehiclesRepo.create(
      makeCustomerVehicle(
        {
          customerId: new UniqueEntityID('customer-1'),
        },
        new UniqueEntityID('vehicle-1'),
      ),
    )

    const result = await sut.execute({
      currentUserId: 'admin-1',

      vehicleId: 'vehicle-1',

      type: 'CAR',
      model: 'Gol',
      year: '2022',
      plate: 'ABC1234',
    })

    expect(result.isRight()).toBe(true)

    expect(fixture.customerVehiclesRepo.items[0].type).toBe('CAR')
    expect(fixture.customerVehiclesRepo.items[0].model).toBe('Gol')
    expect(fixture.customerVehiclesRepo.items[0].year).toBe('2022')
    expect(fixture.customerVehiclesRepo.items[0].plate.plate).toBe('ABC1234')

    expect(fixture.vehicleBreakdownsRepo.items).toHaveLength(2)
  })

  it('should not be able to edit a unexistent vehicle', async () => {
    await fixture.adminsRepo.create(
      makeAdmin({}, new UniqueEntityID('admin-1')),
    )

    const result = await sut.execute({
      currentUserId: 'admin-1',

      vehicleId: 'unexistent-vehicle-id',
      type: 'CAR',
      model: 'Gol',
      year: '2022',
      plate: 'ABC1234',
    })

    expect(result.isRight()).toBe(false)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to edit a vehicle from a non admin user', async () => {
    await fixture.customersRepo.create(
      makeCustomer({}, new UniqueEntityID('customer-1')),
    )

    const newCustomerVehicle = makeCustomerVehicle(
      {
        customerId: new UniqueEntityID('customer-1'),
        plate: Plate.create({ plate: 'ABC4321' }),
      },
      new UniqueEntityID('customerVehicle-1'),
    )
    await fixture.customerVehiclesRepo.create(newCustomerVehicle)

    const result = await sut.execute({
      currentUserId: 'customer-1',

      vehicleId: newCustomerVehicle.id.toValue(),

      type: 'CAR',
      model: 'Gol',
      year: '2022',
      plate: 'ABC1234',
    })

    expect(result.isRight()).toBe(false)
    expect(result.value).toBeInstanceOf(NotAllowedError)

    expect(fixture.customerVehiclesRepo.items[0].plate.plate).toBe('ABC4321')
  })

  it('should not be able to edit a vehicle with the same plate as another vehicle', async () => {
    await fixture.adminsRepo.create(
      makeAdmin({}, new UniqueEntityID('admin-1')),
    )

    await fixture.customerVehiclesRepo.createMany([
      makeCustomerVehicle(
        {
          customerId: new UniqueEntityID('customer-1'),
          plate: Plate.create({ plate: 'ABC1234' }),
        },
        new UniqueEntityID('vehicle-1'),
      ),
      makeCustomerVehicle(
        {
          customerId: new UniqueEntityID('customer-2'),
          plate: Plate.create({ plate: 'ABC4321' }),
        },
        new UniqueEntityID('vehicle-2'),
      ),
    ])

    const result = await sut.execute({
      currentUserId: 'admin-1',

      vehicleId: 'vehicle-2',
      type: 'CAR',
      model: 'Gol',
      year: '2022',
      plate: 'ABC1234',
    })

    expect(result.isRight()).toBe(false)
    expect(result.value).toBeInstanceOf(VehicleAlreadyExistsError)

    const vehicle2InRepo = fixture.customerVehiclesRepo.items[1]

    expect({
      plate: vehicle2InRepo.plate.plate,
      id: vehicle2InRepo.id.toString(),
    }).toEqual({
      plate: 'ABC4321',
      id: 'vehicle-2',
    })
  })
})
