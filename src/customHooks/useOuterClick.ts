import { useRef, useEffect } from 'react'

const useOuterClick = (callback = (e: any) => {}) => {
  const callbackRef = useRef((e: any) => {})
  const innerRef = useRef<any>()

  useEffect(() => {
    callbackRef.current = callback
  })

  useEffect(() => {
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
    function handleClick(e: any) {
      if (innerRef.current && callbackRef.current && !innerRef.current.contains(e.target)) {
        callbackRef.current(e)
      }
    }
  }, [])

  return innerRef
}

export default useOuterClick
