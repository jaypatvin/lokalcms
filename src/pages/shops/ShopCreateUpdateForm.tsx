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

const ShopCreateUpdateForm = ({
  isOpen = false,
  setIsOpen,
  mode = 'create',
  dataToUpdate,
  isModal = true,
}: CreateUpdateFormProps) => {
  const history = useHistory()
  const [openSchedule, setOpenSchedule] = useState(false)
  const [showStartCalendar, setShowStartCalendar] = useState(false)
  const [showCustomizeCalendar, setShowCustomizeCalendar] = useState(false)
  const [repeatUnit, setRepeatUnit] = useState(1)
  const [repeatType, setRepeatType] = useState<'day' | 'week' | 'month'>('day')
  const [daysOpen, setDaysOpen] = useState<DaysType[]>(['mon', 'tue', 'wed', 'thu', 'fri'])
  const [startDates, setStartDates] = useState<Date[]>([])
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
      if (res.status !== 'error') {
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

  const tileDisabled = ({ date }: any) => {
    if (repeatType === 'week') {
      return !daysOpen.includes(DayKeyVal[date.getDay()])
    }
    return false
  }

  const getTileClass = ({ date }: CalendarTileProperties) => {
    const firstDate = startDates[0]
    const tileDate = dayjs(date)
    const day = DayKeyVal[tileDate.day()]
    let tileClass = null
    if (repeatType === 'day') {
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
      const isValid =
        dayjs(firstDate).date() === dayjs(date).date() &&
        dayjs(date).diff(firstDate, 'months') % repeatUnit === 0
      if (isValid && (dayjs(firstDate).isBefore(date) || dayjs(firstDate).isSame(date))) {
        tileClass = 'orange'
      }
    }
    return tileClass
  }

  console.log('startDates', startDates)

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
        <TextField
          required
          label="opening"
          type="text"
          size="small"
          onChange={(e) => changeHandler('opening', e.target.value)}
          isError={fieldIsError('opening')}
          value={data.opening}
        />
        <TextField
          required
          label="closing"
          type="text"
          size="small"
          onChange={(e) => changeHandler('closing', e.target.value)}
          isError={fieldIsError('closing')}
          value={data.closing}
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
          <div className="flex items-center mb-2">
            <p>Every</p>
            <input
              className="border-2 w-10 mx-3"
              type="number"
              max="99"
              min="0"
              onChange={(e) => setRepeatUnit(e.currentTarget.valueAsNumber)}
              value={repeatUnit}
            />
            <Dropdown
              className="ml-2 z-10"
              simpleOptions={['day', 'week', 'month']}
              onSelect={(option: any) => setRepeatType(option.value)}
              currentValue={repeatType}
            />
          </div>
          {repeatType === 'week' && (
            <div className="flex mb-2">
              {days.map((day) => (
                <button
                  className={`rounded-full border-2 w-10 h-10 m-2 capitalize ${
                    daysOpen.includes(day) ? 'bg-yellow-600 text-white' : ''
                  }`}
                  type="button"
                  onClick={() => {
                    if (daysOpen.includes(day)) {
                      setDaysOpen(daysOpen.filter((d) => d !== day))
                    } else {
                      setDaysOpen([...daysOpen, day])
                    }
                    setStartDates([])
                  }}
                >
                  {day.slice(0, 1)}
                </button>
              ))}
            </div>
          )}
          {['day', 'week'].includes(repeatType) && (
            <div className="flex mb-2 items-center">
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
                    onChange={(date: any) => {
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
                    }}
                    value={startDates[0]}
                    tileDisabled={tileDisabled}
                    calendarType="US"
                  />
                )}
              </div>
            </div>
          )}
          {repeatType === 'month' && (
            <div className="mb-2">
              <span ref={startCalendarRef} className="relative">
                <button
                  className="rounded bg-primary-500 text-white p-2"
                  onClick={() => setShowStartCalendar(!showStartCalendar)}
                >
                  {dayjs(startDates[0]).format('Do')} of the month
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
            </div>
          )}
          <span ref={customizeCalendarRef} className="relative mb-2">
            <button
              className="rounded bg-primary-500 text-white ml-2 p-2"
              onClick={() => setShowCustomizeCalendar(!showCustomizeCalendar)}
            >
              Customize dates
            </button>
            {showCustomizeCalendar && (
              <ReactCalendar
                className="w-72 absolute bottom-0 left-full z-20"
                onChange={(date: any) => null}
                tileClassName={getTileClass}
                calendarType="US"
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
