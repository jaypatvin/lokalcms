import { ChangeEvent, useEffect, useState } from 'react'

type Props = {
  onChange: (file?: File | string) => void
  value?: string
  name?: string
}

const ImageField = ({ onChange, value, name = 'image' }: Props) => {
  const [file, setFile] = useState<File | string>()
  const [preview, setPreview] = useState<string>()

  useEffect(() => {
    onChange(file)
  }, [file, preview])

  const fileChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    setFile(e.target.files[0])
    setPreview(URL.createObjectURL(e.target.files[0]))
  }

  const removePhotoHandler = () => {
    setFile('')
    setPreview(undefined)
  }

  return (
    <div className="w-40 h-40 relative">
      {(value || preview) && (
        <button
          type="button"
          className="text-white absolute top-1 right-1 text-xs z-30 bg-danger-600 p-1"
          onClick={() => removePhotoHandler()}
        >
          X
        </button>
      )}
      <label
        htmlFor={name}
        className="bg-black bg-opacity-25 text-white cursor-pointer h-full w-full flex items-center justify-center absolute top-0 left-0 text-4xl z-20 hover:bg-opacity-0 transition-all"
      >
        Image
      </label>
      <input
        id={name}
        type="file"
        name={name}
        onChange={(e) => fileChangeHandler(e)}
        className="hidden"
      />
      {(value || preview) && (
        <img
          className="w-full h-full absolute top-0 left-0 z-10"
          src={preview || value || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='}
          alt="alt"
        />
      )}
      <span className=" bg-black bg-opacity-10 text-white h-full w-full flex items-center justify-center absolute top-0 left-0 text-4xl z-0">
        Image
      </span>
    </div>
  )
}

export default ImageField
