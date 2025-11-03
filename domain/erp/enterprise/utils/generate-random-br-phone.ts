import { PhoneTypesLitteral } from '@/core/enums/prisma.enums'

/**
 * Generate a random Brazilian phone number
 * @param type Phone type: 'MOBILE' or 'HOME'
 * @returns string with DDD + phone number
 */
export function generateRandomBRPhone(
  type: PhoneTypesLitteral = 'MOBILE',
): string {
  const ddds = [
    '11',
    '21',
    '31',
    '41',
    '51',
    '61',
    '71',
    '81',
    '91',
    '19',
    '27',
    '84',
    '82',
    '92',
    '98',
    '99',
  ]
  const ddd = ddds[Math.floor(Math.random() * ddds.length)]
  const randomDigit = () => Math.floor(Math.random() * 10).toString()

  let numberBody: string

  if (type === 'MOBILE') {
    // celular: 9 + 8 dígitos
    numberBody = '9' + Array.from({ length: 8 }, randomDigit).join('')
  } else {
    // fixo: 8 dígitos, não começa com 9
    numberBody = Array.from({ length: 8 }, (_, i) =>
      i === 0 ? (Math.floor(Math.random() * 8) + 2).toString() : randomDigit(),
    ).join('')
  }

  return ddd + numberBody
}
