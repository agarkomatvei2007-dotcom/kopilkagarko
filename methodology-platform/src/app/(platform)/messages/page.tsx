'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Send, MoreVertical, Phone, Video, Image, Paperclip, Smile, Loader2, MessageCircle, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
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
import { getUserChats, getChatMessages, sendMessage, markMessagesAsRead } from '@/lib/firebase/firestore'
import { getInitials, formatRelativeTime } from '@/lib/utils'
import type { Chat, Message } from '@/types'

const EMOJI_LIST = ['😀', '😊', '😂', '🤣', '😍', '🥰', '😘', '😎', '🤔', '😢', '😭', '😡', '👍', '👎', '👏', '🙌', '🎉', '❤️', '💯', '🔥', '✨', '⭐', '📚', '✏️', '📝', '💡', '🎓', '👨‍🏫', '👩‍🏫', '📖']

export default function MessagesPage() {
  const { user } = useAuth()
  const { language } = useLanguage()
  const { toast } = useToast()
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [emojiOpen, setEmojiOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const txt = {
    ru: {
      title: 'Сообщения',
      searchPlaceholder: 'Поиск...',
      online: 'В сети',
      offline: 'Не в сети',
      writeMessage: 'Написать сообщение...',
      loginRequired: 'Войдите, чтобы просматривать сообщения',
      noChats: 'У вас пока нет чатов',
      noChatsDescription: 'Начните общение с другими преподавателями на платформе',
      selectChat: 'Выберите чат',
      selectChatDescription: 'Выберите чат из списка слева, чтобы начать общение',
    },
    kk: {
      title: 'Хабарламалар',
      searchPlaceholder: 'Іздеу...',
      online: 'Желіде',
      offline: 'Желіде емес',
      writeMessage: 'Хабарлама жазу...',
      loginRequired: 'Хабарламаларды көру үшін кіріңіз',
      noChats: 'Сізде әлі чаттар жоқ',
      noChatsDescription: 'Платформадағы басқа оқытушылармен сөйлесуді бастаңыз',
      selectChat: 'Чат таңдаңыз',
      selectChatDescription: 'Сөйлесуді бастау үшін сол жақтағы тізімнен чатты таңдаңыз',
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
        if (userChats.length > 0 && !selectedChat) {
          setSelectedChat(userChats[0])
        }
      } catch (error) {
        console.error('Error loading chats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadChats()
    // Refresh chats every 30 seconds
    const interval = setInterval(loadChats, 30000)
    return () => clearInterval(interval)
  }, [user])

  // Load messages when chat is selected
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedChat || !user) return

      try {
        const chatMessages = await getChatMessages(selectedChat.id)
        setMessages(chatMessages)
        // Mark messages as read
        await markMessagesAsRead(selectedChat.id, user.id)
      } catch (error) {
        console.error('Error loading messages:', error)
      }
    }

    loadMessages()
    // Refresh messages every 5 seconds
    const interval = setInterval(loadMessages, 5000)
    return () => clearInterval(interval)
  }, [selectedChat, user])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
      // Reload messages
      const chatMessages = await getChatMessages(selectedChat.id)
      setMessages(chatMessages)
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsSending(false)
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

  const getOtherUser = (chat: Chat) => {
    if (!user) return null
    const otherUserId = chat.participants.find(id => id !== user.id)
    return otherUserId ? { id: otherUserId, ...chat.participantsData[otherUserId] } : null
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
      {/* Chats list */}
      <div className="w-80 border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-semibold mb-3">{text.title}</h2>
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
                      <DropdownMenuItem>
                        {language === 'ru' ? 'Очистить чат' : 'Чатты тазалау'}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        {language === 'ru' ? 'Удалить чат' : 'Чатты жою'}
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
    </div>
  )
}
