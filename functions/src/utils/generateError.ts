import errCode from 'err-code'
import { get } from 'lodash'

export enum ErrorCode {
  UnauthorizedError = 'UnauthorizedError',
  ValidationError = 'ValidationError',
  UserApiError = 'UserApiError',
}

type Props = {
  message?: string
  err?: any
  [x: string]: unknown
}

export const generateUserNotFoundError = (code: ErrorCode, userId: string) => {
  return generateError(code, {
    message: `User with id "${userId}" not found`,
  })
}

export const generateCommunityNotFoundError = (code: ErrorCode, communityId: string) => {
  return generateError(code, {
    message: `Community with id "${communityId}" not found`,
  })
}

const generateError = (code: ErrorCode, props: Props = {}) => {
  const errProps = { status: 'error', ...props }
  const message = get(errProps, 'message', code)
  switch (code) {
    case ErrorCode.UnauthorizedError:
    case ErrorCode.ValidationError:
    case ErrorCode.UserApiError:
      return errCode(new Error(message), code, errProps)
    default:
      return errCode(new Error('UnknownError'), 'UnknownError', errProps)
  }
}

export default generateError
