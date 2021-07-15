import React from 'react'
import ReactCalendar from 'react-calendar'
import Modal from '../../components/modals'
import { isAvailableByDefault } from '../../utils/dates'

type Props = {
  isOpen: boolean
  setIsOpen: (val: boolean) => void
  shop: any
  onSelect: (date: Date) => void
  value?: Date
}

const SelectShopDateModal = ({ isOpen = false, setIsOpen, shop, onSelect, value }: Props) => {
  if (!shop) return null
  return (
    <Modal title="Select Date" isOpen={isOpen} setIsOpen={setIsOpen}>
      <ReactCalendar
        className="w-72"
        onChange={(date: any) => onSelect(date)}
        tileDisabled={({ date }: any) => !isAvailableByDefault(date, shop) || date < new Date()}
        calendarType="US"
        value={value}
      />
    </Modal>
  )
}

export default SelectShopDateModal
