import React, { useEffect, useState } from 'react'
import { Community } from '../../models'
import { fetchCommunityByID } from '../../services/community'
import CommunityCreateUpdateForm from './CommunityCreateUpdateForm'

type Props = {
  [x: string]: any
}

type CommunityFormType = {
  id?: string
  name?: string
  cover_photo?: string
  profile_photo?: string
  subdivision?: string
  city?: string
  barangay?: string
  state?: string
  country?: string
  zip_code?: string
  admins?: string[]
}

const CommunityEditPage = ({ match }: Props) => {
  const [community, setCommunity] = useState<CommunityFormType>()

  const normalizeCommunityData = (data: Community) => {
    return {
      name: data.name,
      admins: data.admins,
      profile_photo: data.profile_photo,
      cover_photo: data.cover_photo,
      subdivision: data.address.subdivision,
      city: data.address.city,
      barangay: data.address.barangay,
      state: data.address.state,
      country: data.address.country,
      zip_code: data.address.zip_code,
    }
  }

  const fetchCommunity = async (id: string) => {
    const communityRef = await fetchCommunityByID(id)
    const communityToEdit = communityRef.data()
    if (communityToEdit) {
      setCommunity({ ...normalizeCommunityData(communityToEdit), id })
    }
  }

  useEffect(() => {
    if (match.path === '/communities/:id/edit') {
      fetchCommunity(match.params.id)
    }
  }, [])

  return (
    <div className="container">
      {community && (
        <>
          <h2 className="text-3xl mb-3">Community Edit</h2>
          <CommunityCreateUpdateForm dataToUpdate={community} isModal={false} mode="update" />
        </>
      )}
    </div>
  )
}

export default CommunityEditPage
