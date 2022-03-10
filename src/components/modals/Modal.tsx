import { ReactNode, useState } from 'react'
import ReactModal from 'react-modal'
import { Button } from '../buttons'

ReactModal.setAppElement('#root')

const customStyles: ReactModal.Styles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    minWidth: '600px',
  },
}

type Props = {
  title?: string
  isOpen: boolean
  setIsOpen?: (val: boolean) => void
  children?: ReactNode
  onSave?: () => Promise<void>
}

const Modal = ({ title, isOpen, children, setIsOpen, onSave }: Props) => {
  const [isSaving, setIsSaving] = useState(false)
  const handleSave = async () => {
    setIsSaving(true)
    if (onSave) await onSave()
    setIsSaving(false)
  }
  const handleClose = () => {
    if (setIsOpen) setIsOpen(false)
  }

  return (
    <ReactModal isOpen={isOpen} style={customStyles}>
      <h2 className="text-2xl capitalize mb-5">{title}</h2>
      <div className="max-h-96 overflow-auto">{children}</div>
      {setIsOpen && onSave ? (
        <div className="flex justify-end mt-2">
          <Button color="secondary" onClick={handleClose}>
            close
          </Button>
          {onSave && (
            <Button
              color="primary"
              className="ml-3"
              onClick={handleSave}
              disabled={isSaving}
              loading={isSaving}
            >
              Save
            </Button>
          )}
        </div>
      ) : (
        ''
      )}
    </ReactModal>
  )
}

export default Modal
