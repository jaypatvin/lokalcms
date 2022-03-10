import React, { useState } from 'react'
import Modal from '../../components/modals'
import { TextAreaField } from '../inputs'

type Props = {
  title: string
  isOpen: boolean
  setIsOpen: (val: boolean) => void
  onSave: any
  value?: string
}

const TextModal = ({ title, isOpen = false, setIsOpen, value = '', onSave }: Props) => {
  const [text, setText] = useState(value)
  const handleSave: any = () => {
    onSave(text)
    setText('')
    setIsOpen(false)
  }

  return (
    <Modal title={title} isOpen={isOpen} setIsOpen={setIsOpen} onSave={() => handleSave(text)}>
      <TextAreaField
        className="border-1 p-2 w-full"
        value={text}
        onChange={(e) => setText(e.target.value)}
      ></TextAreaField>
    </Modal>
  )
}

export default TextModal
