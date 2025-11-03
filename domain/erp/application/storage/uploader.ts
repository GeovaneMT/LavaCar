export interface UploadParams {
  fileName: string
  fileType: string
  buffer: Buffer
}

export abstract class Uploader {
  abstract upload(params: UploadParams): Promise<{ url: string }>
}
