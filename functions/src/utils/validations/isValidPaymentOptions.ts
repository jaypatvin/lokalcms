import { isArray } from 'lodash'
import { BankCodesService } from '../../service'

const isPaymentOptionsValid = async (paymentOptions) => {
  for (const paymentOption of paymentOptions) {
    const { bank_code, account_name, account_number } = paymentOption
    if (!bank_code || !account_name || !account_number) {
      return false
    }

    const bankCode = await BankCodesService.getBankCodeById(bank_code)
    if (!bankCode) return false
  }

  return true
}

const isValidPaymentOptions = async (paymentOptions) => {
  if (!paymentOptions || !isArray(paymentOptions)) {
    return false
  }

  if (!(await isPaymentOptionsValid(paymentOptions))) {
    return false
  }

  return true
}

export default isValidPaymentOptions
