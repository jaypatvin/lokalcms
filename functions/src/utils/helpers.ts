const stringIsNum = (input) => {
  if (typeof input != 'string') return false
  // parseFloat is for strings with white spaces
  return !isNaN(Number(input)) && !isNaN(parseFloat(input))
}

export const fieldIsNum = (input) => {
  return typeof input == 'number' || stringIsNum(input)
}