import React, { ReactNode } from 'react'
import ReactModal from 'react-modal'
import { Button } from '../buttons'

ReactModal.setAppElement('#root')

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
}

type Props = {
  title?: string
  isOpen: boolean
  setIsOpen: (val: boolean) => void
  children?: ReactNode
  onSave?: () => void
}

const Modal = ({ title, isOpen, setIsOpen, children, onSave }: Props) => {
  const handleSave = () => {
    if (onSave) onSave()
  }
  return (
    <ReactModal isOpen={isOpen} style={customStyles}>
      <h2 className="text-2xl capitalize mb-5">{title}</h2>
      {children}
      <div className="flex justify-end">
        <Button color='secondary' onClick={() => setIsOpen(false)}>close</Button>
        {onSave && <Button color='primary' className='ml-3' onClick={handleSave}>Save</Button>}
      </div>
    </ReactModal>
  )
}

export default Modal
