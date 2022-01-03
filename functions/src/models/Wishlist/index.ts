type Wishlist = {
  user_id: string
  created_at: FirebaseFirestore.Timestamp
  shop_id: string
  product_id: string
  community_id: string
}

export type WishlistCreateData = Pick<Wishlist, 'shop_id' | 'community_id'>

export default Wishlist
