import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { EditPhoneUseCase } from '@/domain/erp/application/use-cases/edit-phone'

import { makePhone } from 'test/factories/make-phone'
import { makeAdmin } from 'test/factories/make-admin'
import { makeCustomer } from 'test/factories/make-customer'

import { NotAllowedError } from '@/core/errors/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found.error'

import { createDomainTestsFixture } from 'test/helpers/create-domain-test-fixture'

let fixture: ReturnType<typeof createDomainTestsFixture>

let sut: EditPhoneUseCase

describe('Edit vehicle', () => {
  beforeEach(() => {
    fixture = createDomainTestsFixture()

    sut = new EditPhoneUseCase(
      fixture.logger,
      fixture.phonesRepo,
      fixture.caslErpService,
    )
  })

  it('should be able to edit a self customer phone', async () => {
    await fixture.customersRepo.create(
      makeCustomer({}, new UniqueEntityID('customer-1')),
    )

    await fixture.phonesRepo.create(
      makePhone(
        {
          type: 'MOBILE',
          number: '11999999998',
          isWhatsapp: false,
          userRole: 'CUSTOMER',
          userId: new UniqueEntityID('customer-1'),
        },
        new UniqueEntityID('phone-1'),
      ),
    )

    const result = await sut.execute({
      phoneId: 'phone-1',
      currentUserId: 'customer-1',

      type: 'WORK',
      number: '11999999999',
      isWhatsapp: true,
    })

    expect(result.isRight()).toBe(true)

    expect(fixture.phonesRepo.items[0].type).toBe('WORK')
    expect(fixture.phonesRepo.items[0].number).toBe('11999999999')
    expect(fixture.phonesRepo.items[0].isWhatsapp).toBe(true)
  })

  it('should be able to edit a self admin phone', async () => {
    await fixture.adminsRepo.create(
      makeAdmin({}, new UniqueEntityID('admin-1')),
    )

    await fixture.phonesRepo.create(
      makePhone(
        {
          type: 'MOBILE',
          number: '11999999998',
          isWhatsapp: false,
          userRole: 'ADMIN',
          userId: new UniqueEntityID('admin-1'),
        },
        new UniqueEntityID('phone-1'),
      ),
    )

    const result = await sut.execute({
      phoneId: 'phone-1',
      currentUserId: 'admin-1',

      type: 'WORK',
      number: '11999999999',
      isWhatsapp: true,
    })

    expect(result.isRight()).toBe(true)

    expect(fixture.phonesRepo.items[0].type).toBe('WORK')
    expect(fixture.phonesRepo.items[0].number).toBe('11999999999')
    expect(fixture.phonesRepo.items[0].isWhatsapp).toBe(true)
  })

  it('should be able to edit a customer phone from a admin account', async () => {
    await fixture.adminsRepo.create(
      makeAdmin({}, new UniqueEntityID('admin-1')),
    )

    await fixture.customersRepo.create(
      makeCustomer({}, new UniqueEntityID('customer-1')),
    )

    await fixture.phonesRepo.create(
      makePhone(
        {
          type: 'MOBILE',
          number: '11999999998',
          isWhatsapp: false,
          userRole: 'CUSTOMER',
          userId: new UniqueEntityID('customer-1'),
        },
        new UniqueEntityID('phone-1'),
      ),
    )

    const result = await sut.execute({
      phoneId: 'phone-1',
      currentUserId: 'admin-1',

      type: 'WORK',
      number: '11999999999',
      isWhatsapp: true,
    })

    expect(result.isRight()).toBe(true)

    expect(fixture.phonesRepo.items[0].type).toBe('WORK')
    expect(fixture.phonesRepo.items[0].number).toBe('11999999999')
    expect(fixture.phonesRepo.items[0].isWhatsapp).toBe(true)
  })

  it('should not be able to edit a phone if owner is incorrect', async () => {
    await fixture.customersRepo.create(
      makeCustomer({}, new UniqueEntityID('customer-1')),
    )

    await fixture.customersRepo.create(
      makeCustomer({}, new UniqueEntityID('customer-2')),
    )

    await fixture.phonesRepo.create(
      makePhone(
        {
          type: 'MOBILE',
          number: '11999999998',
          isWhatsapp: false,
          userRole: 'CUSTOMER',
          userId: new UniqueEntityID('customer-2'),
        },
        new UniqueEntityID('phone-1'),
      ),
    )

    const result = await sut.execute({
      phoneId: 'phone-1',
      currentUserId: 'customer-1',

      type: 'WORK',
      number: '11999999999',
      isWhatsapp: true,
    })

    expect(result.isRight()).toBe(false)
    expect(result.value).toBeInstanceOf(NotAllowedError)

    expect(fixture.phonesRepo.items[0].type).toBe('MOBILE')
    expect(fixture.phonesRepo.items[0].number).toBe('11999999998')
    expect(fixture.phonesRepo.items[0].isWhatsapp).toBe(false)
  })

  it('should not be able to edit another customers phone', async () => {
    await fixture.customersRepo.create(
      makeCustomer({}, new UniqueEntityID('customer-1')),
    )

    await fixture.customersRepo.create(
      makeCustomer({}, new UniqueEntityID('customer-2')),
    )

    await fixture.phonesRepo.create(
      makePhone(
        {
          type: 'MOBILE',
          number: '11999999998',
          isWhatsapp: false,
          userRole: 'CUSTOMER',
          userId: new UniqueEntityID('customer-2'),
        },
        new UniqueEntityID('phone-1'),
      ),
    )

    const result = await sut.execute({
      phoneId: 'phone-1',
      currentUserId: 'customer-1',

      type: 'WORK',
      number: '11999999999',
      isWhatsapp: true,
    })

    expect(result.isRight()).toBe(false)
    expect(result.value).toBeInstanceOf(NotAllowedError)

    expect(fixture.phonesRepo.items[0].type).toBe('MOBILE')
    expect(fixture.phonesRepo.items[0].number).toBe('11999999998')
    expect(fixture.phonesRepo.items[0].isWhatsapp).toBe(false)
  })

  it('should not be able to edit another admins phone', async () => {
    await fixture.adminsRepo.create(
      makeAdmin({}, new UniqueEntityID('admin-1')),
    )

    await fixture.adminsRepo.create(
      makeAdmin({}, new UniqueEntityID('admin-2')),
    )

    await fixture.phonesRepo.create(
      makePhone(
        {
          type: 'MOBILE',
          number: '11999999998',
          isWhatsapp: false,
          userRole: 'ADMIN',
          userId: new UniqueEntityID('admin-2'),
        },
        new UniqueEntityID('phone-1'),
      ),
    )

    const result = await sut.execute({
      phoneId: 'phone-1',
      currentUserId: 'admin-1',

      type: 'WORK',
      number: '11999999999',
      isWhatsapp: true,
    })

    expect(result.isRight()).toBe(false)
    expect(result.value).toBeInstanceOf(NotAllowedError)

    expect(fixture.phonesRepo.items[0].type).toBe('MOBILE')
    expect(fixture.phonesRepo.items[0].number).toBe('11999999998')
    expect(fixture.phonesRepo.items[0].isWhatsapp).toBe(false)
  })

  it('should not be able to edit a unexistent phone', async () => {
    await fixture.adminsRepo.create(
      makeAdmin({}, new UniqueEntityID('admin-1')),
    )

    const result = await sut.execute({
      phoneId: 'unexistent-phone-id',
      currentUserId: 'admin-1',

      type: 'WORK',
      number: '11999999999',
      isWhatsapp: true,
    })

    expect(result.isRight()).toBe(false)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
