import { ErrorRequestHandler } from 'express'
import { get } from 'lodash'
import { ErrorCode } from '../utils/generators/generateError'

const errorResponder: ErrorRequestHandler = async (err, req, res, next) => {
  const errorCode = get(err, 'code')
  switch (errorCode) {
    case ErrorCode.UnauthorizedError:
      res.status(403).json(err)
      break
    case ErrorCode.ActivityApiError:
    case ErrorCode.ApplicationLogApiError:
    case ErrorCode.AuthenticationApiError:
    case ErrorCode.CategoryApiError:
    case ErrorCode.ChatApiError:
    case ErrorCode.CommentApiError:
    case ErrorCode.CommunityApiError:
    case ErrorCode.InviteApiError:
    case ErrorCode.LikeApiError:
    case ErrorCode.OrderApiError:
    case ErrorCode.ProductApiError:
    case ErrorCode.ProductSubscriptionApiError:
    case ErrorCode.ProductSubscriptionPlanApiError:
    case ErrorCode.ReviewApiError:
    case ErrorCode.SearchApiError:
    case ErrorCode.ShopApiError:
    case ErrorCode.UserApiError:
    case ErrorCode.ValidationError:
    case ErrorCode.WishlistApiError:
      res.status(400).json(err)
      break
    default:
      res.status(500).json(err)
      break
  }
}

export default errorResponder
