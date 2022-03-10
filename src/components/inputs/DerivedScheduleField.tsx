import React, { useEffect, useState } from 'react'
import ReactCalendar, { CalendarTileProperties } from 'react-calendar'
import dayjs from 'dayjs'
import { RepeatType } from '../../utils/types'
import { Checkbox } from './index'
import { Shop } from '../../models'
import { isAvailableByDefault } from '../../utils/dates'

type ScheduleBody = {
  start_time: string
  end_time: string
  start_dates: string[]
  repeat_unit: number
  repeat_type: RepeatType
  unavailable_dates: string[]
  custom_dates: {
    date: string
  }[]
}

type Props = {
  onChange: (schedule: ScheduleBody) => void
  shop: Shop
}

const ScheduleField = ({ onChange, shop }: Props) => {
  const [useCustomAvailability, setUseCustomAvailability] = useState(false)
  const [unavailableDates, setUnavailableDates] = useState<string[]>([])

  const constructAvailability = () => {
    const { repeat_type, repeat_unit, start_time, end_time, start_dates, schedule } =
      shop.operating_hours
    let unavailable_dates = unavailableDates
    const custom_dates: { date: string }[] = []
    if (schedule && schedule.custom) {
      Object.entries(schedule.custom).forEach(([key, val]) => {
        if (val.unavailable) {
          unavailable_dates.push(key)
        } else if (!unavailable_dates.includes(key) && (val.start_time || val.end_time)) {
          custom_dates.push({ date: key })
        }
      })
    }
    const availability = {
      start_time,
      end_time,
      start_dates,
      repeat_unit,
      repeat_type,
      unavailable_dates,
      custom_dates: custom_dates.length ? custom_dates : [],
    }
    return availability
  }

  useEffect(() => {
    onChange(constructAvailability())
  }, [unavailableDates, useCustomAvailability])

  const onCustomizeDates = (date: Date) => {
    const formattedDate = dayjs(date).format('YYYY-MM-DD')
    if (unavailableDates.includes(formattedDate)) {
      const newUnavailableDates = unavailableDates.filter((d) => !dayjs(d).isSame(formattedDate))
      setUnavailableDates(newUnavailableDates)
    } else if (isAvailableByDefault(date, shop!)) {
      const newUnavailableDates = [...unavailableDates]
      newUnavailableDates.push(dayjs(date).format('YYYY-MM-DD'))
      setUnavailableDates(newUnavailableDates)
    }
  }

  const getTileClass = ({ date }: CalendarTileProperties) => {
    const formattedDate = dayjs(date).format('YYYY-MM-DD')
    if (unavailableDates.includes(formattedDate)) {
      return null
    } else if (isAvailableByDefault(date, shop!)) {
      return 'orange'
    }
    return null
  }

  return (
    <div>
      <Checkbox
        label="Use shop schedule"
        onChange={() => setUseCustomAvailability(!useCustomAvailability)}
        noMargin
        value={!useCustomAvailability}
      />
      <Checkbox
        label="Use custom availability"
        onChange={() => setUseCustomAvailability(!useCustomAvailability)}
        noMargin
        value={useCustomAvailability}
      />
      {useCustomAvailability && shop && (
        <ReactCalendar
          className="w-72"
          onChange={(date) => onCustomizeDates(date as Date)}
          tileDisabled={({ date }) => !isAvailableByDefault(date, shop)}
          tileClassName={getTileClass}
          calendarType="US"
          value={null}
        />
      )}
    </div>
  )
}

export default ScheduleField
