import { ChangeEvent, useEffect, useState } from 'react'
import { pick } from 'lodash'

type Props = {
  maximum?: number
  onChange: (data: Omit<Gallery, 'file' | 'preview'>) => void
  value?: Gallery
}

type Gallery = {
  url?: string
  order: number
  file?: File
  preview?: string
}[]

const GalleryField = ({ maximum = 5, onChange, value }: Props) => {
  const [gallery, setGallery] = useState<Gallery>(value ?? [])

  useEffect(() => {
    onChange(gallery.map((item) => pick(item, ['url', 'order', 'file'])))
  }, [gallery])

  const fileChangeHandler = (e: ChangeEvent<HTMLInputElement>, order: number) => {
    if (!e.target.files || e.target.files.length === 0) return
    const newGallery = [...gallery]
    const photo = newGallery.find((file) => file.order === order)
    if (photo) {
      photo.file = e.target.files[0]
      photo.preview = URL.createObjectURL(e.target.files[0])
    } else {
      newGallery.push({
        order,
        file: e.target.files[0],
        preview: URL.createObjectURL(e.target.files[0]),
      })
    }
    setGallery(newGallery)
  }

  const removePhotoHandler = (order: number) => {
    if (gallery.length) {
      setGallery(gallery.filter((photo) => photo.order !== order))
    }
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {[...Array(maximum)].map((x, i) => {
        let havePhoto = false
        let currentPhoto
        if (gallery && gallery.length) {
          currentPhoto = gallery.find((file) => file.order === i)
          if (currentPhoto && (currentPhoto.url || currentPhoto.preview)) havePhoto = true
        }
        return (
          <div key={i} className="w-40 h-40 relative">
            {havePhoto && (
              <button
                className="text-white absolute top-1 right-1 text-xs z-30 bg-danger-600 p-1"
                onClick={() => removePhotoHandler(i)}
              >
                X
              </button>
            )}
            <label
              htmlFor={`photo_${i}`}
              className="bg-black bg-opacity-25 text-white cursor-pointer h-full w-full flex items-center justify-center absolute top-0 left-0 text-4xl z-20 hover:bg-opacity-0 transition-all"
            >
              {i + 1}
            </label>
            <input
              id={`photo_${i}`}
              type="file"
              name={`photo_${i}`}
              onChange={(e) => fileChangeHandler(e, i)}
              className="hidden"
            />
            {havePhoto && (
              <img
                className="w-full h-full absolute top-0 left-0 z-10"
                src={
                  currentPhoto?.preview ||
                  currentPhoto?.url ||
                  'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='
                }
                alt={`#${currentPhoto?.order}`}
              />
            )}
            <span className=" bg-black bg-opacity-10 text-white h-full w-full flex items-center justify-center absolute top-0 left-0 text-4xl z-0">
              {i + 1}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default GalleryField
