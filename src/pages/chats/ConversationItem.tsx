import dayjs from 'dayjs'
import { Conversation, User } from '../../models'

type UserData = User & { id: string }
type ConversationData = Conversation & {
  id: string
  sender_name: string
  reply_to_data?: ConversationData
}
type Props = {
  doc: ConversationData
  currentUser: UserData
}

const ConversationItem = ({ doc, currentUser }: Props) => {
  const sentAt = dayjs(doc.created_at.toDate()).format()
  const sentAtAgo = dayjs(sentAt).fromNow()
  let replyToAt
  let replyToAtAgo
  if (doc.reply_to_data) {
    replyToAt = dayjs(doc.reply_to_data.created_at.toDate()).format()
    replyToAtAgo = dayjs(replyToAt).fromNow()
  }
  return (
    <div
      key={doc.id}
      className={`${
        doc.sender_id === currentUser.id ? 'bg-teal-100 self-end' : 'bg-secondary-200'
      } mb-2 p-2 shadow rounded max-w-max`}
    >
      {doc.reply_to_data ? (
        <div className="opacity-80 p-2 mb-2 border-l-4 border-secondary-500">
          <p className="text-sm font-bold italic">{doc.reply_to_data.sender_name}</p>
          <p className="text-sm italic">{doc.reply_to_data.message}</p>
          {doc.reply_to_data.media &&
          doc.reply_to_data.media.length &&
          doc.reply_to_data.media[0].type === 'image' ? (
            <div className="flex w-96 flex-wrap">
              {doc.reply_to_data.media.map((item) => (
                <img
                  className={`${doc.reply_to_data?.media?.length === 1 ? 'w-full' : 'w-1/2'} p-1`}
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
          {doc.media.map((item) => (
            <img
              className={`${doc.media?.length === 1 ? 'w-full' : 'w-1/2'} p-1`}
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
