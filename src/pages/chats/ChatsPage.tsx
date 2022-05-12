import React, { ChangeEventHandler, useRef, useState } from 'react'
import ReactLoading from 'react-loading'
import InfiniteScroll from 'react-infinite-scroller'
import { TextField } from '../../components/inputs'
import useOuterClick from '../../customHooks/useOuterClick'
import { getChatConversation, getChats } from '../../services/chats'
import { fetchProductByID } from '../../services/products'
import { fetchShopByID } from '../../services/shops'
import { fetchUserByID, getUsers } from '../../services/users'
import ChatItem from './ChatItem'
import ConversationItem from './ConversationItem'
import { Chat, Conversation, User } from '../../models'
import { useAuth } from '../../contexts/AuthContext'

type UserData = User & { id: string }
type MembersInfo = { [x: string]: { name: string } }
type ChatData = Chat & { id: string; membersInfo: MembersInfo }
type ConversationData = Conversation & {
  id: string
  sender_name: string
  reply_to_data?: ConversationData
}

const ChatsPage = () => {
  const { firebaseToken } = useAuth()
  const [user, setUser] = useState<UserData>()
  const [showUserSearchResult, setShowUserSearchResult] = useState(false)
  const userSearchResultRef = useOuterClick(() => setShowUserSearchResult(false))
  const [userSearchText, setUserSearchText] = useState('')
  const [userSearchResult, setUserSearchResult] = useState<UserData[]>([])
  const [userChats, setUserChats] = useState<ChatData[]>([])
  const [activeChat, setActiveChat] = useState<ChatData>()
  const [chatConversation, setChatConversation] = useState<ConversationData[]>([])
  const [chatsSnapshot, setChatsSnapshot] = useState<{ unsubscribe: () => void }>()
  const [conversationSnapshot, setConversationSnapshot] = useState<{ unsubscribe: () => void }>()
  const [loading, setLoading] = useState(false)
  const [pageNum, setPageNum] = useState(1)
  const [conversationRef, setConversationRef] = useState<firebase.default.firestore.Query<Conversation>>()
  const [lastDataOnList, setLastDataOnList] =
    useState<firebase.default.firestore.QueryDocumentSnapshot<Conversation>>()
  const [isLastPage, setIsLastPage] = useState(false)
  const conversationScrollRef = useRef<any>()

  const userSearchHandler: ChangeEventHandler<HTMLInputElement> = async (e) => {
    setUserSearchText(e.target.value)
    if (e.target.value.length > 2) {
      const users = (await getUsers({ search: e.target.value }, firebaseToken!))!.data
      setUserSearchResult(users)
      setShowUserSearchResult(users.length > 0)
    } else {
      setShowUserSearchResult(false)
      setUserSearchResult([])
    }
  }

  const userSelectHandler = (user: UserData) => {
    setShowUserSearchResult(false)
    setUserSearchResult([])
    setUser(user)
    setUserSearchText(user.email)
    getUserChats(user)
  }

  const getUserChats = async (user: UserData) => {
    if (!user) return
    setLoading(true)
    const chatsRef = getChats({ userId: user.id })
    if (chatsSnapshot && chatsSnapshot.unsubscribe) chatsSnapshot.unsubscribe() // unsubscribe current listener
    const newUnsubscribe = chatsRef.onSnapshot(async (snapshot) => {
      const newUserChats = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        membersInfo: {} as MembersInfo,
      }))
      for (let i = 0; i < newUserChats.length; i++) {
        const userChat = newUserChats[i]
        const { product_id, shop_id, members } = userChat
        const membersInfo: MembersInfo = {}
        for (let j = 0; j < members.length; j++) {
          const memberId = members[j]
          if (product_id) {
            const product = await fetchProductByID(memberId)
            const data = product.data()
            if (data) {
              membersInfo[memberId] = { name: data.name }
              membersInfo[data.user_id] = { name: data.name }
            }
          }
          if (!membersInfo[memberId] && shop_id) {
            const shop = await fetchShopByID(memberId)
            const data = shop.data()
            if (data) {
              membersInfo[memberId] = { name: data.name }
              membersInfo[data.user_id] = { name: data.name }
            }
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

  const setupConversation = async (
    docs: firebase.default.firestore.QueryDocumentSnapshot<Conversation>[],
    chat: ChatData
  ) => {
    const newChatConversation = docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ConversationData[]
    for (let i = 0; i < newChatConversation.length; i++) {
      const message = newChatConversation[i]
      const senderName = chat.membersInfo[message.sender_id]
        ? chat.membersInfo[message.sender_id].name
        : 'Unknown'
      message.sender_name = senderName
      if (message.reply_to) {
        const replyTo = await message.reply_to.get()
        const replyToData = replyTo.data()
        if (replyToData) {
          const sender_name = chat.membersInfo[replyToData.sender_id]
            ? chat.membersInfo[replyToData.sender_id].name
            : 'Unknown'
          message.reply_to_data = { ...replyToData, id: replyTo.id, sender_name }
        }
      }
    }
    return newChatConversation
  }

  const onSelectChat = async (chat: ChatData) => {
    if (activeChat?.id === chat.id) return
    setIsLastPage(false)
    setActiveChat(chat)
    setChatConversation([])
    const conversationRef = getChatConversation({ chatId: chat.id })
    if (conversationSnapshot && conversationSnapshot.unsubscribe) conversationSnapshot.unsubscribe() // unsubscribe current listener
    const newUnsubscribe = conversationRef.onSnapshot(async (snapshot) => {
      const newChatConversation = await setupConversation(snapshot.docs, chat)
      setLastDataOnList(snapshot.docs[snapshot.docs.length - 1])
      setChatConversation(newChatConversation)
      setTimeout(() => {
        if (conversationScrollRef.current) {
          conversationScrollRef.current.scrollTop = conversationScrollRef.current.scrollHeight
        }
      }, 500)
    })
    setConversationSnapshot({ unsubscribe: newUnsubscribe })
    setConversationRef(conversationRef)
  }

  const onNextPage = (p: number) => {
    if (activeChat && conversationRef && lastDataOnList && !isLastPage) {
      const newDataRef = conversationRef.startAfter(lastDataOnList).limit(10)
      newDataRef.onSnapshot(async (snapshot) => {
        if (snapshot.docs.length) {
          const moreChatConversation = await setupConversation(snapshot.docs, activeChat)
          const newChatConversation = [...chatConversation, ...moreChatConversation]
          setChatConversation(newChatConversation)
          setLastDataOnList(snapshot.docs[snapshot.docs.length - 1])
          setPageNum(p + 1)
        } else if (!isLastPage) {
          setIsLastPage(true)
        }
      })
    }
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
          {showUserSearchResult && userSearchResult.length > 0 && (
            <div className="absolute top-full left-0 w-72 bg-white shadow z-10">
              {userSearchResult.map((user) => (
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
          {user ? (
            <p>
              Chats for user <strong>{user.display_name}</strong>
            </p>
          ) : (
            ''
          )}
        </div>
      </div>
      <div className="flex h-2/3-screen">
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
              {userChats.map((chat) => (
                <ChatItem
                  key={chat.id}
                  chat={chat}
                  activeChat={activeChat?.id}
                  onClick={onSelectChat}
                />
              ))}
            </div>
            {chatConversation && chatConversation.length > 0 ? (
              <div ref={conversationScrollRef} className="w-2/3 h-full overflow-y-auto">
                <InfiniteScroll
                  className="flex flex-col-reverse p-5 bg-secondary-50 ml-2"
                  pageStart={pageNum}
                  loadMore={onNextPage}
                  hasMore={!isLastPage}
                  useWindow={false}
                  isReverse={true}
                  threshold={10}
                >
                  {chatConversation.map((doc) => (
                    <ConversationItem key={doc.id} doc={doc} currentUser={user!} />
                  ))}
                </InfiniteScroll>
              </div>
            ) : (
              ''
            )}
          </>
        )}
      </div>
    </>
  )
}

export default ChatsPage
