type BankCode = {
  icon_url: string
  name: string
  type: 'bank' | 'wallet'
  created_at?: FirebaseFirestore.Timestamp
  updated_at?: FirebaseFirestore.Timestamp
}

export type BankCodeCreateData = Pick<BankCode, 'icon_url' | 'name' | 'type'>

export default BankCode
