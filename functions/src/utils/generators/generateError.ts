import errCode from 'err-code'
import { get } from 'lodash'

export enum ErrorCode {
  ActivityApiError = 'ActivityApiError',
  ApplicationLogApiError = 'ApplicationLogApiError',
  AuthenticationApiError = 'AuthenticationApiError',
  CategoryApiError = 'CategoryApiError',
  ChatApiError = 'ChatApiError',
  CommentApiError = 'CommentApiError',
  CommunityApiError = 'CommunityApiError',
  InviteApiError = 'InviteApiError',
  LikeApiError = 'LikeApiError',
  OrderApiError = 'OrderApiError',
  ProductApiError = 'ProductApiError',
  ProductSubscriptionApiError = 'ProductSubscriptionApiError',
  ProductSubscriptionPlanApiError = 'ProductSubscriptionPlanApiError',
  ReviewApiError = 'ReviewApiError',
  SearchApiError = 'SearchApiError',
  ShopApiError = 'ShopApiError',
  UnauthorizedError = 'UnauthorizedError',
  UnknownError = 'UnknownError',
  UserApiError = 'UserApiError',
  ValidationError = 'ValidationError',
  WishlistApiError = 'WishlistApiError',
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
