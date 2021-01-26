import React from 'react'

const Avatar = (props) => {
  let {
    url=false,
    name="",
    statusColor=false,
    size=12,
    ...rest
  } = props

  const _url = (url !== false && url.length > 0) ? url : "https://eu.ui-avatars.com/api/?name=" + encodeURI(name) + "&size=100";
  let _borderWidth = Math.floor(size / 6);
  if (_borderWidth > 4) _borderWidth = 4;

  return (
    <div className={"relative w-" + size + " h-" + size} >
      <img className="rounded-full border border-gray-100 shadow-sm h-full w-auto" src={_url} alt="avatar" />
      { statusColor !== false ? (
        <div className={"absolute top-0 right-0 h-" + Math.floor(size / 4) + " w-" + Math.floor(size / 4) + " my-1 border-" + _borderWidth + " border-white rounded-full bg-" + statusColor + "-400 z-2"}></div>
      ) : null}
    </div>
  )
}

export default Avatar