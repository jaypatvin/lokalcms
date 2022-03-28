import React from 'react'

type Props = {
  title: string
  count: number
}
const MetaCard = ({ title, count }: Props) => {
  const cardTitle = title.toUpperCase()
  return (
    <div className="w-64 border-primary-600 border-solid border-1">
      <h3 className="p-3 bg-primary-600 text-white text-center text-xl">{cardTitle}</h3>
      <div className="relative w-full h-24">
        <p className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl">
          {count}
        </p>
      </div>
    </div>
  )
}

export default MetaCard
