export const required_fields = ['name', 'description', 'user_id', 'opening', 'closing']
export const hourFormat = /((1[0-2]|0?[1-9]):([0-5][0-9]) ?([AaPp][Mm]))/

export const timeFormatError = (field: string, time: string) => {
  return `Incorrect time format for field "${field}": "${time}". Please follow format "12:00 PM"`
}

export { default as createShop } from './createShop'
export { default as updateShop } from './updateShop'
export { default as deleteShop } from './deleteShop'
export { default as getShops } from './getShops'
export { default as getUserShops } from './getUserShops'
export { default as getCommunityShops } from './getCommunityShops'
export { default as getShopDetails } from './getShopDetails'
