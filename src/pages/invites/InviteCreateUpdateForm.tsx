import React from 'react'
import { pick } from 'lodash'
import { CreateUpdateFormProps } from '../../utils/types'
import DynamicForm, { Field as DynamicField } from '../../components/DynamicForm'
import Modal from '../../components/modals'
const humanPassword = require('human-password')

const fields: DynamicField[] = [
  {
    type: 'checkbox',
    key: 'claimed',
    label: 'Claimed',
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
    type: 'email',
    key: 'email',
    label: 'Invitee Email',
    required: true,
    maxLength: 100,
    minLength: 1,
  },
  {
    type: 'text',
    key: 'code',
    label: 'Code',
    required: true,
    maxLength: 100,
    minLength: 1,
  },
]

const InviteCreateUpdateForm = ({
  isOpen = false,
  setIsOpen,
  mode = 'create',
  dataToUpdate,
}: CreateUpdateFormProps) => {
  const isUpdate = mode === 'update' && dataToUpdate
  const method = isUpdate ? 'PUT' : 'POST'
  const url = isUpdate ? `/invite/${dataToUpdate!.id}` : '/invite'
  const formFields = isUpdate
    ? fields.filter((field) => !['email', 'code'].includes(field.key))
    : fields.filter((field) => !['status', 'claimed'].includes(field.key))
  const keys = formFields.map((field) => field.key).filter((key) => key)
  const code = humanPassword({ couples: 3, digits: 3 })
  const initialData = {
    code,
  }

  return (
    <Modal title={`${mode} Invite`} isOpen={isOpen}>
      <DynamicForm
        fields={formFields}
        formClassName="grid gap-2 p-3"
        cancelLabel="Close"
        method={method}
        url={url}
        data={isUpdate ? pick(dataToUpdate, keys) : initialData}
        onCancel={setIsOpen ? () => setIsOpen(false) : undefined}
        onSuccess={setIsOpen ? () => setIsOpen(false) : undefined}
      />
    </Modal>
  )
}

export default InviteCreateUpdateForm
