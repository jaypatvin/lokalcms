const generateKeywords = (stringArr: string[]) => {
  const keywords = ['']
  stringArr.forEach((str) => {
    let currentKeyword = ''
    str
      .toLowerCase()
      .split('')
      .forEach((char) => {
        currentKeyword += char
        keywords.push(currentKeyword)
      })
  })
  return [...new Set(keywords)]
}

// ####### USER #######

type UserSearchFields = {
  first_name: string
  last_name: string
  display_name: string
  email: string
}

export const generateUserKeywords = (fields: UserSearchFields) => {
  const { first_name, last_name } = fields
  const searchValues = Object.values(fields)
  const full_name = `${first_name} ${last_name}`
  searchValues.push(full_name)
  return generateKeywords(searchValues)
}

// ####### COMMUNITY #######

type CommunitySearchFields = {
  name: string
  subdivision: string
  city: string
  barangay: string
  state: string
  country: string
  zip_code: string
}

export const generateCommunityKeywords = (fields: CommunitySearchFields) => {
  const searchValues = Object.values(fields)
  return generateKeywords(searchValues)
}

// ####### SHOP #######

type ShopSearchFields = {
  name: string
}

export const generateShopKeywords = (fields: ShopSearchFields) => {
  const searchValues = Object.values(fields)
  return generateKeywords(searchValues)
}

// ####### Product #######

type ProductSearchFields = {
  name: string
  product_category: string
}

export const generateProductKeywords = (fields: ProductSearchFields) => {
  const searchValues = Object.values(fields)
  return generateKeywords(searchValues)
}

// ####### Invite #######

type InviteSearchFields = {
  code: string
  invitee_email: string
}

export const generateInviteKeywords = (fields: InviteSearchFields) => {
  const searchValues = Object.values(fields)
  return generateKeywords(searchValues)
}
