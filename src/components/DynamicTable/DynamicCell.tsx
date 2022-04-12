import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ReactCalendar from 'react-calendar'
import dayjs from 'dayjs'
import { isNil, isEmpty, isObject } from 'lodash'
import { Button } from '../buttons'
import useOuterClick from '../../customHooks/useOuterClick'
import ViewModal from '../modals/ViewModal'
import { Cell, ContextMenu } from './types'
import { useCommunities } from '../BasePage'
import { fetchUserByID } from '../../services/users'
import { OutlineButton } from '../../components/buttons'
import getAvailabilitySummary from '../../utils/dates/getAvailabilitySummary'
import getCalendarTileClassFn from '../../utils/dates/getCalendarTileClassFn'
import { fetchShopByID } from '../../services/shops'
import { formatToPeso } from '../../utils/helper'

type Props = {
  cell: Cell
}

type Gallery = {
  url: string
  order: number
}[]

const DynamicCell = ({ cell }: Props) => {
  const communities = useCommunities()

  // menu cell
  const [isOptionsOpen, setIsOptionsOpen] = useState(false)

  // reference cell
  const [referenceValue, setReferenceValue] = useState<string>()

  // image cell
  const [imageModalOpen, setImageModalOpen] = useState(false)

  // calendar cell
  const [showCalendar, setShowCalendar] = useState(false)
  const calendarRef = useOuterClick(() => setShowCalendar(false))
  const optionsRef = useOuterClick(() => setIsOptionsOpen(false))

  // gallery cell
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const getReferenceValue = async () => {
    if (cell.collection === 'community') {
      const data = communities.find((community) => community.id === cell.value)
      if (data) {
        // @ts-ignore
        setReferenceValue(data[cell.referenceField!])
      }
    } else if (cell.collection === 'users') {
      const data = await (await fetchUserByID(cell.value as string)).data()
      if (data) {
        // @ts-ignore
        setReferenceValue(data[cell.referenceField!])
      }
    } else if (cell.collection === 'shops') {
      const data = await (await fetchShopByID(cell.value as string)).data()
      if (data) {
        // @ts-ignore
        setReferenceValue(data[cell.referenceField!])
      }
    } else {
      setReferenceValue(cell.value as string)
    }
  }

  useEffect(() => {
    if (cell.type === 'reference') {
      getReferenceValue()
    }
  }, [cell])

  if (isNil(cell.value) || (isObject(cell.value) && isEmpty(cell.value)) || cell.value === '') {
    return (
      <td>
        <p className="text-gray-900 whitespace-no-wrap">--</p>
      </td>
    )
  }

  switch (cell.type) {
    case 'string':
    case 'number':
      return (
        <td>
          {cell.referenceLink ? (
            <Link
              className="text-primary-600 hover:text-primary-400 whitespace-no-wrap"
              to={cell.referenceLink}
            >
              {(cell.value as string) ?? '--'}
            </Link>
          ) : (
            <p className="text-gray-900 whitespace-no-wrap">{(cell.value as string) ?? '--'}</p>
          )}
        </td>
      )
    case 'currency':
      return (
        <td>
          <p className="text-gray-900 whitespace-no-wrap">{formatToPeso(cell.value as number)}</p>
        </td>
      )
    case 'boolean':
      return (
        <td>
          <p
            className={`text-gray-900 whitespace-no-wrap ${
              cell.value === true ? 'text-primary-600' : ''
            } ${cell.value === false ? 'text-danger-600' : ''}`}
          >
            {(cell.value as boolean).toString() ?? '--'}
          </p>
        </td>
      )
    case 'reference':
      let basePath = ''
      if (cell.collection === 'community') {
        basePath = '/communities'
      } else {
        basePath = cell.collection ?? ''
      }
      return (
        <td>
          <div className="flex items-center">
            {referenceValue ? (
              <Link to={`${basePath}/${cell.value}`}>
                <p className="text-primary-600 hover:text-primary-400 ml-2">{referenceValue}</p>
              </Link>
            ) : (
              <p className="text-gray-900 whitespace-no-wrap">--</p>
            )}
          </div>
        </td>
      )
    case 'datepast':
      let dateAt = cell.value ? dayjs((cell.value as any).toDate()).format() : null
      return (
        <td>
          <p className="text-gray-900 whitespace-no-wrap">
            {dateAt ? dayjs(dateAt).fromNow() : '--'}
          </p>
        </td>
      )
    case 'datefuture':
      let dateBy = cell.value ? dayjs(cell.value as any).fromNow() : null
      return (
        <td>
          <p className="text-gray-900 whitespace-no-wrap">{dateBy ?? '--'}</p>
        </td>
      )
    case 'image':
      return (
        <td>
          <ViewModal isOpen={imageModalOpen} close={() => setImageModalOpen(false)}>
            <div className="relative h-full">
              <img
                src={cell.value as string}
                alt={cell.value as string}
                className="max-w-full max-h-full"
              />
            </div>
          </ViewModal>
          <button
            type="button"
            className="border-none bg-none"
            onClick={() => setImageModalOpen(true)}
          >
            <img
              src={cell.value as string}
              alt={cell.value as string}
              className="max-w-16 max-h-16"
            />
          </button>
        </td>
      )
    case 'gallery':
      const gallery = cell.value as Gallery
      const galleryLength = gallery.length
      const isFirst = currentImageIndex === 0
      const isLast = currentImageIndex === galleryLength - 1

      return (
        <td>
          <ViewModal isOpen={imageModalOpen} close={() => setImageModalOpen(false)}>
            <div className="relative h-full">
              <Button
                className="absolute top-1/2 left-0 -translate-y-1/2 opacity-60 hover:opacity-100"
                icon="arrowBack"
                size="small"
                color="secondary"
                onClick={() =>
                  setCurrentImageIndex(isFirst ? galleryLength - 1 : currentImageIndex - 1)
                }
              />
              <Button
                className="absolute top-1/2 right-0 -translate-y-1/2 opacity-60 hover:opacity-100"
                icon="arrowForward"
                size="small"
                color="secondary"
                onClick={() => setCurrentImageIndex(isLast ? 0 : currentImageIndex + 1)}
              />
              <img src={gallery[currentImageIndex].url} alt="" className="max-w-full max-h-full" />
            </div>
          </ViewModal>
          <button
            type="button"
            className="border-none bg-none w-24 flex flex-wrap justify-around gap-1 text-primary-600 hover:text-primary-400"
            onClick={() => setImageModalOpen(true)}
          >
            {gallery.slice(0, 3).map((image) => (
              <img
                src={image.url as string}
                alt=""
                className={galleryLength === 1 ? 'max-w-full max-h-full' : 'w-11'}
              />
            ))}
            {galleryLength > 3 ? <span>{galleryLength - 3} more</span> : ''}
          </button>
        </td>
      )
    case 'menu':
      return (
        <td className="action-col">
          <div ref={optionsRef} className="relative">
            <button
              onClick={() => setIsOptionsOpen(!isOptionsOpen)}
              type="button"
              className="inline-block text-gray-500 hover:text-gray-700"
            >
              <svg className="inline-block h-6 w-6 fill-current" viewBox="0 0 24 24">
                <path d="M12 6a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4zm-2 6a2 2 0 104 0 2 2 0 00-4 0z" />
              </svg>
            </button>
            {isOptionsOpen ? (
              <div className="absolute top-0 right-full shadow w-36 bg-white">
                {(cell.value as ContextMenu).map((item) => (
                  <button
                    key={item.title}
                    onClick={() => {
                      if (item.onClick) item.onClick()
                      setIsOptionsOpen(false)
                    }}
                    className={`block w-full p-2 hover:bg-gray-100 ${
                      item.type === 'danger' ? 'text-danger-600' : ''
                    } ${item.type === 'warning' ? 'text-warning-600' : ''}`}
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            ) : (
              ''
            )}
          </div>
        </td>
      )
    case 'schedule':
      return (
        <td ref={calendarRef} className="relative">
          <p className="text-gray-900 whitespace-no-wrap flex">
            <OutlineButton
              className="h-8 text-primary-500 mr-1"
              size="small"
              icon="calendar"
              onClick={() => setShowCalendar(!showCalendar)}
            />
            {getAvailabilitySummary(cell.value)}
          </p>
          {showCalendar && (
            <div className="w-64 absolute z-10 shadow">
              <ReactCalendar
                tileClassName={getCalendarTileClassFn(cell.value)}
                onChange={() => null}
                calendarType="US"
              />
            </div>
          )}
        </td>
      )
    default:
      return (
        <td>
          <p className="text-gray-900 whitespace-no-wrap">--</p>
        </td>
      )
  }
}

export default DynamicCell
