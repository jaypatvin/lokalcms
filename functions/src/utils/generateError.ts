import errCode from 'err-code'

export enum ErrorCode {
  ValidationError = 'ValidationError',
}

type Props = {
  err: unknown
  [x: string]: unknown
}

const generateError = (code: ErrorCode, props: Props) => {
  switch (code) {
    case ErrorCode.ValidationError:
      return errCode(new Error(code), code, props)
    default:
      return errCode(new Error('UnknownError'), 'UnknownError', props)
  }
}

export default generateError
