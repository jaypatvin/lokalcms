import errCode from 'err-code'
import { get } from 'lodash'

export enum ErrorCode {
  UnknownError = 'UnknownError',
  UnauthorizedError = 'UnauthorizedError',
  ValidationError = 'ValidationError',
  AuthenticationApiError = 'AuthenticationApiError',
  UserApiError = 'UserApiError',
  CommunityApiError = 'CommunityApiError',
  ShopApiError = 'ShopApiError',
  ProductApiError = 'ProductApiError',
  OrderApiError = 'OrderApiError',
  ActivityApiError = 'ActivityApiError',
  ApplicationLogApiError = 'ApplicationLogApiError',
  CategoryApiError = 'CategoryApiError',
  ChatApiError = 'ChatApiError',
  CommentApiError = 'CommentApiError',
}

type Props = {
  message?: string
  err?: any
  [x: string]: unknown
}

export const generateNotFoundError = (code: ErrorCode, entityName: string, docId: string) => {
  return generateError(code, {
    message: `${entityName} with id "${docId}" not found`,
  })
}

const generateError = (code: ErrorCode, props: Props = {}) => {
  const errProps = { status: 'error', ...props }
  const message = get(errProps, 'message', code)
  if (code === ErrorCode.UnknownError) {
    return errCode(new Error('UnknownError'), 'UnknownError', errProps)
  }
  return errCode(new Error(message), code, errProps)
}

export default generateError
