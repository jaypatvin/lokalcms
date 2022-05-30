import React from 'react'

type Props = {
  url?: string
  name?: string
  statusColor?: string
  size?: number
}

const Avatar = ({ url, name = '', statusColor, size = 12 }: Props) => {
  const _url =
    url && url.length > 0
      ? url
      : 'https://eu.ui-avatars.com/api/?name=' + encodeURI(name) + '&size=100'
  let _borderWidth = Math.floor(size / 6)
  if (_borderWidth > 4) _borderWidth = 4

  return (
    <div className={'relative w-' + size + ' h-' + size}>
      <img
        className="rounded-full border border-gray-100 shadow-sm h-full w-full"
        src={_url}
        alt="avatar"
      />
      {statusColor && statusColor.length ? (
        <div
          className={
            'absolute top-0 right-0 h-' +
            Math.floor(size / 4) +
            ' w-' +
            Math.floor(size / 4) +
            ' my-1 border-' +
            _borderWidth +
            ' border-white rounded-full bg-' +
            statusColor +
            '-400 z-2'
          }
        ></div>
      ) : null}
    </div>
  )
}

export default Avatar
