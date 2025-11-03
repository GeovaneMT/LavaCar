export abstract class CacheRepository {
  abstract delete(key: string): Promise<void>
  abstract get<T = string>(key: string): Promise<T | null>
  abstract set(
    key: string,
    value: string | object,
    expirationSeconds?: number,
  ): Promise<void>

  abstract batchDelete(keys: string[]): Promise<void>
  abstract batchSet(
    items: {
      key: string
      value: string | object
      expirationSeconds?: number
    }[],
  ): Promise<void>

  abstract getTtl(key: string): Promise<number>
  abstract scan(pattern: string, count?: number): Promise<string[]>
}
