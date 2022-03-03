import React from 'react'
import { pick } from 'lodash'
import { CreateUpdateFormProps } from '../../utils/types'
import DynamicForm, { Field as DynamicField } from '../../components/DynamicForm'
import Modal from '../../components/modals'

const fields: DynamicField[] = [
  {
    type: 'checkbox',
    key: 'is_close',
    label: 'Is Close',
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
        id: 'enabled',
        name: 'Enabled',
      },
      {
        id: 'disabled',
        name: 'Disabled',
      },
    ],
  },
  {
    type: 'text',
    key: 'user_id',
    label: 'User ID',
    required: true,
    maxLength: 100,
    minLength: 1,
  },
  {
    type: 'text',
    key: 'name',
    label: 'Name',
    required: true,
    maxLength: 100,
    minLength: 1,
  },
  {
    type: 'textarea',
    key: 'description',
    label: 'Description',
    required: true,
    maxLength: 255,
    minLength: 1,
  },
  {
    type: 'schedule',
    key: 'operating_hours',
    label: 'Operating Hours',
    required: true,
  },
]

const UserCreateUpdateForm = ({
  isOpen = false,
  setIsOpen,
  mode = 'create',
  dataToUpdate,
}: CreateUpdateFormProps) => {
  const isUpdate = mode === 'update' && dataToUpdate
  const method = isUpdate ? 'PUT' : 'POST'
  const url = isUpdate ? `/shops/${dataToUpdate!.id}` : '/shops'
  const formFields = isUpdate ? fields.filter((field) => field.key !== 'user_id') : fields
  const keys = formFields.map((field) => field.key).filter((key) => key)

  return (
    <Modal title={`${mode} Shop`} isOpen={isOpen}>
      <DynamicForm
        fields={formFields}
        formClassName="grid gap-2 p-3"
        cancelLabel="Close"
        method={method}
        url={url}
        data={isUpdate ? pick(dataToUpdate, keys) : undefined}
        onCancel={setIsOpen ? () => setIsOpen(false) : undefined}
      />
    </Modal>
  )
}

export default UserCreateUpdateForm
