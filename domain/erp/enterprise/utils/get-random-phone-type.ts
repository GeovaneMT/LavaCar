import { PhoneType, PhoneTypesLitteral } from '@/core/enums/prisma.enums'

export const phoneTypes: PhoneTypesLitteral[] = Object.values(PhoneType)

export function getRandomPhoneType(): PhoneTypesLitteral {
  const randomIndex = Math.floor(Math.random() * phoneTypes.length)
  return phoneTypes[randomIndex]
}
