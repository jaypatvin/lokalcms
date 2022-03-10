import React from 'react'
import { pick } from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import { storage } from '../../services/firebase'
import { CreateUpdateFormProps } from '../../utils/types'
import DynamicForm, { Field as DynamicField } from '../../components/DynamicForm'
import Modal from '../../components/modals'

const fields: DynamicField[] = [
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
  },
  {
    type: 'image',
    key: 'icon_url',
    label: 'Icon',
  },
  {
    type: 'image',
    key: 'cover_url',
    label: 'Cover',
  },
]

const CategoryCreateUpdateForm = ({
  isOpen = false,
  setIsOpen,
  mode = 'create',
  dataToUpdate,
}: CreateUpdateFormProps) => {
  const isUpdate = mode === 'update' && dataToUpdate
  const method = isUpdate ? 'PUT' : 'POST'
  const url = isUpdate ? `/categories/${dataToUpdate!.id}` : '/categories'
  const formFields = isUpdate ? fields.filter((field) => !['name'].includes(field.key)) : fields
  const keys = formFields.map((field) => field.key).filter((key) => key)

  const transform = async (data: { [x: string]: unknown }) => {
    if (data.icon_url) {
      const uuid = uuidv4()
      const upload = await storage
        .ref(`/images/categories/icon-${data.name}_${uuid}`)
        .put(data.icon_url as File)
      data.icon_url = await upload.ref.getDownloadURL()
      // data.icon_url = 'https://ggsc.s3.amazonaws.com/images/uploads/The_Science-Backed_Benefits_of_Being_a_Dog_Owner.jpg'
    }
    if (data.cover_url) {
      const uuid = uuidv4()
      const upload = await storage
        .ref(`/images/categories/cover-${data.name}_${uuid}`)
        .put(data.cover_url as File)
      data.cover_url = await upload.ref.getDownloadURL()
      // data.cover_url = 'https://i.natgeofe.com/n/3861de2a-04e6-45fd-aec8-02e7809f9d4e/02-cat-training-NationalGeographic_1484324_3x4.jpg'
    }
    return data
  }

  return (
    <Modal title={`${mode} Category`} isOpen={isOpen}>
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

export default CategoryCreateUpdateForm
