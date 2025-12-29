'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Search,
  Send,
  MoreVertical,
  Phone,
  Video,
  Image,
  Paperclip,
  Smile,
  Loader2,
  MessageCircle,
  Users,
  UserPlus,
  Check,
  X,
  ArrowLeft,
  UserMinus,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/hooks/useLanguage'
import { useToast } from '@/hooks/use-toast'
import {
  getUserChats,
  getChatMessages,
  sendMessage,
  markMessagesAsRead,
  clearChat,
  deleteChat,
  createChat,
  getFriends,
  getIncomingFriendRequests,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
  searchUsers,
  sendFriendRequest,
  getFriendStatus,
} from '@/lib/firebase/firestore'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { getInitials, formatRelativeTime } from '@/lib/utils'
import type { Chat, Message, Friendship, FriendRequest, User } from '@/types'

const EMOJI_LIST = ['😀', '😊', '😂', '🤣', '😍', '🥰', '😘', '😎', '🤔', '😢', '😭', '😡', '👍', '👎', '👏', '🙌', '🎉', '❤️', '💯', '🔥', '✨', '⭐', '📚', '✏️', '📝', '💡', '🎓', '👨‍🏫', '👩‍🏫', '📖']

export default function MessagesPage() {
  const { user } = useAuth()
  const { language } = useLanguage()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const chatIdFromUrl = searchParams.get('chat')

  // Chats state
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [clearDialogOpen, setClearDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  // Friends state
  const [friends, setFriends] = useState<Friendship[]>([])
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])
  const [friendsLoading, setFriendsLoading] = useState(true)

  // User search state
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [friendStatuses, setFriendStatuses] = useState<Record<string, string>>({})

  // Remove friend dialog
  const [removeFriendDialog, setRemoveFriendDialog] = useState<{ open: boolean; friendshipId: string; friendName: string }>({ open: false, friendshipId: '', friendName: '' })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const txt = {
    ru: {
      title: 'Сообщения',
      chats: 'Чаты',
      friends: 'Друзья',
      requests: 'Запросы',
      searchPlaceholder: 'Поиск...',
      searchUsers: 'Найти пользователей...',
      online: 'В сети',
      offline: 'Не в сети',
      writeMessage: 'Написать сообщение...',
      loginRequired: 'Войдите, чтобы просматривать сообщения',
      noChats: 'У вас пока нет чатов',
      noChatsDescription: 'Добавьте друзей, чтобы начать общение',
      noFriends: 'У вас пока нет друзей',
      noFriendsDescription: 'Найдите и добавьте других преподавателей',
      noRequests: 'Нет запросов в друзья',
      noRequestsDescription: 'Здесь будут отображаться входящие запросы',
      selectChat: 'Выберите чат',
      selectChatDescription: 'Выберите чат из списка слева',
      clearChat: 'Очистить чат',
      deleteChat: 'Удалить чат',
      clearChatTitle: 'Очистить историю?',
      clearChatDesc: 'Все сообщения будут удалены.',
      deleteChatTitle: 'Удалить чат?',
      deleteChatDesc: 'Чат и все сообщения будут удалены.',
      cancel: 'Отмена',
      clear: 'Очистить',
      delete: 'Удалить',
      chatCleared: 'Чат очищен',
      chatDeleted: 'Чат удалён',
      sendMessage: 'Написать',
      addFriend: 'Добавить',
      requestSent: 'Запрос отправлен',
      accept: 'Принять',
      decline: 'Отклонить',
      requestAccepted: 'Запрос принят',
      requestDeclined: 'Запрос отклонён',
      removeFriend: 'Удалить из друзей',
      removeFriendTitle: 'Удалить из друзей?',
      removeFriendDesc: 'Вы уверены, что хотите удалить этого пользователя из друзей?',
      friendRemoved: 'Удалён из друзей',
      pending: 'Ожидание',
      noResults: 'Ничего не найдено',
    },
    kk: {
      title: 'Хабарламалар',
      chats: 'Чаттар',
      friends: 'Достар',
      requests: 'Сұраулар',
      searchPlaceholder: 'Іздеу...',
      searchUsers: 'Пайдаланушыларды табу...',
      online: 'Желіде',
      offline: 'Желіде емес',
      writeMessage: 'Хабарлама жазу...',
      loginRequired: 'Хабарламаларды көру үшін кіріңіз',
      noChats: 'Сізде әлі чаттар жоқ',
      noChatsDescription: 'Сөйлесуді бастау үшін достар қосыңыз',
      noFriends: 'Сізде әлі достар жоқ',
      noFriendsDescription: 'Басқа оқытушыларды тауып, қосыңыз',
      noRequests: 'Достық сұраулары жоқ',
      noRequestsDescription: 'Мұнда кіріс сұраулар көрсетіледі',
      selectChat: 'Чат таңдаңыз',
      selectChatDescription: 'Сол жақтағы тізімнен чатты таңдаңыз',
      clearChat: 'Чатты тазалау',
      deleteChat: 'Чатты жою',
      clearChatTitle: 'Тарихты тазалау керек пе?',
      clearChatDesc: 'Барлық хабарламалар жойылады.',
      deleteChatTitle: 'Чатты жою керек пе?',
      deleteChatDesc: 'Чат және барлық хабарламалар жойылады.',
      cancel: 'Болдырмау',
      clear: 'Тазалау',
      delete: 'Жою',
      chatCleared: 'Чат тазаланды',
      chatDeleted: 'Чат жойылды',
      sendMessage: 'Жазу',
      addFriend: 'Қосу',
      requestSent: 'Сұрау жіберілді',
      accept: 'Қабылдау',
      decline: 'Қабылдамау',
      requestAccepted: 'Сұрау қабылданды',
      requestDeclined: 'Сұрау қабылданбады',
      removeFriend: 'Достардан жою',
      removeFriendTitle: 'Достардан жою керек пе?',
      removeFriendDesc: 'Бұл пайдаланушыны достардан жойғыңыз келетініне сенімдісіз бе?',
      friendRemoved: 'Достардан жойылды',
      pending: 'Күтуде',
      noResults: 'Ештеңе табылмады',
    },
  }

  const text = txt[language]

  // Load user's chats
  useEffect(() => {
    const loadChats = async () => {
      if (!user) return

      try {
        const userChats = await getUserChats(user.id)
        setChats(userChats)

        if (chatIdFromUrl) {
          const chatFromUrl = userChats.find(c => c.id === chatIdFromUrl)
          if (chatFromUrl) {
            setSelectedChat(chatFromUrl)
          } else if (userChats.length > 0 && !selectedChat) {
            setSelectedChat(userChats[0])
          }
        } else if (userChats.length > 0 && !selectedChat) {
          setSelectedChat(userChats[0])
        }
      } catch (error) {
        console.error('Error loading chats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadChats()
    const interval = setInterval(loadChats, 30000)
    return () => clearInterval(interval)
  }, [user, chatIdFromUrl])

  // Load friends and requests
  useEffect(() => {
    const loadFriendsData = async () => {
      if (!user) return

      try {
        const [friendsList, requestsList] = await Promise.all([
          getFriends(user.id),
          getIncomingFriendRequests(user.id),
        ])
        setFriends(friendsList)
        setFriendRequests(requestsList)
      } catch (error) {
        console.error('Error loading friends:', error)
      } finally {
        setFriendsLoading(false)
      }
    }

    loadFriendsData()
  }, [user])

  // Load messages when chat is selected
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedChat || !user) return

      try {
        const chatMessages = await getChatMessages(selectedChat.id)
        setMessages(chatMessages)
        await markMessagesAsRead(selectedChat.id, user.id)
      } catch (error) {
        console.error('Error loading messages:', error)
      }
    }

    loadMessages()
    const interval = setInterval(loadMessages, 5000)
    return () => clearInterval(interval)
  }, [selectedChat, user])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Search users
  useEffect(() => {
    const searchUsersDebounced = async () => {
      if (!userSearchQuery.trim() || userSearchQuery.length < 2) {
        setSearchResults([])
        return
      }

      setIsSearching(true)
      try {
        const results = await searchUsers(userSearchQuery)
        // Filter out current user
        const filtered = results.filter(u => u.id !== user?.id)
        setSearchResults(filtered)

        // Get friend status for each result
        if (user) {
          const statuses: Record<string, string> = {}
          for (const u of filtered) {
            const status = await getFriendStatus(user.id, u.id)
            statuses[u.id] = status
          }
          setFriendStatuses(statuses)
        }
      } catch (error) {
        console.error('Error searching users:', error)
      } finally {
        setIsSearching(false)
      }
    }

    const timer = setTimeout(searchUsersDebounced, 500)
    return () => clearTimeout(timer)
  }, [userSearchQuery, user])

  const filteredChats = chats.filter(chat => {
    if (!user) return false
    const otherUserId = chat.participants.find(id => id !== user.id)
    const otherUserData = otherUserId ? chat.participantsData[otherUserId] : null
    return otherUserData?.name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !user || isSending) return

    setIsSending(true)
    try {
      await sendMessage(selectedChat.id, user.id, newMessage.trim())
      setNewMessage('')
      const chatMessages = await getChatMessages(selectedChat.id)
      setMessages(chatMessages)
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsSending(false)
    }
  }

  const handleStartChat = async (friendUserId: string, friendName: string, friendAvatar: string | null) => {
    if (!user) return

    try {
      const chatId = await createChat(
        user.id,
        user.displayName,
        user.avatar,
        friendUserId,
        friendName,
        friendAvatar
      )

      // Reload chats and select the new one
      const userChats = await getUserChats(user.id)
      setChats(userChats)
      const newChat = userChats.find(c => c.id === chatId)
      if (newChat) {
        setSelectedChat(newChat)
      }
    } catch (error) {
      console.error('Error creating chat:', error)
    }
  }

  const handleSendFriendRequest = async (targetUser: User) => {
    if (!user) return

    try {
      await sendFriendRequest(
        user.id,
        user.displayName,
        user.avatar,
        targetUser.id,
        targetUser.displayName,
        targetUser.avatar
      )
      setFriendStatuses(prev => ({ ...prev, [targetUser.id]: 'pending_sent' }))
      toast({ title: text.requestSent })
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'Already friends') {
        toast({ title: language === 'ru' ? 'Вы уже друзья' : 'Сіз қазірдің өзінде достарсыз' })
      } else {
        console.error('Error sending friend request:', error)
      }
    }
  }

  const handleAcceptRequest = async (request: FriendRequest) => {
    if (!user) return

    try {
      await acceptFriendRequest(request.id, user.id, user.displayName, user.avatar)
      setFriendRequests(prev => prev.filter(r => r.id !== request.id))
      // Reload friends
      const friendsList = await getFriends(user.id)
      setFriends(friendsList)
      toast({ title: text.requestAccepted })
    } catch (error) {
      console.error('Error accepting request:', error)
    }
  }

  const handleDeclineRequest = async (requestId: string) => {
    try {
      await declineFriendRequest(requestId)
      setFriendRequests(prev => prev.filter(r => r.id !== requestId))
      toast({ title: text.requestDeclined })
    } catch (error) {
      console.error('Error declining request:', error)
    }
  }

  const handleRemoveFriend = async () => {
    try {
      await removeFriend(removeFriendDialog.friendshipId)
      setFriends(prev => prev.filter(f => f.id !== removeFriendDialog.friendshipId))
      toast({ title: text.friendRemoved })
    } catch (error) {
      console.error('Error removing friend:', error)
    } finally {
      setRemoveFriendDialog({ open: false, friendshipId: '', friendName: '' })
    }
  }

  const handlePhoneCall = () => {
    toast({
      title: language === 'ru' ? 'Голосовые звонки' : 'Дауыстық қоңыраулар',
      description: language === 'ru' ? 'Функция будет доступна в ближайшем обновлении' : 'Функция жақын жаңартуда қолжетімді болады',
    })
  }

  const handleVideoCall = () => {
    toast({
      title: language === 'ru' ? 'Видеозвонки' : 'Бейне қоңыраулар',
      description: language === 'ru' ? 'Функция будет доступна в ближайшем обновлении' : 'Функция жақын жаңартуда қолжетімді болады',
    })
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleImageSelect = () => {
    imageInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      toast({
        title: language === 'ru' ? 'Отправка файлов' : 'Файлдарды жіберу',
        description: language === 'ru' ? 'Функция будет доступна в ближайшем обновлении' : 'Функция жақын жаңартуда қолжетімді болады',
      })
    }
    e.target.value = ''
  }

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji)
    setEmojiOpen(false)
  }

  const handleClearChat = async () => {
    if (!selectedChat) return

    setIsClearing(true)
    try {
      await clearChat(selectedChat.id)
      setMessages([])
      setChats(prev => prev.map(c =>
        c.id === selectedChat.id
          ? { ...c, lastMessage: null }
          : c
      ))
      toast({ title: text.chatCleared })
    } catch (error) {
      console.error('Error clearing chat:', error)
    } finally {
      setIsClearing(false)
      setClearDialogOpen(false)
    }
  }

  const handleDeleteChat = async () => {
    if (!selectedChat) return

    setIsClearing(true)
    try {
      await deleteChat(selectedChat.id)
      setChats(prev => prev.filter(c => c.id !== selectedChat.id))
      setSelectedChat(null)
      setMessages([])
      toast({ title: text.chatDeleted })
    } catch (error) {
      console.error('Error deleting chat:', error)
    } finally {
      setIsClearing(false)
      setDeleteDialogOpen(false)
    }
  }

  const getOtherUser = (chat: Chat) => {
    if (!user) return null
    const otherUserId = chat.participants.find(id => id !== user.id)
    return otherUserId ? { id: otherUserId, ...chat.participantsData[otherUserId] } : null
  }

  const getFriendInfo = (friendship: Friendship) => {
    if (!user) return null
    const friendId = friendship.users.find(id => id !== user.id)
    return friendId ? { id: friendId, ...friendship.usersData[friendId] } : null
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <p className="text-muted-foreground">{text.loginRequired}</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] border rounded-lg overflow-hidden">
      {/* Left sidebar with tabs */}
      <div className="w-80 border-r flex flex-col">
        <Tabs defaultValue="chats" className="flex flex-col h-full">
          <div className="p-4 border-b">
            <h2 className="font-semibold mb-3">{text.title}</h2>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="chats" className="text-xs">
                {text.chats}
              </TabsTrigger>
              <TabsTrigger value="friends" className="text-xs">
                {text.friends}
              </TabsTrigger>
              <TabsTrigger value="requests" className="text-xs relative">
                {text.requests}
                {friendRequests.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                    {friendRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Chats tab */}
          <TabsContent value="chats" className="flex-1 m-0 overflow-hidden flex flex-col">
            <div className="p-4 pt-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={text.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <ScrollArea className="flex-1">
              {filteredChats.length === 0 ? (
                <div className="p-6 text-center">
                  <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="font-medium">{text.noChats}</p>
                  <p className="text-sm text-muted-foreground mt-1">{text.noChatsDescription}</p>
                </div>
              ) : (
                filteredChats.map((chat) => {
                  const otherUser = getOtherUser(chat)
                  if (!otherUser) return null

                  const unread = chat.lastMessage &&
                    chat.lastMessage.senderId !== user.id &&
                    chat.participantsData[user.id]?.lastRead &&
                    chat.lastMessage.timestamp > chat.participantsData[user.id].lastRead

                  return (
                    <div
                      key={chat.id}
                      onClick={() => setSelectedChat(chat)}
                      className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedChat?.id === chat.id ? 'bg-muted' : ''
                      }`}
                    >
                      <Avatar>
                        <AvatarImage src={otherUser.avatar || undefined} />
                        <AvatarFallback>{getInitials(otherUser.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium truncate">{otherUser.name}</span>
                          {chat.lastMessage && (
                            <span className="text-xs text-muted-foreground">
                              {formatRelativeTime(chat.lastMessage.timestamp.toDate())}
                            </span>
                          )}
                        </div>
                        {chat.lastMessage && (
                          <p className="text-sm text-muted-foreground truncate">
                            {chat.lastMessage.senderId === user.id ? 'Вы: ' : ''}
                            {chat.lastMessage.text}
                          </p>
                        )}
                      </div>
                      {unread && (
                        <Badge className="rounded-full h-3 w-3 p-0" />
                      )}
                    </div>
                  )
                })
              )}
            </ScrollArea>
          </TabsContent>

          {/* Friends tab */}
          <TabsContent value="friends" className="flex-1 m-0 overflow-hidden flex flex-col">
            <div className="p-4 pt-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={text.searchUsers}
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <ScrollArea className="flex-1">
              {/* Search results */}
              {userSearchQuery.trim() && (
                <div className="border-b pb-2 mb-2">
                  {isSearching ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : searchResults.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">{text.noResults}</p>
                  ) : (
                    searchResults.map((searchUser) => {
                      const status = friendStatuses[searchUser.id] || 'none'
                      return (
                        <div
                          key={searchUser.id}
                          className="flex items-center gap-3 p-3 hover:bg-muted/50"
                        >
                          <Link href={`/profile/${searchUser.username || searchUser.id}`}>
                            <Avatar className="cursor-pointer">
                              <AvatarImage src={searchUser.avatar || undefined} />
                              <AvatarFallback>{getInitials(searchUser.displayName)}</AvatarFallback>
                            </Avatar>
                          </Link>
                          <div className="flex-1 min-w-0">
                            <Link href={`/profile/${searchUser.username || searchUser.id}`}>
                              <p className="font-medium truncate hover:text-primary">{searchUser.displayName}</p>
                            </Link>
                            <p className="text-xs text-muted-foreground">@{searchUser.username}</p>
                          </div>
                          {status === 'none' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSendFriendRequest(searchUser)}
                            >
                              <UserPlus className="h-4 w-4 mr-1" />
                              {text.addFriend}
                            </Button>
                          )}
                          {status === 'pending_sent' && (
                            <Badge variant="secondary">{text.pending}</Badge>
                          )}
                          {status === 'friends' && (
                            <Button
                              size="sm"
                              onClick={() => handleStartChat(searchUser.id, searchUser.displayName, searchUser.avatar)}
                            >
                              <MessageCircle className="h-4 w-4 mr-1" />
                              {text.sendMessage}
                            </Button>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              )}

              {/* Friends list */}
              {friendsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : friends.length === 0 && !userSearchQuery.trim() ? (
                <div className="p-6 text-center">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="font-medium">{text.noFriends}</p>
                  <p className="text-sm text-muted-foreground mt-1">{text.noFriendsDescription}</p>
                </div>
              ) : (
                friends.map((friendship) => {
                  const friend = getFriendInfo(friendship)
                  if (!friend) return null

                  return (
                    <div
                      key={friendship.id}
                      className="flex items-center gap-3 p-3 hover:bg-muted/50"
                    >
                      <Link href={`/profile/${friend.username || friend.id}`}>
                        <Avatar className="cursor-pointer">
                          <AvatarImage src={friend.avatar || undefined} />
                          <AvatarFallback>{getInitials(friend.name)}</AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={`/profile/${friend.username || friend.id}`}>
                          <p className="font-medium truncate hover:text-primary">{friend.name}</p>
                        </Link>
                        {friend.username && (
                          <p className="text-xs text-muted-foreground">@{friend.username}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStartChat(friend.id, friend.name, friend.avatar)}
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setRemoveFriendDialog({
                                open: true,
                                friendshipId: friendship.id,
                                friendName: friend.name,
                              })}
                            >
                              <UserMinus className="h-4 w-4 mr-2" />
                              {text.removeFriend}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  )
                })
              )}
            </ScrollArea>
          </TabsContent>

          {/* Requests tab */}
          <TabsContent value="requests" className="flex-1 m-0 overflow-hidden">
            <ScrollArea className="h-full">
              {friendRequests.length === 0 ? (
                <div className="p-6 text-center">
                  <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="font-medium">{text.noRequests}</p>
                  <p className="text-sm text-muted-foreground mt-1">{text.noRequestsDescription}</p>
                </div>
              ) : (
                friendRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center gap-3 p-4 border-b"
                  >
                    <Link href={`/profile/${request.senderId}`}>
                      <Avatar className="cursor-pointer">
                        <AvatarImage src={request.senderAvatar || undefined} />
                        <AvatarFallback>{getInitials(request.senderName)}</AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/profile/${request.senderId}`}>
                        <p className="font-medium truncate hover:text-primary">{request.senderName}</p>
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {request.createdAt && formatRelativeTime(request.createdAt.toDate())}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAcceptRequest(request)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        {text.accept}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeclineRequest(request.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Chat window */}
      {selectedChat ? (
        <div className="flex-1 flex flex-col">
          {/* Chat header */}
          {(() => {
            const otherUser = getOtherUser(selectedChat)
            return (
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={otherUser?.avatar || undefined} />
                    <AvatarFallback>{otherUser ? getInitials(otherUser.name) : '?'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{otherUser?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={handlePhoneCall}>
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleVideoCall}>
                    <Video className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setClearDialogOpen(true)}>
                        {text.clearChat}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteDialogOpen(true)}
                      >
                        {text.deleteChat}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )
          })()}

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      message.senderId === user.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.senderId === user.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}>
                      {message.createdAt && formatRelativeTime(message.createdAt.toDate())}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Message input */}
          <div className="p-4 border-t">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <input
              type="file"
              accept="image/*"
              ref={imageInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleFileSelect}>
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleImageSelect}>
                <Image className="h-4 w-4" />
              </Button>
              <Input
                placeholder={text.writeMessage}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
                disabled={isSending}
              />
              <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Smile className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2" align="end">
                  <div className="grid grid-cols-6 gap-1">
                    {EMOJI_LIST.map((emoji) => (
                      <Button
                        key={emoji}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-lg"
                        onClick={() => handleEmojiSelect(emoji)}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              <Button onClick={handleSendMessage} disabled={!newMessage.trim() || isSending}>
                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="font-medium">{text.selectChat}</p>
            <p className="text-sm text-muted-foreground mt-1">{text.selectChatDescription}</p>
          </div>
        </div>
      )}

      {/* Clear Chat Dialog */}
      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{text.clearChatTitle}</AlertDialogTitle>
            <AlertDialogDescription>{text.clearChatDesc}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isClearing}>{text.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearChat} disabled={isClearing}>
              {isClearing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {text.clear}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Chat Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{text.deleteChatTitle}</AlertDialogTitle>
            <AlertDialogDescription>{text.deleteChatDesc}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isClearing}>{text.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteChat}
              disabled={isClearing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isClearing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {text.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Friend Dialog */}
      <AlertDialog open={removeFriendDialog.open} onOpenChange={(open) => setRemoveFriendDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{text.removeFriendTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {text.removeFriendDesc.replace('этого пользователя', removeFriendDialog.friendName)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{text.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveFriend}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {text.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
