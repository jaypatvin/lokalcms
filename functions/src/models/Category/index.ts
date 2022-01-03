type Category = {
  archived: boolean
  cover_url: string
  created_at: FirebaseFirestore.Timestamp
  description: string
  icon_url: string
  keywords?: string[]
  name: string
  status: 'enabled' | 'disabled'
  updated_at?: FirebaseFirestore.Timestamp
  updated_by?: string
  updated_from?: '' | 'cms' | 'app'
}

export type CategoryCreateData = Pick<
  Category,
  | 'name'
  | 'description'
  | 'icon_url'
  | 'cover_url'
  | 'status'
  | 'keywords'
  | 'archived'
  | 'updated_by'
  | 'updated_from'
>

export type CategoryUpdateData = Partial<
  Pick<
    Category,
    'updated_by' | 'updated_from' | 'description' | 'icon_url' | 'cover_url' | 'status'
  >
>

export default Category
