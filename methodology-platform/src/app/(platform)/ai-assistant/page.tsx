'use client'

import { useState, useRef, useEffect } from 'react'
import { Bot, Send, Loader2, Trash2, Sparkles, BookOpen, FileText, HelpCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/hooks/useLanguage'
import { getInitials } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const QUICK_PROMPTS = {
  ru: [
    { icon: BookOpen, text: 'Как составить план урока?' },
    { icon: FileText, text: 'Помоги написать КТП' },
    { icon: HelpCircle, text: 'Методы активного обучения' },
    { icon: Sparkles, text: 'Идеи для интерактивного урока' },
  ],
  kk: [
    { icon: BookOpen, text: 'Сабақ жоспарын қалай құруға болады?' },
    { icon: FileText, text: 'КТЖ жазуға көмектес' },
    { icon: HelpCircle, text: 'Белсенді оқыту әдістері' },
    { icon: Sparkles, text: 'Интерактивті сабаққа идеялар' },
  ],
}

export default function AIAssistantPage() {
  const { user } = useAuth()
  const { language } = useLanguage()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const txt = {
    ru: {
      title: 'ИИ-ассистент',
      subtitle: 'Ваш помощник в методических вопросах',
      placeholder: 'Задайте вопрос...',
      clearChat: 'Очистить чат',
      loginRequired: 'Войдите, чтобы использовать ИИ-ассистента',
      welcome: 'Привет! Я ваш методический ИИ-ассистент. Могу помочь с:',
      welcomeItems: [
        'Планированием уроков и занятий',
        'Методическими рекомендациями',
        'Документацией (КТП, планы, отчёты)',
        'Работой со студентами',
        'Современными методами обучения',
      ],
      askAnything: 'Задайте любой вопрос или выберите тему:',
      quickPrompts: 'Быстрые вопросы',
      error: 'Произошла ошибка. Попробуйте ещё раз.',
      thinking: 'Думаю...',
    },
    kk: {
      title: 'ЖИ-көмекші',
      subtitle: 'Әдістемелік сұрақтар бойынша көмекшіңіз',
      placeholder: 'Сұрақ қойыңыз...',
      clearChat: 'Чатты тазалау',
      loginRequired: 'ЖИ-көмекшіні пайдалану үшін кіріңіз',
      welcome: 'Сәлем! Мен сіздің әдістемелік ЖИ-көмекшіңізбін. Көмектесе аламын:',
      welcomeItems: [
        'Сабақтар мен сабақтарды жоспарлау',
        'Әдістемелік ұсыныстар',
        'Құжаттама (КТЖ, жоспарлар, есептер)',
        'Студенттермен жұмыс',
        'Қазіргі заманғы оқыту әдістері',
      ],
      askAnything: 'Кез келген сұрақ қойыңыз немесе тақырыпты таңдаңыз:',
      quickPrompts: 'Жылдам сұрақтар',
      error: 'Қате орын алды. Қайталап көріңіз.',
      thinking: 'Ойланамын...',
    },
  }

  const text = txt[language]
  const prompts = QUICK_PROMPTS[language]

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim()
    if (!textToSend || isLoading) return

    const userMessage: Message = { role: 'user', content: textToSend }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: messages,
        }),
      })

      const data = await response.json()

      if (data.error) {
        // Show specific message for API key not configured
        if (data.error === 'API_KEY_NOT_CONFIGURED') {
          const errorMessage: Message = {
            role: 'assistant',
            content: data.message || (language === 'ru'
              ? 'ИИ-ассистент временно недоступен. Администратор должен настроить API ключ.'
              : 'ЖИ-көмекші уақытша қолжетімсіз. Әкімші API кілтін баптауы керек.')
          }
          setMessages(prev => [...prev, errorMessage])
          return
        }
        throw new Error(data.error)
      }

      const assistantMessage: Message = { role: 'assistant', content: data.response }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = { role: 'assistant', content: text.error }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const clearChat = () => {
    setMessages([])
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto py-12 text-center">
        <Bot className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">{text.loginRequired}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{text.title}</h1>
            <p className="text-sm text-muted-foreground">{text.subtitle}</p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button variant="outline" size="sm" onClick={clearChat}>
            <Trash2 className="h-4 w-4 mr-2" />
            {text.clearChat}
          </Button>
        )}
      </div>

      <Card className="h-[calc(100vh-16rem)]">
        <CardContent className="p-0 h-full flex flex-col">
          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 ? (
              <div className="space-y-6">
                {/* Welcome message */}
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 bg-primary">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-3">
                    <div className="bg-muted rounded-2xl rounded-tl-none p-4">
                      <p className="font-medium mb-2">{text.welcome}</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {text.welcomeItems.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                      <p className="mt-3 text-sm">{text.askAnything}</p>
                    </div>
                  </div>
                </div>

                {/* Quick prompts */}
                <div className="pl-11">
                  <p className="text-sm font-medium mb-3">{text.quickPrompts}:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {prompts.map((prompt, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        className="justify-start h-auto py-3 px-4"
                        onClick={() => sendMessage(prompt.text)}
                      >
                        <prompt.icon className="h-4 w-4 mr-2 shrink-0" />
                        <span className="text-left text-sm">{prompt.text}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
                  >
                    {message.role === 'assistant' && (
                      <Avatar className="h-8 w-8 bg-primary shrink-0">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl p-4 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-tr-none'
                          : 'bg-muted rounded-tl-none'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {message.role === 'user' && (
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback>
                          {getInitials(user.displayName || 'User')}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8 bg-primary shrink-0">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-2xl rounded-tl-none p-4">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">{text.thinking}</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                placeholder={text.placeholder}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="flex-1"
              />
              <Button onClick={() => sendMessage()} disabled={!input.trim() || isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
