// from https://stackoverflow.com/questions/25104442/hashing-array-of-strings-in-javascript
const charsum = (str: string) => {
  let sum = 0
  for (let i = 0; i < str.length; i++) {
    sum += str.charCodeAt(i) * (i + 1)
  }
  return sum
}

const hashArrayOfStrings = (arrayOfStrings: string[]) => {
  let sum = 0
  let product = 1
  for (let i = 0; i < arrayOfStrings.length; i++) {
    const cs = charsum(arrayOfStrings[i])
    if (product % cs > 0) {
      product = product * cs
      sum = sum + 65027 / cs
    }
  }
  return ('' + sum).slice(0, 16).replace('.', '')
}

export default hashArrayOfStrings
