const nthDayOfMonthFormat = /^(1|2|3|4|5)-(mon|tue|wed|thu|fri|sat|sun)$/

export const validateNthDayOfMonth = (repeat_type: string) => {
  return nthDayOfMonthFormat.test(repeat_type)
}
