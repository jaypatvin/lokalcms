import React, { useState } from 'react'
import ReactCalendar, { CalendarTileProperties } from 'react-calendar'
import dayjs from 'dayjs'
import useOuterClick from '../../customHooks/useOuterClick'
import { DayKeyVal, DaysType, RepeatType } from '../../utils/types'
import { Checkbox, SelectField, TextField } from './index'

const days: DaysType[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

const ScheduleField = ({}) => {
  const defaultStartDate = new Date()
  defaultStartDate.setHours(0, 0, 0, 0)

  const [showStartCalendar, setShowStartCalendar] = useState(false)
  const [showCustomizeCalendar, setShowCustomizeCalendar] = useState(false)
  const [repeatUnit, setRepeatUnit] = useState(1)
  const [repeatType, setRepeatType] = useState<RepeatType>('day')
  const [repeatMonthType, setRepeatMonthType] = useState<'sameDate' | 'sameDay'>('sameDate')
  const [daysOpen, setDaysOpen] = useState<DaysType[]>(['mon', 'tue', 'wed', 'thu', 'fri'])
  const [startDates, setStartDates] = useState<Date[]>([defaultStartDate])
  const [customAvailableDates, setCustomAvailableDates] = useState<string[]>([])
  const [unavailableDates, setUnavailableDates] = useState<string[]>([])
  const [startTime, setStartTime] = useState('09:00 AM')
  const [endTime, setEndTime] = useState('05:00 PM')

  const startCalendarRef = useOuterClick(() => setShowStartCalendar(false))
  const customizeCalendarRef = useOuterClick(() => setShowCustomizeCalendar(false))

  const constructOperatingHours = () => {
    let repeat_type = repeatType
    if (repeatMonthType === 'sameDay') {
      const firstDate = startDates[0]
      const firstDateDay = DayKeyVal[firstDate.getDay()]
      const firstDateNumToCheck = dayjs(firstDate).date()
      const firstDateNthWeek = Math.ceil(firstDateNumToCheck / 7)
      // @ts-ignore
      repeat_type = `${firstDateNthWeek}-${firstDateDay}`
    }
    return {
      start_time: startTime,
      end_time: endTime,
      start_dates: startDates.map((d) => dayjs(d).format('YYYY-MM-DD')),
      repeat_unit: repeatUnit,
      repeat_type,
      unavailable_dates: unavailableDates,
      custom_dates: customAvailableDates.map((d) => ({ date: d })),
    }
  }

  const resetDates = () => {
    setStartDates([defaultStartDate])
    resetCustomDates()
  }

  const resetCustomDates = () => {
    setCustomAvailableDates([])
    setUnavailableDates([])
  }

  const tileDisabled = ({ date }: CalendarTileProperties) => {
    if (repeatType === 'week') {
      return !daysOpen.includes(DayKeyVal[date.getDay()])
    }
    return false
  }

  const getTileClass = ({ date }: CalendarTileProperties) => {
    const firstDate = startDates[0]
    const firstDateDay = DayKeyVal[firstDate.getDay()]
    const firstDateNumToCheck = dayjs(firstDate).date()
    const firstDateNthWeek = Math.ceil(firstDateNumToCheck / 7)
    const firstDateNthDayOfMonth = `${firstDateNthWeek}-${firstDateDay}`
    const tileDate = dayjs(date)
    const tileDateDay = DayKeyVal[tileDate.day()]
    const tileDateNumToCheck = tileDate.date()
    const tileDateNthWeek = Math.ceil(tileDateNumToCheck / 7)
    const tileDateNthDayOfMonth = `${tileDateNthWeek}-${tileDateDay}`
    let tileClass = null
    if (firstDate) {
      const tileDate = dayjs(date)
      const formattedDate = tileDate.format('YYYY-MM-DD')
      const day = DayKeyVal[tileDate.day()]
      if (unavailableDates.includes(formattedDate)) {
        tileClass = 'gray'
      } else if (customAvailableDates.includes(formattedDate)) {
        tileClass = 'yellow'
      } else if (repeatType === 'day') {
        const isValid = dayjs(date).diff(firstDate, 'days') % repeatUnit === 0
        if (isValid && (dayjs(firstDate).isBefore(date) || dayjs(firstDate).isSame(date))) {
          tileClass = 'orange'
        }
      } else if (repeatType === 'week' && daysOpen.includes(day)) {
        const dayOpenDate = startDates.find((d) => DayKeyVal[d.getDay()] === day)
        const dayOpenDateFormatted = dayjs(dayOpenDate).format('YYYY-MM-DD')
        const isValid =
          dayOpenDate && dayjs(date).diff(dayOpenDateFormatted, 'weeks') % repeatUnit === 0
        if (
          isValid &&
          (dayjs(dayOpenDateFormatted).isBefore(date) || dayjs(dayOpenDateFormatted).isSame(date))
        ) {
          tileClass = 'orange'
        }
      } else if (repeatType === 'month') {
        let isValid = false
        if (repeatMonthType === 'sameDate') {
          isValid = dayjs(firstDate).date() === dayjs(date).date()
        } else if (repeatMonthType === 'sameDay') {
          isValid = firstDateNthDayOfMonth === tileDateNthDayOfMonth
        }
        isValid = isValid && dayjs(date).diff(firstDate, 'months') % repeatUnit === 0
        if (isValid && (dayjs(firstDate).isBefore(date) || dayjs(firstDate).isSame(date))) {
          tileClass = 'orange'
        }
      }
    }
    return tileClass
  }

  const isAvailableByDefault = (date: Date) => {
    const firstDate = startDates[0]
    const firstDateDay = DayKeyVal[firstDate.getDay()]
    const firstDateNumToCheck = dayjs(firstDate).date()
    const firstDateNthWeek = Math.ceil(firstDateNumToCheck / 7)
    const firstDateNthDayOfMonth = `${firstDateNthWeek}-${firstDateDay}`
    const tileDate = dayjs(date)
    const tileDateDay = DayKeyVal[tileDate.day()]
    const tileDateNumToCheck = tileDate.date()
    const tileDateNthWeek = Math.ceil(tileDateNumToCheck / 7)
    const tileDateNthDayOfMonth = `${tileDateNthWeek}-${tileDateDay}`
    const day = DayKeyVal[tileDate.day()]
    if (repeatType === 'day') {
      const isValid = dayjs(date).diff(firstDate, 'days') % repeatUnit === 0
      if (isValid && (dayjs(firstDate).isBefore(date) || dayjs(firstDate).isSame(date))) {
        return true
      }
    } else if (repeatType === 'week' && daysOpen.includes(day)) {
      const dayOpenDate = startDates.find((d) => DayKeyVal[d.getDay()] === day)
      const dayOpenDateFormatted = dayjs(dayOpenDate).format('YYYY-MM-DD')
      const isValid =
        dayOpenDate && dayjs(date).diff(dayOpenDateFormatted, 'weeks') % repeatUnit === 0
      if (
        isValid &&
        (dayjs(dayOpenDateFormatted).isBefore(date) || dayjs(dayOpenDateFormatted).isSame(date))
      ) {
        return true
      }
    } else if (repeatType === 'month') {
      let isValid = false
      if (repeatMonthType === 'sameDate') {
        isValid = dayjs(firstDate).date() === dayjs(date).date()
      } else if (repeatMonthType === 'sameDay') {
        isValid = firstDateNthDayOfMonth === tileDateNthDayOfMonth
      }
      isValid = isValid && dayjs(date).diff(firstDate, 'months') % repeatUnit === 0
      if (isValid && (dayjs(firstDate).isBefore(date) || dayjs(firstDate).isSame(date))) {
        return true
      }
    }
    return false
  }

  const onClickDayOfTheWeek = (day: DaysType) => {
    if (daysOpen.includes(day)) {
      setDaysOpen(daysOpen.filter((d) => d !== day))
    } else {
      setDaysOpen([...daysOpen, day])
    }
    resetDates()
  }

  const onClickStartDate = (date: Date) => {
    if (repeatType === 'day') {
      setStartDates([date])
    } else {
      const dates = [date]
      for (let i = 1; i <= 6; i++) {
        const checkDate = dayjs(date).add(i, 'days')
        const checkDay = DayKeyVal[checkDate.day()]
        if (daysOpen.includes(checkDay)) {
          dates.push(new Date(checkDate.format('YYYY-MM-DD')))
        }
      }
      setStartDates(dates)
    }
    resetCustomDates()
  }

  const onCustomizeDates = (date: Date) => {
    const formattedDate = dayjs(date).format('YYYY-MM-DD')
    if (unavailableDates.includes(formattedDate)) {
      const newUnavailableDates = unavailableDates.filter((d) => !dayjs(d).isSame(formattedDate))
      setUnavailableDates(newUnavailableDates)
    } else if (customAvailableDates.includes(formattedDate)) {
      const newAvailableDates = customAvailableDates.filter((d) => !dayjs(d).isSame(formattedDate))
      setCustomAvailableDates(newAvailableDates)
    } else if (isAvailableByDefault(date)) {
      const newUnavailableDates = [...unavailableDates]
      newUnavailableDates.push(dayjs(date).format('YYYY-MM-DD'))
      setUnavailableDates(newUnavailableDates)
    } else {
      const newAvailableDates = [...customAvailableDates]
      newAvailableDates.push(dayjs(date).format('YYYY-MM-DD'))
      setCustomAvailableDates(newAvailableDates)
    }
  }

  return (
    <div>
      <TextField
        required
        label="Opening"
        type="text"
        size="small"
        onChange={(e) => setStartTime(e.target.value)}
        value={startTime}
      />
      <TextField
        required
        label="Closing"
        type="text"
        size="small"
        onChange={(e) => setEndTime(e.target.value)}
        value={endTime}
      />
      <div className="flex items-center mb-5">
        <p>Every</p>
        <input
          className="border-2 w-10 mx-3"
          type="number"
          max="99"
          min="0"
          onChange={(e) => {
            setRepeatUnit(e.currentTarget.valueAsNumber)
            resetDates()
          }}
          value={repeatUnit}
        />
        <SelectField
          required
          noMargin
          size="small"
          onChange={(e: any) => {
            setRepeatType(e.target.value)
            resetDates()
          }}
          defaultValue="day"
          options={[
            { id: 'day', name: 'day' },
            { id: 'week', name: 'week' },
            { id: 'month', name: 'month' },
          ]}
        />
      </div>
      {repeatType === 'week' && (
        <div className="flex mb-5">
          {days.map((day) => (
            <button
              className={`rounded-full border-2 w-10 h-10 m-2 capitalize ${
                daysOpen.includes(day) ? 'bg-yellow-600 text-white' : ''
              }`}
              type="button"
              onClick={() => onClickDayOfTheWeek(day)}
            >
              {day.slice(0, 1)}
            </button>
          ))}
        </div>
      )}
      {['day', 'week'].includes(repeatType) && (
        <div className="flex mb-5 items-center">
          <p>Start Date</p>
          <div ref={startCalendarRef} className="relative">
            <button
              className="rounded bg-primary-500 text-white ml-2 p-2"
              onClick={() => setShowStartCalendar(!showStartCalendar)}
            >
              {dayjs(startDates[0]).format('MMMM DD')}
            </button>
            {showStartCalendar && (
              <ReactCalendar
                className="w-72 absolute bottom-0 left-full z-20"
                onChange={(date) => onClickStartDate(date as Date)}
                value={startDates[0] || null}
                tileDisabled={tileDisabled}
                calendarType="US"
              />
            )}
          </div>
        </div>
      )}
      {repeatType === 'month' && (
        <div className="mb-5">
          <span ref={startCalendarRef} className="relative">
            <button
              className="rounded bg-primary-500 text-white p-2"
              onClick={() => setShowStartCalendar(!showStartCalendar)}
            >
              Start Date
            </button>
            {showStartCalendar && (
              <ReactCalendar
                className="w-72 absolute bottom-0 left-full z-20"
                onChange={(date) => setStartDates([date as Date])}
                value={startDates[0]}
                tileDisabled={tileDisabled}
                calendarType="US"
              />
            )}
          </span>
          <div className="">
            <Checkbox
              label={`${dayjs(startDates[0]).format('Do')} of the month`}
              size="small"
              onChange={() => {
                setRepeatMonthType('sameDate')
                resetCustomDates()
              }}
              noMargin
              value={repeatMonthType === 'sameDate'}
            />
            <Checkbox
              label={`Every ${dayjs(`2021-01-${Math.ceil(dayjs(startDates[0]).date() / 7)}`).format(
                'Do'
              )} ${dayjs(startDates[0]).format('dddd')}`}
              size="small"
              onChange={() => {
                setRepeatMonthType('sameDay')
                resetCustomDates()
              }}
              noMargin
              value={repeatMonthType === 'sameDay'}
            />
          </div>
        </div>
      )}
      <span ref={customizeCalendarRef} className="relative mb-5">
        <button
          className="rounded bg-primary-500 text-white p-2"
          onClick={() => setShowCustomizeCalendar(!showCustomizeCalendar)}
        >
          Customize dates
        </button>
        {showCustomizeCalendar && (
          <ReactCalendar
            className="w-72 absolute bottom-0 left-full z-20"
            onChange={(date) => onCustomizeDates(date as Date)}
            tileClassName={getTileClass}
            calendarType="US"
            value={null}
          />
        )}
      </span>
    </div>
  )
}

export default ScheduleField
