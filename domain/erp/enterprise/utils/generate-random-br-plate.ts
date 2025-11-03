/**
 * Generate a random Brazilian vehicle plate.
 * Supports both old and new Mercosur patterns.
 */
export function generateRandomBRPlate(): string {
  const letters = () => String.fromCharCode(65 + Math.floor(Math.random() * 26)) // A-Z
  const randomDigit = () => Math.floor(Math.random() * 10).toString()

  const isNewPattern = Math.random() < 0.5 // 50% chance
  const prefix = letters() + letters() + letters()

  if (isNewPattern) {
    // ABC1D23
    return prefix + randomDigit() + letters() + randomDigit() + randomDigit()
  } else {
    // ABC1234
    return (
      prefix + randomDigit() + randomDigit() + randomDigit() + randomDigit()
    )
  }
}
