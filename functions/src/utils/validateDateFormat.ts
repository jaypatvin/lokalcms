import dayjs from 'dayjs'
import { isString } from 'lodash'
import { dateFormat } from './helpers'

const validateDateFormat = (dateStr: string) => {
  return isString(dateStr) && dateFormat.test(dateStr) && dayjs(dateStr).isValid()
}

export default validateDateFormat
