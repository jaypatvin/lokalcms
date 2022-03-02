import React, { useEffect, useState } from 'react'
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
    type: 'blank',
    key: '',
    label: '',
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
    type: 'image',
    key: 'profile_photo',
    label: 'Profile Photo',
    required: false,
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
        <Modal title={`${mode} user`} isOpen={isOpen}>
          {children}
        </Modal>
      )
      setWrapperComponent(() => Component)
    } else {
      const Component = ({ children }: any) => <>{children}</>
      setWrapperComponent(() => Component)
    }
  }, [isModal, dataToUpdate, setIsOpen, isOpen, mode])

  if (!WrapperComponent) return null

  return (
    <WrapperComponent isOpen={isOpen}>
      <DynamicForm
        fields={fields}
        formClassName="grid grid-cols-2 gap-5 p-3"
        className="gap-y-5"
        cancelLabel="Close"
        method="POST"
        url="/users"
        onCancel={setIsOpen ? () => setIsOpen(false) : undefined}
      />
    </WrapperComponent>
  )
}

export default UserCreateUpdateForm
