type BankCode = {
  icon_url: string
  name: string
  type: 'bank' | 'wallet'
  created_at?: FirebaseFirestore.Timestamp | FirebaseFirestore.FieldValue
  updated_at?: FirebaseFirestore.Timestamp | FirebaseFirestore.FieldValue
}

export type BankCodeCreateData = Pick<BankCode, 'icon_url' | 'name' | 'type'>

export default BankCode
