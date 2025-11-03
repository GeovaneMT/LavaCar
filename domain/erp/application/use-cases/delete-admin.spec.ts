import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found.error'

import { DeleteAdminUseCase } from '@/domain/erp/application/use-cases/delete-admin'

import { makePhone } from 'test/factories/make-phone'
import { makeAdmin } from 'test/factories/make-admin'

import { createDomainTestsFixture } from 'test/helpers/create-domain-test-fixture'

let sut: DeleteAdminUseCase
let fixture: ReturnType<typeof createDomainTestsFixture>

describe('Delete Admin', () => {
  beforeEach(() => {
    fixture = createDomainTestsFixture()
    sut = new DeleteAdminUseCase(
      fixture.logger,
      fixture.adminsRepo,
      fixture.caslErpService,
    )
  })

  it('should be able to delete another admin', async () => {
    const newAdmin = makeAdmin()
    await fixture.adminsRepo.create(newAdmin)

    fixture.phonesRepo.items.push(
      makePhone(
        {
          userRole: 'ADMIN',
          userId: newAdmin.id,
        },
        new UniqueEntityID('1'),
      ),

      makePhone(
        {
          userRole: 'ADMIN',
          userId: newAdmin.id,
        },
        new UniqueEntityID('2'),
      ),
    )

    const result = await sut.execute({
      adminId: newAdmin.id.toString(),
      currentUserId: newAdmin.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    expect(fixture.adminsRepo.items).toHaveLength(0)
    expect(fixture.phonesRepo.items).toHaveLength(0)
  })

  it('should not be able to delete a unexistent admin', async () => {
    const result = await sut.execute({
      adminId: 'unexistent-admin-id',
      currentUserId: 'unexistent-admin-id',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
