import React from 'react'
import { pick } from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import { storage } from '../../services/firebase'
import { CreateUpdateFormProps } from '../../utils/types'
import DynamicForm, { Field as DynamicField } from '../../components/DynamicForm'
import Modal from '../../components/modals'

const fields: DynamicField[] = [
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
    type: 'textarea',
    key: 'message',
    label: 'Message',
  },
  {
    type: 'gallery',
    key: 'images',
    label: 'Images',
  },
]

const ActivityCreateUpdateForm = ({
  isOpen = false,
  setIsOpen,
  mode = 'create',
  dataToUpdate,
}: CreateUpdateFormProps) => {
  const isUpdate = mode === 'update' && dataToUpdate
  const method = isUpdate ? 'PUT' : 'POST'
  const url = isUpdate ? `/activities/${dataToUpdate!.id}` : '/activities'
  const formFields = isUpdate
    ? fields.filter((field) => !['user_id', 'images'].includes(field.key))
    : fields
  const keys = formFields.map((field) => field.key).filter((key) => key)

  const transform = async (data: { [x: string]: unknown }) => {
    const gallery = data.images as any
    if (gallery && gallery.length) {
      for (const photo of gallery) {
        if (photo.file) {
          const uuid = uuidv4()
          const upload = await storage
            .ref(`/images/activities/${data.user_id ?? ''}_${uuid}`)
            .put(photo.file)
          photo.url = await upload.ref.getDownloadURL()
          delete photo.file
          delete photo.preview
        }
      }
    }
    return data
  }

  return (
    <Modal title={`${mode} Activity`} isOpen={isOpen}>
      <DynamicForm
        fields={formFields}
        formClassName="grid gap-2 p-3"
        cancelLabel="Close"
        method={method}
        url={url}
        data={isUpdate ? pick(dataToUpdate, keys) : undefined}
        onCancel={setIsOpen ? () => setIsOpen(false) : undefined}
        onSuccess={setIsOpen ? () => setIsOpen(false) : undefined}
        transformFormData={transform}
      />
    </Modal>
  )
}

export default ActivityCreateUpdateForm
