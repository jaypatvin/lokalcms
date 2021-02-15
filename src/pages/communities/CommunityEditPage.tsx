import React, { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { fetchCommunityByID } from '../../services/community'
import CommunityCreateUpdateForm from './CommunityCreateUpdateForm'

type Props = {
  [x: string]: any
}

const CommunityEditPage = ({ match }: Props) => {
  const [community, setCommunity] = useState<any>()

  const normalizeCommunityData = (data: any) => {
    return {
      name: data.name,
      admin: data.admin,
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
    const communityRef: any = await fetchCommunityByID(id)
    let communityToEdit = communityRef.data()
    communityToEdit = { ...normalizeCommunityData(communityToEdit), id }
    setCommunity(communityToEdit)
  }

  useEffect(() => {
    if (match.path === '/communities/:id') {
      fetchCommunity(match.params.id)
    }
  }, [])

  console.log('community', community)

  return (
    <div className="container">
      {community && (
        <>
          <h2 className="text-3xl mb-3">Community Edit</h2>
          <CommunityCreateUpdateForm communityToUpdate={community} isModal={false} mode="update" />
        </>
      )}
    </div>
  )
}

export default CommunityEditPage
