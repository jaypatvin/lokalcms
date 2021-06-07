import React, { useEffect, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import ReactCalendar, { CalendarTileProperties } from 'react-calendar'
import useOuterClick from '../../customHooks/useOuterClick'
import { Button } from '../../components/buttons'
import Dropdown from '../../components/Dropdown'
import { Checkbox, TextField } from '../../components/inputs'
import Modal from '../../components/modals'
import { API_URL } from '../../config/variables'
import { useAuth } from '../../contexts/AuthContext'
import { CreateUpdateFormProps, DayKeyVal, DaysType, statusColorMap } from '../../utils/types'
import dayjs from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat'

dayjs.extend(advancedFormat)

const initialData = {}
const days: DaysType[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

const defaultStartDate = new Date()
defaultStartDate.setHours(0, 0, 0, 0)

const ShopCreateUpdateForm = ({
  isOpen = false,
  setIsOpen,
  mode = 'create',
  dataToUpdate,
  isModal = true,
}: CreateUpdateFormProps) => {
  const {
    repeat_unit,
    repeat_type,
    repeat_month_type,
    days_open,
    start_dates,
    unavailable_dates,
    custom_dates,
    start_time,
    end_time,
  }: any = dataToUpdate && dataToUpdate.operating_hours ? dataToUpdate.operating_hours : {}
  const history = useHistory()
  const [openSchedule, setOpenSchedule] = useState(false)
  const [showStartCalendar, setShowStartCalendar] = useState(false)
  const [showCustomizeCalendar, setShowCustomizeCalendar] = useState(false)
  const [repeatUnit, setRepeatUnit] = useState(repeat_unit || 1)
  const [repeatType, setRepeatType] = useState<'day' | 'week' | 'month'>(repeat_type || 'day')
  const [repeatMonthType, setRepeatMonthType] = useState<'sameDate' | 'sameDay'>(
    repeat_month_type || 'sameDate'
  )
  const [daysOpen, setDaysOpen] = useState<DaysType[]>(
    days_open || ['mon', 'tue', 'wed', 'thu', 'fri']
  )
  const [startDates, setStartDates] = useState<Date[]>(start_dates || [defaultStartDate])
  const [customAvailableDates, setCustomAvailableDates] = useState<string[]>(custom_dates || [])
  const [unavailableDates, setUnavailableDates] = useState<string[]>(unavailable_dates || [])
  const [startTime, setStartTime] = useState(start_time || '09:00 AM')
  const [endTime, setEndTime] = useState(end_time || '05:00 PM')
  const [data, setData] = useState<any>(dataToUpdate || initialData)
  const [responseData, setResponseData] = useState<any>({})
  const { firebaseToken } = useAuth()
  const startCalendarRef = useOuterClick(() => setShowStartCalendar(false))
  const customizeCalendarRef = useOuterClick(() => setShowCustomizeCalendar(false))

  useEffect(() => {
    if (dataToUpdate) {
      setData(dataToUpdate)
    } else {
      setData(initialData)
    }
  }, [dataToUpdate])

  const changeHandler = (field: string, value: string | number | boolean | null) => {
    const newData = { ...data }
    newData[field] = value
    setData(newData)
  }

  const constructOperatingHours = () => {
    let repeat_type: any = repeatType
    if (repeatMonthType === 'sameDay') {
      const firstDate = startDates[0]
      const firstDateDay = DayKeyVal[firstDate.getDay()]
      const firstDateNumToCheck = dayjs(firstDate).date()
      const firstDateNthWeek = Math.ceil(firstDateNumToCheck / 7)
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

  const onSave = async () => {
    if (API_URL && firebaseToken) {
      let url = `${API_URL}/shops`
      let method = 'POST'
      if (mode === 'update' && data.id) {
        url = `${url}/${data.id}`
        method = 'PUT'
      }
      let res: any = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${firebaseToken}`,
        },
        method,
        body: JSON.stringify({ ...data, source: 'cms' }),
      })
      res = await res.json()
      setResponseData(res)
      if (res.status !== 'error' && openSchedule) {
        await fetch(`${API_URL}/shops/${res.data.id}/operatingHours`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${firebaseToken}`,
          },
          method: 'PUT',
          body: JSON.stringify({ ...constructOperatingHours(), source: 'cms' }),
        })
        setResponseData({})
        setData(initialData)
        if (setIsOpen) {
          setIsOpen(false)
        } else if (!isModal) {
          history.push('/shops')
        }
      }
    } else {
      console.error('environment variable for the api does not exist.')
    }
  }

  const fieldIsError = (field: string) => {
    const { status, error_fields } = responseData
    if (status === 'error' && error_fields && error_fields.length) {
      return error_fields.includes(field)
    }
    return false
  }

  const resetDates = () => {
    setStartDates([defaultStartDate])
    resetCustomDates()
  }

  const resetCustomDates = () => {
    setCustomAvailableDates([])
    setUnavailableDates([])
  }

  const tileDisabled = ({ date }: any) => {
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
        let dayOpenDate: any = startDates.find((d) => DayKeyVal[d.getDay()] === day)
        if (dayOpenDate) dayOpenDate = dayjs(dayOpenDate).format('YYYY-MM-DD')
        const isValid = dayOpenDate && dayjs(date).diff(dayOpenDate, 'weeks') % repeatUnit === 0
        if (isValid && (dayjs(dayOpenDate).isBefore(date) || dayjs(dayOpenDate).isSame(date))) {
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
      let dayOpenDate: any = startDates.find((d) => DayKeyVal[d.getDay()] === day)
      if (dayOpenDate) dayOpenDate = dayjs(dayOpenDate).format('YYYY-MM-DD')
      const isValid = dayOpenDate && dayjs(date).diff(dayOpenDate, 'weeks') % repeatUnit === 0
      if (isValid && (dayjs(dayOpenDate).isBefore(date) || dayjs(dayOpenDate).isSame(date))) {
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
    <Modal title={`${mode} Shop`} isOpen={isOpen} setIsOpen={setIsOpen} onSave={onSave}>
      <div className="flex justify-between mb-3">
        <Dropdown
          name="Status"
          simpleOptions={['enabled', 'disabled']}
          currentValue={data.status}
          size="small"
          onSelect={(option) => changeHandler('status', option.value)}
          buttonColor={statusColorMap[data.status]}
        />
        <Checkbox
          label="Is Close"
          onChange={(e) => changeHandler('is_close', e.target.checked)}
          noMargin
          value={data.is_close || false}
        />
      </div>
      <div className="grid grid-cols-2 gap-x-2">
        <TextField
          required
          label="name"
          type="text"
          size="small"
          onChange={(e) => changeHandler('name', e.target.value)}
          isError={fieldIsError('name')}
          value={data.name}
        />
        <TextField
          required
          label="description"
          type="text"
          size="small"
          onChange={(e) => changeHandler('description', e.target.value)}
          isError={fieldIsError('description')}
          value={data.description}
        />
        <TextField
          required
          label="user"
          type="text"
          size="small"
          onChange={(e) => changeHandler('user_id', e.target.value)}
          isError={fieldIsError('user_id')}
          value={data.user_id}
        />
      </div>
      <div>
        <Checkbox
          label="Set operating hours"
          onChange={() => setOpenSchedule(!openSchedule)}
          noMargin
          value={openSchedule}
        />
      </div>
      {openSchedule && (
        <div className="p-2">
          <TextField
            required
            label="opening"
            type="text"
            size="small"
            onChange={(e) => setStartTime(e.target.value)}
            value={startTime}
          />
          <TextField
            required
            label="closing"
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
            <Dropdown
              className="ml-2 z-10"
              simpleOptions={['day', 'week', 'month']}
              onSelect={(option: any) => {
                setRepeatType(option.value)
                resetDates()
              }}
              currentValue={repeatType}
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
                    onChange={(date: any) => onClickStartDate(date)}
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
                    onChange={(date: any) => setStartDates([date])}
                    value={startDates[0]}
                    tileDisabled={tileDisabled}
                    calendarType="US"
                  />
                )}
              </span>
              <div className="">
                <Checkbox
                  label={`${dayjs(startDates[0]).format('Do')} of the month`}
                  onChange={() => {
                    setRepeatMonthType('sameDate')
                    resetCustomDates()
                  }}
                  noMargin
                  value={repeatMonthType === 'sameDate'}
                />
                <Checkbox
                  label={`Every ${dayjs(
                    `2021-01-${Math.ceil(dayjs(startDates[0]).date() / 7)}`
                  ).format('Do')} ${dayjs(startDates[0]).format('dddd')}`}
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
                onChange={(date: any) => onCustomizeDates(date)}
                tileClassName={getTileClass}
                calendarType="US"
                value={null}
              />
            )}
          </span>
        </div>
      )}
      {responseData.status === 'error' && (
        <p className="text-red-600 text-center">{responseData.message}</p>
      )}
      {!isModal && (
        <div className="flex justify-end">
          <Link to="/users">
            <Button color="secondary">Cancel</Button>
          </Link>
          <Button color="primary" className="ml-3" onClick={onSave}>
            Save
          </Button>
        </div>
      )}
    </Modal>
  )
}

export default ShopCreateUpdateForm
