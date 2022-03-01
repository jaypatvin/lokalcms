import React, { useEffect, useState } from 'react'
import { CreateUpdateFormProps } from '../../utils/types'
import DynamicForm, { Field as DynamicField } from '../../components/DynamicForm'
import Modal from '../../components/modals'

const fields: DynamicField[] = [
  {
    type: 'dropdown',
    key: 'status',
    label: 'Status',
    required: false,
    enum: ['active', 'suspended', 'pending', 'locked'],
  },
  {
    type: 'checkbox',
    key: 'is_admin',
    label: 'Admin',
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

  // const changeHandler = (field: Field, value: string | boolean) => {
  //   const newData = { ...data }
  //   if (
  //     field === 'status' &&
  //     (value === 'active' || value === 'suspended' || value === 'pending' || value === 'locked')
  //   ) {
  //     newData.status = value
  //   } else if (
  //     (field === 'email' ||
  //       field === 'first_name' ||
  //       field === 'last_name' ||
  //       field === 'display_name' ||
  //       field === 'profile_photo' ||
  //       field === 'street') &&
  //     typeof value === 'string'
  //   ) {
  //     newData[field] = value
  //   } else if (field === 'is_admin' && typeof value === 'boolean') {
  //     newData.is_admin = value
  //   }
  //   setData(newData)
  // }

  if (!WrapperComponent) return null

  return (
    <WrapperComponent isOpen={isOpen}>
      {/* <div className="flex justify-between mb-3">
        <Dropdown
          name="status"
          simpleOptions={['active', 'suspended', 'pending', 'locked']}
          currentValue={data.status}
          size="small"
          onSelect={(option) => changeHandler('status', option.value as string)}
          buttonColor={statusColorMap[data.status || 'enabled']}
        />
        <Checkbox
          label="Admin"
          onChange={(e) => changeHandler('is_admin', e.target.checked)}
          noMargin
          value={data.is_admin || false}
        />
      </div> */}
      <DynamicForm
        fields={fields}
        formClassName="grid grid-cols-2 gap-5"
        className="gap-y-5"
        cancelLabel="Close"
        method="POST"
        url="/users"
      />
    </WrapperComponent>
  )
}

export default UserCreateUpdateForm
