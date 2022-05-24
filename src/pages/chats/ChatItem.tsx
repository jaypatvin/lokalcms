import dayjs from 'dayjs'
import { Chat } from '../../models'

type MembersInfo = { [x: string]: { name: string } }
type ChatData = Chat & { id: string; membersInfo: MembersInfo }
type Props = {
  chat: ChatData
  activeChat?: string
  onClick: (chat: ChatData) => void
}

const ChatItem = ({ chat, activeChat, onClick }: Props) => {
  const lastMessage = dayjs(chat.last_message.created_at as any).format()
  const lastMessageAgo = dayjs(lastMessage).fromNow()
  return (
    <div
      key={chat.id}
      className={`${
        activeChat === chat.id ? 'bg-teal-100' : 'hover:bg-teal-50'
      } mb-2 p-2 shadow bg-secondary-100 rounded relative`}
      onClick={() => onClick(chat)}
    >
      <h3 className="text-md pr-36 font-bold">{chat.title}</h3>
      <p className="pl-2 text-secondary-600">{`${chat.last_message.sender}: ${chat.last_message.content}`}</p>
      <span className="absolute right-2 top-2">{lastMessageAgo}</span>
    </div>
  )
}

export default ChatItem
