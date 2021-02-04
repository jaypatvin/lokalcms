import React, { ReactNode } from 'react'
import ReactModal from 'react-modal'

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
}

const Modal = ({ title, isOpen, setIsOpen, children }: Props) => {
  return (
    <ReactModal isOpen={isOpen} style={customStyles}>
      <h2>{title}</h2>
      {children}
      <button onClick={() => setIsOpen(false)}>close</button>
    </ReactModal>
  )
}

export default Modal
