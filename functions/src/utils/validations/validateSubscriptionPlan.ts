import dayjs from 'dayjs'
import _ from 'lodash'
import {
  dateFormat,
  nthDayOfMonthFormat,
  repeatTypeValues,
} from '../helpers'

const validateSubscriptionPlan = (plan: any) => {
  const {
    start_dates,
    repeat_unit,
    repeat_type,
  } = plan
  const errors = []
  if (_.isEmpty(start_dates)) {
    errors.push('start_dates is missing.')
  }
  if (!_.isNumber(repeat_unit)) {
    errors.push('repeat_unit is missing or not a number.')
  }
  if (_.isNumber(repeat_unit) && repeat_unit < 1) {
    errors.push('repeat_unit must be greater than 1.')
  }
  if (_.isEmpty(repeat_type)) {
    errors.push('repeat_type is missing.')
  }
  if (!_.isEmpty(errors)) {
    return { valid: false, message: 'Required fields missing', errors }
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

  return { valid: true }
}

export default validateSubscriptionPlan
