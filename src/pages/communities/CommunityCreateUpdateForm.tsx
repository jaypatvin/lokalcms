import React, { useEffect, useState } from 'react'
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
    type: 'image',
    key: 'profile_photo',
    label: 'Profile Photo',
  },
  {
    type: 'image',
    key: 'cover_photo',
    label: 'Cover Photo',
  },
  {
    type: 'text',
    key: 'subdivision',
    label: 'Subdivision',
    required: true,
    maxLength: 100,
    minLength: 1,
  },
  {
    type: 'text',
    key: 'city',
    label: 'City',
    required: true,
    maxLength: 100,
    minLength: 1,
  },
  {
    type: 'text',
    key: 'barangay',
    label: 'Barangay',
    required: true,
    maxLength: 100,
    minLength: 1,
  },
  {
    type: 'text',
    key: 'state',
    label: 'State',
    required: true,
    maxLength: 100,
    minLength: 1,
  },
  {
    type: 'text',
    key: 'country',
    label: 'Country',
    required: true,
    maxLength: 100,
    minLength: 1,
  },
  {
    type: 'text',
    key: 'zip_code',
    label: 'Zip Code',
    required: true,
    maxLength: 100,
    minLength: 1,
  },
]

const CommunityCreateUpdateForm = ({
  isOpen = false,
  setIsOpen,
  mode = 'create',
  dataToUpdate,
  isModal = true,
}: CreateUpdateFormProps) => {
  const [WrapperComponent, setWrapperComponent] = useState<any>()
  const isUpdate = mode === 'update' && dataToUpdate
  const method = isUpdate ? 'PUT' : 'POST'
  const url = isUpdate ? `/community/${dataToUpdate!.id}` : '/community'
  const keys = fields.map((field) => field.key)

  useEffect(() => {
    if (isModal && setIsOpen) {
      const Component = ({ children, isOpen }: any) => (
        <Modal title={`${mode} Community`} isOpen={isOpen}>
          {children}
        </Modal>
      )
      setWrapperComponent(() => Component)
    } else {
      const Component = ({ children }: any) => <>{children}</>
      setWrapperComponent(() => Component)
    }
  }, [isModal, dataToUpdate, setIsOpen, isOpen, mode])

  const transform = async (data: { [x: string]: unknown }) => {
    if (data.profile_photo) {
      const uuid = uuidv4()
      const upload = await storage
        .ref(`/images/communities/profile-${data.name}_${uuid}`)
        .put(data.profile_photo as File)
      data.profile_photo = await upload.ref.getDownloadURL()
      // data.profile_photo = 'https://ggsc.s3.amazonaws.com/images/uploads/The_Science-Backed_Benefits_of_Being_a_Dog_Owner.jpg'
    }
    if (data.cover_photo) {
      const uuid = uuidv4()
      const upload = await storage
        .ref(`/images/communities/cover-${data.name}_${uuid}`)
        .put(data.cover_photo as File)
      data.cover_photo = await upload.ref.getDownloadURL()
      // data.cover_photo = 'https://i.natgeofe.com/n/3861de2a-04e6-45fd-aec8-02e7809f9d4e/02-cat-training-NationalGeographic_1484324_3x4.jpg'
    }
    return data
  }

  if (!WrapperComponent) return null

  return (
    <WrapperComponent isOpen={isOpen}>
      <DynamicForm
        fields={fields}
        formClassName="grid gap-2 p-3"
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

export default CommunityCreateUpdateForm
