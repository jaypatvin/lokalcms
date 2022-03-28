import React, { useEffect, useState } from 'react'
import { getAppMeta } from '../../services/meta'
import MetaCard from './MetaCard'

type Meta = {
  id: string
  count: number
}

const metaFields = [
  'activities',
  'chats',
  'community',
  'invites',
  'orders',
  'product_subscription_plans',
  'products',
  'shops',
  'users',
]

const DashboardPage = ({}) => {
  const [metadata, setMetadata] = useState<Meta[]>([])

  useEffect(() => {
    getAppMeta()
      .get()
      .then((data) =>
        data.docs
          .filter((doc) => metaFields.includes(doc.id))
          .map((doc) => ({
            id: doc.id.replace('product_subscription_plans', 'subscriptions'),
            count: doc.data().count,
          }))
      )
      .then((data) => setMetadata(data))
  }, [])

  return (
    <div className="grid grid-cols-5 gap-5">
      {metadata.map(({ id, count }) => (
        <MetaCard key={id} title={id} count={count} />
      ))}
    </div>
  )
}

export default DashboardPage
