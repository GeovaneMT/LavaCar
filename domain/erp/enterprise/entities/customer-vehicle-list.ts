import { WatchedList } from '@/core/entities/watched-list'
import { CustomerVehicle } from '@/domain/erp/enterprise/entities/customer-vehicle'

export class CustomerVehicleList extends WatchedList<CustomerVehicle> {
  compareItems(a: CustomerVehicle, b: CustomerVehicle): boolean {
    return a.id.equals(b.id)
  }
}
