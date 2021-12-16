import { isEqual } from 'lodash'

const isScheduleDerived = (derived, source) => {
  if (!isEqual(derived.start_dates, source.start_dates)) return false
  if (derived.repeat_type !== source.repeat_type) return false
  if (derived.repeat_unit !== source.repeat_unit) return false
  if (source.schedule.custom) {
    if (!derived.schedule.custom) return false
    for (const [dateKey, value] of Object.entries<any>(source.schedule.custom)) {
      if (!derived.schedule.custom[dateKey]) return false
      if (value.unavailable && !derived.schedule.custom[dateKey].unavailable) return false
      if (
        !value.unavailable &&
        !isEqual(derived.schedule.custom[dateKey], value) &&
        !derived.schedule.custom[dateKey].unavailable
      ) {
        return false
      }
    }
  }
  return true
}

export default isScheduleDerived
