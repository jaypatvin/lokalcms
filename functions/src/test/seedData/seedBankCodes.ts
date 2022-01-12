import db from '../../utils/db'
import sleep from '../../utils/sleep'
import { bankCodes } from './mockData/bankCodes'

export const seedBankCodes = async () => {
  for (const bankCode of bankCodes) {
    try {
      await sleep(100)
      const { id, icon_url, name, type } = bankCode
      await db.bankCodes.doc(id).set({
        name,
        icon_url,
        // @ts-ignore
        type,
      })
    } catch (error) {
      console.error('Error creating bank code:', error)
    }
  }
}
