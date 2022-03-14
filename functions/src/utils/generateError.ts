import errCode from 'err-code'
import { get } from 'lodash'

export enum ErrorCode {
  ValidationError = 'ValidationError',
  UserCreateError = 'UserCreateError',
}

type Props = {
  message?: string
  [x: string]: unknown
}

const generateError = (code: ErrorCode, props: Props) => {
  const errProps = { status: 'error', ...props }
  const message = get(errProps, 'message', code)
  switch (code) {
    case ErrorCode.ValidationError:
    case ErrorCode.UserCreateError:
      return errCode(new Error(message), code, errProps)
    default:
      return errCode(new Error('UnknownError'), 'UnknownError', errProps)
  }
}

export default generateError
