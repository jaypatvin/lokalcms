import React from 'react'
import dayjs from 'dayjs'

type Props = {
  chat: any
  activeChat?: string
  onClick: (chat: any) => void
}

const ChatItem = ({ chat, activeChat, onClick }: Props) => {
  const last_message_at = dayjs(chat.last_message.created_at.toDate()).format()
  const last_message_at_ago = dayjs(last_message_at).fromNow()
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
      <span className="absolute right-2 top-2">{last_message_at_ago}</span>
    </div>
  )
}

export default ChatItem
