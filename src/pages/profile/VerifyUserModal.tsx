import React, { useState } from 'react'
import { Button } from '../../components/buttons'
import { TextAreaField } from '../../components/inputs'
import ViewModal from '../../components/modals/ViewModal'
import { API_URL } from '../../config/variables'
import { useAuth } from '../../contexts/AuthContext'
import { UserData } from './ProfilePage'

type Props = {
  user: UserData
  show: boolean
  onClose: () => void
  setUser: (user: UserData) => void
}

const VerifyUserModal = ({ user, show, onClose, setUser }: Props) => {
  const { firebaseToken } = useAuth()
  const [notes, setNotes] = useState(user.registration.notes)
  const [showNotesError, setShowNotesError] = useState(false)
  const onCloseViewSubscriptions = () => {
    onClose()
  }

  const onUnverify = async () => {
    if (!notes) {
      setShowNotesError(true)
    } else if (API_URL && firebaseToken) {
      setShowNotesError(false)
      const { id } = user
      let url = `${API_URL}/users/${id}/unverify`
      const res = await (
        await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${firebaseToken}`,
          },
          method: 'PUT',
          body: JSON.stringify({ notes, source: 'cms' }),
        })
      ).json()
      console.log('res', res)
      setUser({ ...user, registration: { ...user.registration, notes, verified: false } })
      onClose()
    } else {
      console.error('environment variable for the api does not exist.')
    }
  }

  const onVerify = async () => {
    if (API_URL && firebaseToken) {
      setShowNotesError(false)
      const { id } = user
      let url = `${API_URL}/users/${id}/verify`
      const res = await (
        await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${firebaseToken}`,
          },
          method: 'PUT',
          body: JSON.stringify({ notes, source: 'cms' }),
        })
      ).json()
      console.log('res', res)
      setUser({ ...user, registration: { ...user.registration, notes, verified: true } })
      onClose()
    } else {
      console.error('environment variable for the api does not exist.')
    }
  }

  return (
    <ViewModal title={`Verify ${user.display_name}`} isOpen={show} close={onCloseViewSubscriptions}>
      <div className="mb-2">
        <p>{user.email}</p>
        {user.registration.id_photo ? (
          <>
            <p>ID type: {user.registration.id_type || '--'}</p>
            <img
              src={user.registration.id_photo}
              alt={user.registration.id_type}
              className="max-w-64 max-h-64 m-2"
            />
          </>
        ) : (
          <p className="italic">No ID photo</p>
        )}
      </div>
      <TextAreaField
        label="Notes"
        onChange={(e) => setNotes(e.target.value)}
        defaultValue={notes}
        isError={showNotesError}
        errorMessage="Notes required to unverify a user"
      />
      <div className="flex justify-end">
        <Button
          color="danger"
          onClick={onUnverify}
          disabled={!user.registration.verified && notes === user.registration.notes}
        >
          Unverify
        </Button>
        <Button
          color="primary"
          className="ml-3"
          onClick={onVerify}
          disabled={user.registration.verified && notes === user.registration.notes}
        >
          Verify
        </Button>
      </div>
    </ViewModal>
  )
}

export default VerifyUserModal
