'use client'

import { useState } from 'react'
import { Search, Send, MoreVertical, Phone, Video, Image, Paperclip, Smile } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'

// Demo chat data
const chats = [
  {
    id: '1',
    user: { id: '1', name: 'Иванова М.А.', avatar: null, online: true },
    lastMessage: 'Спасибо за материал!',
    time: '10:30',
    unread: 2,
  },
  {
    id: '2',
    user: { id: '2', name: 'Петров И.В.', avatar: null, online: false },
    lastMessage: 'Когда планируете выложить продолжение курса?',
    time: 'Вчера',
    unread: 0,
  },
  {
    id: '3',
    user: { id: '3', name: 'Сидорова Е.К.', avatar: null, online: true },
    lastMessage: 'Отличная презентация!',
    time: 'Пн',
    unread: 0,
  },
]

const messages = [
  {
    id: '1',
    senderId: '1',
    text: 'Здравствуйте! Очень понравился ваш материал по дробям.',
    time: '10:15',
  },
  {
    id: '2',
    senderId: 'me',
    text: 'Спасибо! Рад, что пригодилось.',
    time: '10:20',
  },
  {
    id: '3',
    senderId: '1',
    text: 'Можете подсказать, как лучше объяснить детям сложение дробей с разными знаменателями?',
    time: '10:25',
  },
  {
    id: '4',
    senderId: 'me',
    text: 'Конечно! Я обычно использую визуализацию с помощью круговых диаграмм. Сначала показываю, как найти общий знаменатель на примере пиццы.',
    time: '10:28',
  },
  {
    id: '5',
    senderId: '1',
    text: 'Спасибо за материал!',
    time: '10:30',
  },
]

export default function MessagesPage() {
  const { user } = useAuth()
  const [selectedChat, setSelectedChat] = useState(chats[0])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredChats = chats.filter(chat =>
    chat.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    // In real app, send message to Firebase
    setNewMessage('')
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <p className="text-muted-foreground">Войдите, чтобы просматривать сообщения</p>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] border rounded-lg overflow-hidden">
      {/* Chats list */}
      <div className="w-80 border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-semibold mb-3">Сообщения</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                selectedChat.id === chat.id ? 'bg-muted' : ''
              }`}
            >
              <div className="relative">
                <Avatar>
                  <AvatarImage src={chat.user.avatar || undefined} />
                  <AvatarFallback>{chat.user.name[0]}</AvatarFallback>
                </Avatar>
                {chat.user.online && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium truncate">{chat.user.name}</span>
                  <span className="text-xs text-muted-foreground">{chat.time}</span>
                </div>
                <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
              </div>
              {chat.unread > 0 && (
                <Badge className="rounded-full">{chat.unread}</Badge>
              )}
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Chat window */}
      <div className="flex-1 flex flex-col">
        {/* Chat header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar>
                <AvatarImage src={selectedChat.user.avatar || undefined} />
                <AvatarFallback>{selectedChat.user.name[0]}</AvatarFallback>
              </Avatar>
              {selectedChat.user.online && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
              )}
            </div>
            <div>
              <p className="font-medium">{selectedChat.user.name}</p>
              <p className="text-xs text-muted-foreground">
                {selectedChat.user.online ? 'В сети' : 'Не в сети'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    message.senderId === 'me'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.senderId === 'me' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}>
                    {message.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Message input */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Image className="h-4 w-4" />
            </Button>
            <Input
              placeholder="Написать сообщение..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button variant="ghost" size="icon">
              <Smile className="h-4 w-4" />
            </Button>
            <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
