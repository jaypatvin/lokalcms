export function setLocalStorage(name: string, value: string) {
  return localStorage.setItem(name, value)
}

export function getLocalStorage(name: string) {
  return localStorage.getItem(name)
}

export function removeLocalStorage(name: string) {
  return localStorage.removeItem(name)
}

const pesoFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'PHP',
})

export const formatToPeso = (val: number) => {
  return pesoFormatter.format(val)
}
