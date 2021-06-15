import dayjs from 'dayjs'
import React, { ChangeEventHandler, useState } from 'react'
import ReactLoading from 'react-loading'
import { TextField } from '../../components/inputs'
import useOuterClick from '../../customHooks/useOuterClick'
import { getChatConversation, getChats } from '../../services/chats'
import { fetchProductByID } from '../../services/products'
import { fetchShopByID } from '../../services/shops'
import { fetchUserByID, getUsers } from '../../services/users'

const ChatsPage = ({}) => {
  const [user, setUser] = useState<any>()
  const [showUserSearchResult, setShowUserSearchResult] = useState(false)
  const userSearchResultRef = useOuterClick(() => setShowUserSearchResult(false))
  const [userSearchText, setUserSearchText] = useState('')
  const [userSearchResult, setUserSearchResult] = useState<any>([])
  const [userChats, setUserChats] = useState<any[]>([])
  const [activeChat, setActiveChat] = useState<string>()
  const [chatConversation, setChatConversation] = useState<any[]>([])
  const [chatsSnapshot, setChatsSnapshot] = useState<{ unsubscribe: () => void }>()
  const [conversationSnapshot, setConversationSnapshot] = useState<{ unsubscribe: () => void }>()
  const [loading, setLoading] = useState(false)

  const userSearchHandler: ChangeEventHandler<HTMLInputElement> = async (e) => {
    console.log('e.target.value', e.target.value)
    setUserSearchText(e.target.value)
    if (e.target.value.length > 2) {
      const usersRef = getUsers({ search: e.target.value })
      const result = await usersRef.get()
      const users = result.docs.map((doc) => {
        const data = doc.data()
        return { ...data, id: doc.id }
      })
      setUserSearchResult(users)
      setShowUserSearchResult(users.length > 0)
    } else {
      setShowUserSearchResult(false)
      setUserSearchResult([])
    }
  }

  const userSelectHandler = (user: any) => {
    setShowUserSearchResult(false)
    setUserSearchResult([])
    setUser(user)
    setUserSearchText(user.email)
    getUserChats(user)
  }

  const getUserChats = async (user: any) => {
    if (!user) return
    setLoading(true)
    const chatsRef = getChats({ userId: user.id })
    if (chatsSnapshot && chatsSnapshot.unsubscribe) chatsSnapshot.unsubscribe() // unsubscribe current listener
    const newUnsubscribe = chatsRef.onSnapshot(async (snapshot) => {
      const newUserChats = snapshot.docs.map((doc): any => ({
        id: doc.id,
        ...doc.data(),
      }))
      for (let i = 0; i < newUserChats.length; i++) {
        const userChat = newUserChats[i]
        const { product_id, shop_id, members } = userChat
        const membersInfo: any = {}
        for (let j = 0; j < members.length; j++) {
          const memberId = members[j]
          if (product_id) {
            const product = await fetchProductByID(memberId)
            const data = product.data()
            if (data) membersInfo[memberId] = { name: data.name }
          }
          if (!membersInfo[memberId] && shop_id) {
            const shop = await fetchShopByID(memberId)
            const data = shop.data()
            if (data) membersInfo[memberId] = { name: data.name }
          }
          if (!membersInfo[memberId]) {
            const user = await fetchUserByID(memberId)
            const data = user.data()
            if (data) membersInfo[memberId] = { name: data.display_name }
          }
          if (!membersInfo[memberId]) {
            membersInfo[memberId] = { name: 'Unknown' }
          }
        }
        userChat.membersInfo = membersInfo
      }
      if (newUserChats.length) {
        const latestChat = newUserChats[0]
        onSelectChat(latestChat)
      }
      setUserChats(newUserChats)
    })
    setChatsSnapshot({ unsubscribe: newUnsubscribe })
    setLoading(false)
  }

  const onSelectChat = async (chat: any) => {
    if (activeChat === chat.id) return
    setActiveChat(chat.id)
    const conversationRef = getChatConversation({ chatId: chat.id })
    if (conversationSnapshot && conversationSnapshot.unsubscribe) conversationSnapshot.unsubscribe() // unsubscribe current listener
    const newUnsubscribe = conversationRef.onSnapshot(async (snapshot) => {
      const newChatConversation = snapshot.docs.map((doc): any => ({
        id: doc.id,
        ...doc.data(),
      }))
      for (let i = 0; i < newChatConversation.length; i++) {
        const message = newChatConversation[i]
        const senderName = chat.membersInfo[message.sender_id].name
        message.sender_name = senderName
        if (message.reply_to) {
          const replyTo = await message.reply_to.get()
          const replyToData = replyTo.data()
          replyToData.sender_name = chat.membersInfo[replyToData.sender_id]
            ? chat.membersInfo[replyToData.sender_id].name
            : 'Unknown'
          message.reply_to = replyToData
        }
      }
      setChatConversation(newChatConversation)
    })
    setConversationSnapshot({ unsubscribe: newUnsubscribe })
  }

  return (
    <>
      <h2 className="text-2xl font-semibold leading-tight">Chats</h2>
      <div className="flex items-center my-5 w-96">
        <div ref={userSearchResultRef} className="relative">
          <TextField
            label="User"
            type="text"
            size="small"
            placeholder="Search"
            onChange={userSearchHandler}
            value={userSearchText}
            onFocus={() => setShowUserSearchResult(userSearchResult.length > 0)}
          />
          {user ? (
            <p>
              Chats for user <strong>{user.display_name}</strong>
            </p>
          ) : (
            ''
          )}
          {showUserSearchResult && userSearchResult.length > 0 && (
            <div className="absolute top-full left-0 w-72 bg-white shadow z-10">
              {userSearchResult.map((user: any) => (
                <button
                  className="w-full p-1 hover:bg-gray-200 block text-left"
                  key={user.id}
                  onClick={() => userSelectHandler(user)}
                >
                  {user.display_name}
                  {user.display_name !== `${user.first_name} ${user.last_name}` ? (
                    <span className="block text-xs text-gray-500">{`${user.first_name} ${user.last_name}`}</span>
                  ) : (
                    ''
                  )}
                  <span className="block text-xs text-gray-500">{user.email}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex h-3/4-screen">
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
            <div className="w-1/3 h-full overflow-y-auto">
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
                      onClick={() => onSelectChat(chat)}
                    >
                      <h3 className="text-md pr-36 font-bold">{chat.title}</h3>
                      <p className="pl-2 text-secondary-600">{`${chat.last_message.sender}: ${chat.last_message.content}`}</p>
                      <span className="absolute right-2 top-2">{last_message_at_ago}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="w-2/3 h-full overflow-y-auto flex flex-col-reverse p-5 bg-secondary-50 ml-2">
              {chatConversation.map((doc) => {
                console.log('doc', doc)
                const sent_at = dayjs(doc.created_at.toDate()).format()
                const sent_at_ago = dayjs(sent_at).fromNow()
                let reply_to_at
                let reply_to_at_ago
                if (doc.reply_to) {
                  reply_to_at = dayjs(doc.reply_to.created_at.toDate()).format()
                  reply_to_at_ago = dayjs(reply_to_at).fromNow()
                }
                return (
                  <div
                    key={doc.id}
                    className={`${
                      doc.sender_id === user.id ? 'bg-teal-100 self-end' : 'bg-secondary-200'
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
                                className={`${
                                  doc.reply_to.media.length === 1 ? 'w-full' : 'w-1/2'
                                } p-1`}
                                key={item.order}
                                src={item.url}
                                alt={item.type}
                              />
                            ))}
                          </div>
                        ) : (
                          ''
                        )}
                        <span className="text-xs text-secondary-600 italic">{reply_to_at_ago}</span>
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
