import { ErrorType } from './types'

function cn(css: { [x: string]: string[] }) {
  let styles = ''

  Object.keys(css).map((key) => {
    return (styles += css[key].reduce((temp, currentStyle) => {
      if (key === 'default') {
        return `${temp} ${currentStyle}`
      } else {
        return `${temp} ${key}:${currentStyle}`
      }
    }, ''))
  })

  return styles
}

function formatError(errors: ErrorType[] = []) {
  const formatedError: { [x: string]: string } = {}
  errors.forEach((error) => (formatedError[error.field] = error.message))

  return formatedError
}

export { cn, formatError }
