import React, { useEffect, useState } from 'react'
import { ActionType } from '../../models'
import { getActionTypes } from '../../services/actionTypes'
import { getAppMeta } from '../../services/meta'

type Meta = {
  id: string
  count: number
}

const DashboardPage = ({}) => {
  const [metadata, setMetadata] = useState<Meta[]>([])
  const [isNextLevel, setIsNextLevel] = useState(false)
  const [actionTypes, setActionTypes] = useState<ActionType[]>([])

  useEffect(() => {
    getAppMeta()
      .get()
      .then((data) => data.docs.map((doc) => ({ id: doc.id, count: doc.data().count })))
      .then((data) => setMetadata(data))
  }, [])

  const clickHandler = (id: string) => {
    setIsNextLevel(true)
    if (id === 'action_types') {
      getActionTypes()
        .get()
        .then((data) => data.docs.map((doc) => doc.data()))
        .then((data) => setActionTypes(data))
    }
  }

  return (
    <div className="">
      {isNextLevel
        ? actionTypes.map((actionType) => (
            <button type="button" className="border-none bg-none text-primary-600 block">
              {actionType.name}
            </button>
          ))
        : metadata.map((m) => (
            <button
              type="button"
              className="border-none bg-none text-primary-600 block"
              onClick={() => clickHandler(m.id)}
            >
              {m.id}: {m.count}
            </button>
          ))}
    </div>
  )
}

export default DashboardPage
