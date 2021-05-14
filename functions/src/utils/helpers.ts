const stringIsNum = (input) => {
  if (typeof input != 'string') return false
  // parseFloat is for strings with white spaces
  return !isNaN(Number(input)) && !isNaN(parseFloat(input))
}

export const fieldIsNum = (input) => {
  return typeof input == 'number' || stringIsNum(input)
}

export const required_fields = ['name', 'description', 'user_id', 'operating_hours']
export const hourFormat = /((1[0-2]|0[1-9]):([0-5][0-9]) ([AaPp][Mm]))/
export const dateFormat = /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/
export const repeatTypeValues = [
  'day',
  'week',
  'month'
]
export type Days = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
export const DayKeyVal: { [x: number]: Days } = {
  0: 'sun',
  1: 'mon',
  2: 'tue',
  3: 'wed',
  4: 'thu',
  5: 'fri',
  6: 'sat',
}

export const timeFormatError = (field: string, time: string) => {
  return `Incorrect time format for field "${field}": "${time}". Please follow format "12:00 PM"`
}
