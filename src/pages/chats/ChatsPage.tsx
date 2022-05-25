import React, { ChangeEventHandler, useEffect, useRef, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroller'
import { debounce } from 'lodash'
import { TextField } from '../../components/inputs'
import useOuterClick from '../../customHooks/useOuterClick'
import { getChatConversation, getChats, getConversationById } from '../../services/chats'
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
  const chatsLimit = 2
  const conversationsLimit = 2
  const { firebaseToken } = useAuth()
  const [user, setUser] = useState<UserData>()
  const [showUserSearchResult, setShowUserSearchResult] = useState(false)
  const userSearchResultRef = useOuterClick(() => setShowUserSearchResult(false))
  const [userSearchText, setUserSearchText] = useState('')
  const [userSearchResult, setUserSearchResult] = useState<UserData[]>([])
  const [userChats, setUserChats] = useState<ChatData[]>([])
  const [activeChat, setActiveChat] = useState<ChatData>()
  const [chatConversation, setChatConversation] = useState<ConversationData[]>([])
  const conversationScrollRef = useRef<any>()

  const [chatSearch, setChatSearch] = useState('')
  const [chatsPage, setChatsPage] = useState(0)
  const [chatsCount, setChatsCount] = useState(0)

  const [conversationsLoading, setConversationsLoading] = useState(false)
  const [conversationSearch, setConversationSearch] = useState('')
  const [conversationsPage, setConversationsPage] = useState(0)
  const [conversationsPages, setConversationsPages] = useState(0)
  const [conversationsCount, setConversationsCount] = useState(0)

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
    getUserChats(user).then((data) => {
      if (data) {
        setUserChats(data)
      }
    })
  }

  useEffect(() => {
    if (chatsPage !== 0) {
      setChatsPage(0)
    } else if (user) {
      getUserChats(user).then((data) => {
        if (data) {
          setUserChats(data)
        }
      })
    }
  }, [chatSearch, user])

  useEffect(() => {
    if (user) {
      getUserChats(user).then((data) => {
        if (data) {
          if (chatsPage === 0) {
            setUserChats(data)
          } else {
            setUserChats([...userChats, ...data])
          }
        }
      })
    }
  }, [chatsPage])

  useEffect(() => {
    if (conversationsPage !== 0) {
      setConversationsPage(0)
    } else if (activeChat) {
      fetchConversations(activeChat).then((data) => {
        if (data) {
          setChatConversation(data)
        }
      })
    }
  }, [conversationSearch, activeChat])

  useEffect(() => {
    if (user && activeChat) {
      fetchConversations(activeChat).then((data) => {
        if (data) {
          if (conversationsPage === 0) {
            setChatConversation(data)
          } else {
            setChatConversation([...chatConversation, ...data])
          }
        }
      })
    }
  }, [conversationsPage, activeChat])

  const getUserChats = async (user: UserData) => {
    if (!user || !firebaseToken) return
    const chatsResponse = await getChats(
      {
        search: chatSearch,
        filter: { chatType: 'all', archived: false },
        sort: { sortBy: 'updated_at', sortOrder: 'desc' },
        limit: chatsLimit,
        page: chatsPage,
        user: user.id,
      },
      firebaseToken
    )
    setChatsCount(chatsResponse!.totalItems)
    const newUserChats = chatsResponse!.data.map((chat) => ({
      ...chat,
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
    if (chatsPage === 0 && newUserChats.length) {
      const latestChat = newUserChats[0]
      setActiveChat(latestChat)
      fetchConversations(latestChat).then(setChatConversation)
    }
    return newUserChats
  }

  const showMore = () => {
    if (userChats.length < chatsCount) {
      setChatsPage(chatsPage + 1)
    }
  }

  const debouncedSearch = debounce((value: string) => {
    setChatSearch(value)
  }, 300)

  const debouncedConversationSearch = debounce((value: string) => {
    setConversationSearch(value)
  }, 300)

  const setupConversation = async (conversations: any, chat: ChatData) => {
    for (let i = 0; i < conversations.length; i++) {
      const message = conversations[i]
      const senderName = chat.membersInfo[message.sender_id]
        ? chat.membersInfo[message.sender_id].name
        : 'Unknown'
      message.sender_name = senderName
      if (message.reply_to) {
        const replyTo = await getConversationById(chat.id, message.reply_to._path.segments[3])
        const replyToData = replyTo.data()
        if (replyToData) {
          const sender_name = chat.membersInfo[replyToData.sender_id]
            ? chat.membersInfo[replyToData.sender_id].name
            : 'Unknown'
          message.reply_to_data = { ...replyToData, id: replyTo.id, sender_name }
        }
      }
    }
    return conversations
  }

  const fetchConversations = async (chat: ChatData) => {
    setConversationsLoading(true)
    const conversationResult = await getChatConversation(
      {
        chat: chat.id,
        search: conversationSearch,
        sort: { sortBy: 'created_at', sortOrder: 'desc' },
        limit: conversationsLimit,
        page: conversationsPage,
      },
      firebaseToken!
    )
    const newChatConversation = await setupConversation(conversationResult!.data, chat)
    setConversationsLoading(false)
    setConversationsCount(conversationResult?.totalItems!)
    setConversationsPages(conversationResult?.pages!)

    // setTimeout(() => {
    //   if (conversationScrollRef.current) {
    //     conversationScrollRef.current.scrollTop = conversationScrollRef.current.scrollHeight
    //   }
    // }, 500)

    return newChatConversation
  }

  const onSelectChat = (chat: ChatData) => {
    if (activeChat?.id === chat.id) return
    setActiveChat(chat)
    setChatConversation([])
    setConversationsCount(0)
    setConversationsPage(0)
    setConversationsPages(0)
    setConversationsLoading(true)
  }

  const onNextPage = debounce((p: number) => {
    if (activeChat && !conversationsLoading && conversationsPage < conversationsPages) {
      setConversationsPage(conversationsPage + 1)
    }
  }, 500)

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
            <div className="absolute top-full left-0 w-72 bg-white shadow z-20">
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
        <div className="w-1/3 h-full overflow-y-auto">
          {userChats.length ? (
            <div className="p-2 sticky top-0 left-0 z-10 bg-white">
              <TextField
                type="text"
                onChange={(e) => debouncedSearch(e.target.value)}
                placeholder="Search"
                size="small"
                noMargin
              />
              {userChats.length < chatsCount ? (
                <button className="text-xs text-primary-500" onClick={showMore}>
                  Show more
                </button>
              ) : (
                ''
              )}
            </div>
          ) : (
            ''
          )}
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
            <div className="p-2 sticky top-0 left-0 z-10 bg-white">
              <TextField
                type="text"
                onChange={(e) => debouncedConversationSearch(e.target.value)}
                placeholder="Search conversation"
                size="small"
                noMargin
              />
            </div>
            <InfiniteScroll
              className="flex flex-col-reverse p-5 bg-secondary-50 ml-2"
              pageStart={conversationsPage}
              loadMore={onNextPage}
              hasMore={chatConversation.length < conversationsCount}
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
      </div>
    </>
  )
}

export default ChatsPage
