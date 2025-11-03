import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found.error'
import { UploadAndCreateAttachmentUseCase } from '@/domain/erp/application/use-cases/upload-and-create-attachment'
import { InvalidAttachmentTypeError } from '@/domain/erp/application/use-cases/errors/errors/invalid-attachment-type.error'

import { FakeUploader } from 'test/storage/fake-uploader'

import { makeCustomer } from 'test/factories/make-customer'
import { createDomainTestsFixture } from 'test/helpers/create-domain-test-fixture'

let fixture: ReturnType<typeof createDomainTestsFixture>

let fakeUploader: FakeUploader

let sut: UploadAndCreateAttachmentUseCase

describe('Upload and create attachment', () => {
  beforeEach(() => {
    fixture = createDomainTestsFixture()

    fakeUploader = FakeUploader.create()

    sut = new UploadAndCreateAttachmentUseCase(
      fixture.logger,
      fakeUploader,
      fixture.caslErpService,
      fixture.attachmentsRepo,
    )
  })

  it('should be able to upload and create an attachment', async () => {
    await fixture.customersRepo.create(
      makeCustomer({}, new UniqueEntityID('customer-1')),
    )

    const result = await sut.execute({
      currentUserId: 'customer-1',
      fileName: 'profile.png',
      fileType: 'image/png',
      buffer: Buffer.from(''),
    })

    expect(result.isRight()).toBe(true)
    expect(fakeUploader.uploads).toHaveLength(1)

    expect(fakeUploader.uploads[0]).toEqual(
      expect.objectContaining({
        fileName: 'profile.png',
      }),
    )
  })

  it('should not be able to upload an attachment with invalid file type', async () => {
    await fixture.customersRepo.create(
      makeCustomer({}, new UniqueEntityID('customer-1')),
    )

    const result = await sut.execute({
      currentUserId: 'customer-1',
      fileName: 'profile.mp3',
      fileType: 'audio/mpeg',
      buffer: Buffer.from(''),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidAttachmentTypeError)
  })

  it('should not be able to upload an attachment from a unexistent user', async () => {
    const result = await sut.execute({
      currentUserId: 'unexistent-user-id',
      fileName: 'profile.png',
      fileType: 'image/png',
      buffer: Buffer.from(''),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
