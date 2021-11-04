export const validateImages = (images: any) => {
  let errorMessages = []
  if (!Array.isArray(images)) {
    errorMessages.push('Images is not an array of type object: {url: string, order: number}')
  }

  if (images.length) {
    for (let [i, g] of images.entries()) {
      if (!g.url) {
        errorMessages.push(`Missing image url for item ${i}`)
      }

      if (!isFinite(g.order)) {
        errorMessages.push(`order is not a type of number for item ${i}`)
      }
    }
  }
  return {
    errorMessages,
    valid: errorMessages.length === 0,
  }
}
