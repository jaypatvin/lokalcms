export function setLocalStorage(name: string, value: string) {
  return localStorage.setItem(name, value)
}

export function getLocalStorage(name: string) {
  return localStorage.getItem(name)
}

export function removeLocalStorage(name: string) {
  return localStorage.removeItem(name)
}
