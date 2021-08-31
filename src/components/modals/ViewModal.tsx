import React, { ReactNode } from 'react'
import ReactModal from 'react-modal'

ReactModal.setAppElement('#root')

const customStyles: ReactModal.Styles = {
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
  title: string
  isOpen: boolean
  close?: () => void
  children: ReactNode
}

const ViewModal = ({ title, isOpen, close, children }: Props) => (
  <ReactModal isOpen={isOpen} style={customStyles}>
    <h2 className="text-2xl capitalize mb-5 mr-5">{title}</h2>
    <button className="border-none text-danger-500 bg-none absolute top-2 right-2" onClick={close}>
      X
    </button>
    {children}
  </ReactModal>
)

export default ViewModal
