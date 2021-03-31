import React from 'react'
import { PageNames } from '../../utils/types'
import UserCreateUpdateForm from '../../pages/users/UserCreateUpdateForm'
import CommunityCreateUpdateForm from '../../pages/communities/CommunityCreateUpdateForm'
import InviteCreateUpdateForm from '../../pages/invites/InviteCreateUpdateForm'
import ShopCreateUpdateForm from '../../pages/shops/ShopCreateUpdateForm'
import ProductCreateUpdateForm from '../../pages/products/ProductCreateUpdateForm'
import CategoryCreateUpdateForm from '../../pages/categories/CategoryCreateUpdateForm'
import ActivityCreateUpdateForm from '../../pages/activities/ActivityCreateUpdateForm'

type Props = {
  name: PageNames
  isOpen?: boolean
  setIsOpen: (val: boolean) => void
  mode?: 'create' | 'update'
  dataToUpdate?: any
  isModal?: boolean
}

const CreateUpdateForm = ({
  name,
  isOpen = false,
  setIsOpen,
  mode = 'create',
  dataToUpdate,
  isModal = true,
}: Props) => {
  let FormComponent = null

  switch (name) {
    case 'users':
      FormComponent = UserCreateUpdateForm
      break
    case 'communities':
      FormComponent = CommunityCreateUpdateForm
      break
    case 'invites':
      FormComponent = InviteCreateUpdateForm
      break
    case 'shops':
      FormComponent = ShopCreateUpdateForm
      break
    case 'products':
      FormComponent = ProductCreateUpdateForm
      break
    case 'categories':
      FormComponent = CategoryCreateUpdateForm
      break
    case 'activities':
      FormComponent = ActivityCreateUpdateForm
      break
    default:
      break
  }

  if (!FormComponent) return null
  return (
    <FormComponent
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      dataToUpdate={dataToUpdate}
      mode={mode}
      isModal={isModal}
    />
  )
}

export default CreateUpdateForm
