import React from 'react'
import { Shop } from '../../models'

type ShopData = Shop & { id: string; nextAvailable?: string; availableMessage?: string }
type Props = {
  shop: ShopData
  unavailable?: boolean
}

const DiscoverShop = ({ shop, unavailable }: Props) => {
  const { name, profile_photo, description, availableMessage } = shop
  return (
    <div className="w-80 p-3 shadow-lg m-3">
      <div className="w-full">
        {profile_photo ? (
          <img
            className={`w-full h-48 object-cover ${unavailable ? 'opacity-70' : ''}`}
            src={profile_photo}
            alt={description}
          />
        ) : (
          <div className="w-full h-48 bg-secondary-300"></div>
        )}
      </div>
      <p>
        <strong>{name}</strong>
      </p>
      <p>{description}</p>
      {availableMessage ? <p>Availability: {availableMessage}</p> : ''}
    </div>
  )
}

export default DiscoverShop
