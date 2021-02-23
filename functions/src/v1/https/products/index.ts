export const required_fields = [
  'name',
  'description',
  'shop_id',
  'base_price',
  'quantity',
  'product_category',
]

export { default as createProduct } from './createProduct'
export { default as updateProduct } from './updateProduct'
export { default as deleteProduct } from './deleteProduct'
export { default as getProduct } from './getProduct'
export { default as getProducts } from './getProducts'
export { default as getCommunityProducts } from './getCommunityProducts'
export { default as getUserProducts } from './getUserProducts'
