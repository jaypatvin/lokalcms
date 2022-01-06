const invalid_values = [null, undefined, '']

export const validateValue = (val: any) => {
  return !invalid_values.includes(val)
}

const validateFields = (data: any, required_fields: string[]) => {
  const error_fields = []

  required_fields.forEach((field) => {
    if (!validateValue(data[field])) error_fields.push(field)
  })

  return error_fields
}

export default validateFields
