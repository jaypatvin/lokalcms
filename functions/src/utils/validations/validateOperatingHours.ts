import dayjs from 'dayjs'
import _ from 'lodash'
import {
  dateFormat,
  hourFormat,
  nthDayOfMonthFormat,
  repeatTypeValues,
  timeFormatError,
} from '../helpers'

const validateOperatingHours = (operating_hours: any) => {
  const {
    start_time,
    end_time,
    start_dates,
    repeat_unit,
    repeat_type,
    unavailable_dates,
    custom_dates,
  } = operating_hours
  const errors = []
  if (_.isEmpty(start_time)) {
    errors.push('start_time is missing.')
  }
  if (_.isEmpty(end_time)) {
    errors.push('end_time is missing.')
  }
  if (_.isEmpty(start_dates)) {
    errors.push('start_dates is missing.')
  }
  if (!_.isNumber(repeat_unit)) {
    errors.push('repeat_unit is missing or not a number.')
  }
  if (_.isEmpty(repeat_type)) {
    errors.push('repeat_type is missing.')
  }
  if (!_.isEmpty(errors)) {
    return { valid: false, message: 'Required fields missing', errors }
  }

  // check if correct time format
  if (!hourFormat.test(start_time))
    return {
      valid: false,
      message: timeFormatError('start_time', start_time),
    }
  if (!hourFormat.test(end_time))
    return {
      valid: false,
      message: timeFormatError('end_time', end_time),
    }

  _.forEach(start_dates, (date) => {
    if (!_.isString(date) || !dateFormat.test(date)) {
      errors.push(`Starting date ${date} is not a valid format. Please follow format "2021-12-31`)
    }
    if (!dayjs(date).isValid()) {
      errors.push(`Starting date ${date} is not a valid date.`)
    }
  })

  if (errors.length) {
    return { valid: false, message: 'Invalid starting dates', errors }
  }

  if (!_.includes(repeatTypeValues, repeat_type) && !nthDayOfMonthFormat.test(repeat_type)) {
    return {
      valid: false,
      message: `repeat_type can only be one of ${repeatTypeValues} or n-day e.g. 3-wed (third wednesday), 1-tue (first tuesday)`,
    }
  }

  if (_.isNaN(repeat_unit)) {
    return { valid: false, message: 'repeat_unit can only be a number' }
  }

  if (!_.isEmpty(unavailable_dates)) {
    _.forEach(unavailable_dates, (date) => {
      if (!_.isString(date) || !dateFormat.test(date)) {
        errors.push(
          `Unavailable date ${date} is not a valid format. Please follow format "2021-12-31`
        )
      }
      if (!dayjs(date).isValid()) {
        errors.push(`Unavailable date ${date} is not a valid date.`)
      }
    })

    if (errors.length) {
      return { valid: false, message: 'Invalid unavailable dates', errors }
    }
  }

  if (!_.isEmpty(custom_dates)) {
    _.forEach(custom_dates, (custom_date) => {
      if (typeof custom_date !== 'object') {
        errors.push('custom date must be an object')
      }
      if (!custom_date.date) {
        errors.push('custom date must have a date field')
      }
      if (!_.isString(custom_date.date) || !dateFormat.test(custom_date.date)) {
        errors.push(
          `custom date ${custom_date.date} is not a valid format. Please follow format "2021-12-31`
        )
      }
      if (!dayjs(custom_date.date).isValid()) {
        errors.push(`custom date ${custom_date.date} is not a valid date.`)
      }
      if (custom_date.start_time && !hourFormat.test(custom_date.start_time))
        errors.push(timeFormatError('start_time', custom_date.start_time))
      if (custom_date.end_time && !hourFormat.test(custom_date.end_time))
        errors.push(timeFormatError('end_time', custom_date.end_time))
    })
    if (errors.length) {
      return { valid: false, message: 'Invalid custom dates', errors }
    }
  }

  return { valid: true }
}

export default validateOperatingHours
