import dayjs from 'dayjs'
import React, { useState } from 'react'
import ReactLoading from 'react-loading'
import { Button } from '../../components/buttons'
import { TextField } from '../../components/inputs'
import { getChatConversation, getChats } from '../../services/chats'

const ChatsPage = ({}) => {
  const [user, setUser] = useState<string>()
  const [userChats, setUserChats] = useState<any[]>([])
  const [activeChat, setActiveChat] = useState<string>()
  const [chatConversation, setChatConversation] = useState<any[]>([])
  const [chatsSnapshot, setChatsSnapshot] = useState<{ unsubscribe: () => void }>()
  const [conversationSnapshot, setConversationSnapshot] = useState<{ unsubscribe: () => void }>()
  const [loading, setLoading] = useState(false)

  const getUserChats = async () => {
    if (!user) return
    setLoading(true)
    const chatsRef = getChats({ userId: user })
    if (chatsSnapshot && chatsSnapshot.unsubscribe) chatsSnapshot.unsubscribe() // unsubscribe current listener
    const newUnsubscribe = chatsRef.onSnapshot(async (snapshot) => {
      const newUserChats = snapshot.docs.map((doc): any => ({
        id: doc.id,
        ...doc.data(),
      }))
      setUserChats(newUserChats)
    })
    setChatsSnapshot({ unsubscribe: newUnsubscribe })
    const chats = getChats({ userId: user })
    const chatsDocs = await chats.get()
    const newUserChats = chatsDocs.docs.map((doc): any => ({ id: doc.id, ...doc.data() }))
    if (newUserChats.length) {
      const latestChat = newUserChats[0]
      const conversationRef = getChatConversation({ chatId: latestChat.id })
      if (conversationSnapshot && conversationSnapshot.unsubscribe)
        conversationSnapshot.unsubscribe() // unsubscribe current listener
      const newUnsubscribe = conversationRef.onSnapshot(async (snapshot) => {
        const newChatConversation = snapshot.docs.map((doc): any => ({
          id: doc.id,
          ...doc.data(),
        }))
        setChatConversation(newChatConversation)
      })
      setConversationSnapshot({ unsubscribe: newUnsubscribe })
      setActiveChat(latestChat.id)
    }
    setUserChats(newUserChats)
    setLoading(false)
  }

  const onSelectChat = async (chatId: string) => {
    if (activeChat === chatId) return
    setActiveChat(chatId)
    const conversation = getChatConversation({ chatId })
    const conversationDocs = await conversation.get()
    const newChatConversation = conversationDocs.docs.map((doc): any => ({
      id: doc.id,
      ...doc.data(),
    }))
    setChatConversation(newChatConversation)
  }

  return (
    <>
      <h2 className="text-2xl font-semibold leading-tight">Chats</h2>
      <div className="flex items-center my-5 w-96">
        <TextField
          required
          label="User"
          type="text"
          size="small"
          onChange={(e) => setUser(e.target.value)}
        />
        <Button type="button" className="ml-2" onClick={getUserChats}>
          Apply
        </Button>
      </div>
      <div className="flex">
        {loading ? (
          <div className="h-96 w-full relative">
            <ReactLoading
              type="spin"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              color="gray"
            />
          </div>
        ) : (
          <>
            <div className="w-1/3">
              <div className="">
                {userChats.map((chat) => {
                  const last_message_at = dayjs(chat.last_message.created_at.toDate()).format()
                  const last_message_at_ago = dayjs(last_message_at).fromNow()
                  return (
                    <div
                      key={chat.id}
                      className={`${
                        activeChat === chat.id ? 'bg-teal-100' : 'hover:bg-teal-50'
                      } mb-2 p-2 shadow bg-secondary-100 rounded relative`}
                      onClick={() => onSelectChat(chat.id)}
                    >
                      <h3 className="text-lg pr-36">{chat.title}</h3>
                      <p className="pl-2 text-secondary-600">{`${chat.last_message.sender}: ${chat.last_message.content}`}</p>
                      <span className="absolute right-1 top-1">{last_message_at_ago}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="w-2/3 flex flex-col-reverse p-5 bg-secondary-50 ml-2">
              {chatConversation.map((doc) => {
                const sent_at = dayjs(doc.created_at.toDate()).format()
                const sent_at_ago = dayjs(sent_at).fromNow()
                return (
                  <div
                    key={doc.id}
                    className={`${
                      doc.sender_id === user ? 'bg-teal-100 self-end' : 'bg-secondary-200'
                    } mb-2 p-2 shadow rounded max-w-max`}
                  >
                    <p className="text-sm font-bold">{doc.sender_id}</p>
                    <p className="text-sm">{doc.message}</p>
                    <span className="text-xs text-secondary-600">{sent_at_ago}</span>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default ChatsPage
