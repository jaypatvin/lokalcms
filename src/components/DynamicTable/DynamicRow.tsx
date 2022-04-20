import React from 'react'
import DynamicCell from './DynamicCell'
import { Row } from './types'

type Props = {
  row: Row
}

const DynamicRow = ({ row }: Props) => {
  return (
    <tr>
      {row.map((cell, i) => (
        <DynamicCell key={i} cell={cell} />
      ))}
    </tr>
  )
}

export default DynamicRow
