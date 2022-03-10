import React, { useEffect, useState } from 'react'
import { pick } from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import { storage } from '../../services/firebase'
import { CreateUpdateFormProps } from '../../utils/types'
import DynamicForm, { Field as DynamicField } from '../../components/DynamicForm'
import Modal from '../../components/modals'

const fields: DynamicField[] = [
  {
    type: 'checkbox',
    key: 'is_admin',
    label: 'Admin',
    required: false,
    defaultValue: false,
  },
  {
    type: 'dropdown',
    key: 'status',
    label: 'Status',
    required: false,
    options: [
      {
        id: 'active',
        name: 'Active',
      },
      {
        id: 'suspended',
        name: 'Suspended',
      },
      {
        id: 'pending',
        name: 'Pending',
      },
      {
        id: 'locked',
        name: 'Locked',
      },
    ],
  },
  {
    type: 'image',
    key: 'profile_photo',
    label: 'Profile Photo',
    required: false,
  },
  {
    type: 'community',
    key: 'community_id',
    label: 'Community',
    required: true,
  },
  {
    type: 'email',
    key: 'email',
    label: 'Email',
    required: true,
    maxLength: 100,
    minLength: 1,
  },
  {
    type: 'text',
    key: 'first_name',
    label: 'First Name',
    required: true,
    maxLength: 100,
    minLength: 1,
  },
  {
    type: 'text',
    key: 'last_name',
    label: 'Last Name',
    required: true,
    maxLength: 100,
    minLength: 1,
  },
  {
    type: 'text',
    key: 'display_name',
    label: 'Display Name',
    required: false,
    maxLength: 100,
    minLength: 1,
  },
  {
    type: 'text',
    key: 'street',
    label: 'Street',
    required: true,
    maxLength: 100,
    minLength: 1,
  },
]

const UserCreateUpdateForm = ({
  isOpen = false,
  setIsOpen,
  mode = 'create',
  dataToUpdate,
  isModal = true,
}: CreateUpdateFormProps) => {
  const [WrapperComponent, setWrapperComponent] = useState<any>()

  useEffect(() => {
    if (isModal && setIsOpen) {
      const Component = ({ children, isOpen }: any) => (
        <Modal title={`${mode} User`} isOpen={isOpen}>
          {children}
        </Modal>
      )
      setWrapperComponent(() => Component)
    } else {
      const Component = ({ children }: any) => <>{children}</>
      setWrapperComponent(() => Component)
    }
  }, [isModal, dataToUpdate, setIsOpen, isOpen, mode])

  const isUpdate = mode === 'update' && dataToUpdate
  const method = isUpdate ? 'PUT' : 'POST'
  const url = isUpdate ? `/users/${dataToUpdate!.id}` : '/users'
  const formFields = isUpdate ? fields.filter((field) => field.key !== 'community_id') : fields
  const keys = formFields.map((field) => field.key).filter((key) => key)

  const transform = async (data: { [x: string]: unknown }) => {
    if (data.profile_photo) {
      const uuid = uuidv4()
      const upload = await storage.ref(`/images/users/${uuid}`).put(data.icon_url as File)
      data.profile_photo = await upload.ref.getDownloadURL()
    }
    return data
  }

  if (!WrapperComponent) return null

  return (
    <WrapperComponent isOpen={isOpen}>
      <DynamicForm
        fields={formFields}
        formClassName="grid gap-2 p-3"
        className="gap-y-5"
        cancelLabel="Close"
        method={method}
        url={url}
        data={isUpdate ? pick(dataToUpdate, keys) : undefined}
        onCancel={setIsOpen ? () => setIsOpen(false) : undefined}
        onSuccess={setIsOpen ? () => setIsOpen(false) : undefined}
        transformFormData={transform}
      />
    </WrapperComponent>
  )
}

export default UserCreateUpdateForm
