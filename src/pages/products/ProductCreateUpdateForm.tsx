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
    key: 'shop_id',
    label: 'Shop ID',
    required: true,
    maxLength: 100,
    minLength: 1,
  },
  {
    type: 'categories',
    key: 'product_category',
    label: 'Category',
    required: true,
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
    type: 'number',
    key: 'base_price',
    label: 'Base Price',
    required: true,
    defaultValue: 1,
  },
  {
    type: 'integer',
    key: 'quantity',
    label: 'Quantity',
    required: true,
    defaultValue: 1,
  },
  {
    type: 'gallery',
    key: 'gallery',
    label: 'Gallery',
    required: true,
  },
]

const ProductCreateUpdateForm = ({
  isOpen = false,
  setIsOpen,
  mode = 'create',
  dataToUpdate,
}: CreateUpdateFormProps) => {
  const isUpdate = mode === 'update' && dataToUpdate
  const method = isUpdate ? 'PUT' : 'POST'
  const url = isUpdate ? `/products/${dataToUpdate!.id}` : '/products'
  const formFields = isUpdate ? fields.filter((field) => field.key !== 'shop_id') : fields
  const keys = formFields.map((field) => field.key).filter((key) => key)

  const transform = async (data: { [x: string]: unknown }) => {
    const gallery = data.gallery as any
    if (gallery && gallery.length) {
      for (const photo of gallery) {
        if (photo.file) {
          const uuid = uuidv4()
          const upload = await storage
            .ref(`/images/products/${data.id || data.shop_id}_${uuid}`)
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
    <Modal title={`${mode} Product`} isOpen={isOpen}>
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

export default ProductCreateUpdateForm
