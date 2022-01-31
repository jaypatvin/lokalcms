import dayjs from 'dayjs'

export const formatFirestoreDatesAgo = (date: firebase.default.firestore.Timestamp) => {
  let date_at_ago = '-'
  if (date) {
    const date_at = dayjs(date.toDate()).format()
    date_at_ago = dayjs(date_at).fromNow()
  }

  return date_at_ago
}
