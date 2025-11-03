import { WatchedList } from '@/core/entities/watched-list'
import { VehicleBreakdown } from '@/domain/erp/enterprise/entities/vehicle-breakdown'

export class VehicleBreakdownList extends WatchedList<VehicleBreakdown> {
  compareItems(a: VehicleBreakdown, b: VehicleBreakdown): boolean {
    return a.id.equals(b.id)
  }
}
