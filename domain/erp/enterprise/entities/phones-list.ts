import { WatchedList } from '@/core/entities/watched-list'
import { Phone } from '@/domain/erp/enterprise/entities/phone'

export class PhoneList extends WatchedList<Phone> {
  compareItems(a: Phone, b: Phone): boolean {
    return a.id.equals(b.id)
  }
}
