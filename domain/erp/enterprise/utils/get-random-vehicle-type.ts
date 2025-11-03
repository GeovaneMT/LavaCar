import {
  VehicleType,
  VehicleTypesLitteral,
} from '@/core/enums/prisma.enums'

const vehicleTypes: VehicleTypesLitteral[] = Object.values(VehicleType)

export function getRandomVehicleType(): VehicleTypesLitteral {
  const randomIndex = Math.floor(Math.random() * vehicleTypes.length)
  return vehicleTypes[randomIndex]
}
