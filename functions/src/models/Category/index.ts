type Category = {
  archived: boolean
  cover_url: string
  created_at: FirebaseFirestore.Timestamp
  description: string
  icon_url: string
  name: string
  status: 'enabled' | 'disabled'
  updated_at?: FirebaseFirestore.Timestamp
}

export default Category