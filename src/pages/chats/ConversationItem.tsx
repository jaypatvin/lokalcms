import dayjs from 'dayjs'

type Props = {
  doc: any
  currentUser: any
}

const ConversationItem = ({ doc, currentUser }: Props) => {
  const sentAt = dayjs(doc.created_at.toDate()).format()
  const sentAtAgo = dayjs(sentAt).fromNow()
  let replyToAt
  let replyToAtAgo
  if (doc.reply_to) {
    replyToAt = dayjs(doc.reply_to.created_at.toDate()).format()
    replyToAtAgo = dayjs(replyToAt).fromNow()
  }
  return (
    <div
      key={doc.id}
      className={`${
        doc.sender_id === currentUser.id ? 'bg-teal-100 self-end' : 'bg-secondary-200'
      } mb-2 p-2 shadow rounded max-w-max`}
    >
      {doc.reply_to ? (
        <div className="opacity-80 p-2 mb-2 border-l-4 border-secondary-500">
          <p className="text-sm font-bold italic">{doc.reply_to.sender_name}</p>
          <p className="text-sm italic">{doc.reply_to.message}</p>
          {doc.reply_to.media &&
          doc.reply_to.media.length &&
          doc.reply_to.media[0].type === 'image' ? (
            <div className="flex w-96 flex-wrap">
              {doc.reply_to.media.map((item: any) => (
                <img
                  className={`${doc.reply_to.media.length === 1 ? 'w-full' : 'w-1/2'} p-1`}
                  key={item.order}
                  src={item.url}
                  alt={item.type}
                />
              ))}
            </div>
          ) : (
            ''
          )}
          <span className="text-xs text-secondary-600 italic">{replyToAtAgo}</span>
        </div>
      ) : (
        ''
      )}
      <p className="text-sm font-bold">{doc.sender_name}</p>
      <p className="text-sm">{doc.message}</p>
      {doc.media && doc.media.length && doc.media[0].type === 'image' ? (
        <div className="flex w-96 flex-wrap">
          {doc.media.map((item: any) => (
            <img
              className={`${doc.media.length === 1 ? 'w-full' : 'w-1/2'} p-1`}
              key={item.order}
              src={item.url}
              alt={item.type}
            />
          ))}
        </div>
      ) : (
        ''
      )}
      <span className="text-xs text-secondary-600">{sentAtAgo}</span>
    </div>
  )
}

export default ConversationItem
