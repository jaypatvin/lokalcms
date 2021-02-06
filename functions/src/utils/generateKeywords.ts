export const generateUserKeywords = (names: [string, string, string, string]) => {
    let [first, last, displayName, email] = names
    first = first.toLowerCase()
    last = last.toLowerCase()
    const keywords = ['']
    let currentKeyword = ''
    first.split('').forEach(letter => {
        currentKeyword += letter
        keywords.push(currentKeyword)
    })
    currentKeyword = ''
    last.split('').forEach(letter => {
        currentKeyword += letter
        keywords.push(currentKeyword)
    })
    currentKeyword = ''
    const fullname = `${first} ${last}`
    fullname.split('').forEach(letter => {
        currentKeyword += letter
        keywords.push(currentKeyword)
    })
    currentKeyword = ''
    displayName.split('').forEach(letter => {
        currentKeyword += letter
        keywords.push(currentKeyword)
    })
    currentKeyword = ''
    email.split('').forEach(letter => {
        currentKeyword += letter
        keywords.push(currentKeyword)
    })

    return [ ...new Set(keywords) ]
}