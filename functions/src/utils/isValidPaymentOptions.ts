import { some, isArray } from 'lodash'

const isValidPaymentOptions = (paymentOptions) => {
  if (!paymentOptions || typeof paymentOptions !== 'object') return false

  const { bank_accounts, gcash_accounts } = paymentOptions
  if (
    (!bank_accounts && !gcash_accounts) ||
    (bank_accounts && !isArray(bank_accounts)) ||
    (gcash_accounts && !isArray(gcash_accounts))
  ) {
    return false
  }

  // any of bank accounts is invalid or have missing fields
  if (
    bank_accounts &&
    some(
      bank_accounts,
      ({ bank, account_name, account_number }) => !bank || !account_name || !account_number
    )
  ) {
    return false
  }

  // any of gcash accounts is invalid or have missing fields
  if (gcash_accounts && some(gcash_accounts, ({ name, number }) => !name || !number)) {
    return false
  }

  return true
}

export default isValidPaymentOptions
