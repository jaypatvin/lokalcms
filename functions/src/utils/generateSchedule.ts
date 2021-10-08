import dayjs from 'dayjs'

type Days = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

const DayKeyVal: { [x: number]: Days } = {
  0: 'sun',
  1: 'mon',
  2: 'tue',
  3: 'wed',
  4: 'thu',
  5: 'fri',
  6: 'sat',
}

type RepeatType = 'day' | 'week' | 'month'

type CustomDate = {
  date: string
  start_time?: string
  end_time?: string
}

type DayType = {
  start_date: string
  repeat_unit: number
  repeat_type: RepeatType
}

type ScheduleType = {
  mon?: DayType
  tue?: DayType
  wed?: DayType
  thu?: DayType
  fri?: DayType
  sat?: DayType
  sun?: DayType
  custom?: {
    [x: string]: {
      unavailable?: boolean
      start_time?: string
      end_time?: string
    }
  }
}

type Fields = {
  start_time: string
  end_time: string
  start_dates: string[]
  repeat_unit: number
  repeat_type: RepeatType
  unavailable_dates?: string[]
  custom_dates?: CustomDate[]
}

const generateSchedule = ({
  start_time,
  end_time,
  start_dates,
  repeat_unit,
  repeat_type,
  unavailable_dates,
  custom_dates,
}: Fields) => {
  const schedule: ScheduleType = {}

  start_dates.forEach((date) => {
    if (repeat_unit === 0) {
      if (!schedule.custom) schedule.custom = {}
      schedule.custom[date] = {
        start_time,
        end_time,
      }
    } else if (['day', 'week', 'month'].includes(repeat_type)) {
      const day = DayKeyVal[dayjs(date).day()]
      schedule[day] = {
        start_date: date,
        repeat_unit,
        repeat_type,
      }
    }
  })

  if (custom_dates && custom_dates.length) {
    custom_dates.forEach((custom_date) => {
      const { date, start_time: start, end_time: end } = custom_date
      if (!schedule.custom) schedule.custom = {}
      schedule.custom[date] = {
        start_time: start || start_time,
        end_time: end || end_time,
      }
    })
  }

  if (unavailable_dates && unavailable_dates.length) {
    unavailable_dates.forEach((date) => {
      if (!schedule.custom) schedule.custom = {}
      schedule.custom[date] = {
        unavailable: true,
      }
    })
  }

  return schedule
}

export default generateSchedule
