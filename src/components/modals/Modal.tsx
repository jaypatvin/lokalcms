import { ReactNode } from 'react'
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
  title?: string
  isOpen: boolean
  setIsOpen?: (val: boolean) => void
  children?: ReactNode
  onSave?: () => Promise<void>
}

const Modal = ({ title, isOpen, children }: Props) => {
  return (
    <ReactModal isOpen={isOpen} style={customStyles}>
      <h2 className="text-2xl capitalize mb-5">{title}</h2>
      <div className="max-h-96 overflow-auto">{children}</div>
    </ReactModal>
  )
}

export default Modal
