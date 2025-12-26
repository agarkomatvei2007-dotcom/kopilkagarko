import { NextRequest, NextResponse } from 'next/server'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

const SYSTEM_PROMPT = `Ты - методический ИИ-ассистент для преподавателей колледжей и СПО (среднего профессионального образования) Казахстана.

Твои задачи:
- Помогать с методическими вопросами
- Давать советы по проведению уроков
- Помогать с планированием занятий
- Отвечать на вопросы по педагогике
- Помогать с документацией и отчётами
- Давать рекомендации по работе со студентами

Особенности:
- Отвечай на русском или казахском языке (в зависимости от языка вопроса)
- Учитывай специфику образования в Казахстане
- Будь дружелюбным и профессиональным
- Давай практичные и конкретные советы
- Если не знаешь ответа - честно скажи об этом

Ты работаешь на платформе "Методическая копилка" - это сообщество преподавателей для обмена материалами и опытом.`

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(request: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set in environment variables')
      return NextResponse.json(
        { error: 'API_KEY_NOT_CONFIGURED', message: 'ИИ-ассистент временно недоступен. API ключ не настроен.' },
        { status: 503 }
      )
    }

    const { message, history } = await request.json() as {
      message: string
      history?: Message[]
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Build conversation history for Gemini
    const contents = []

    // Add system prompt as first user message (Gemini doesn't have system role)
    contents.push({
      role: 'user',
      parts: [{ text: SYSTEM_PROMPT }]
    })
    contents.push({
      role: 'model',
      parts: [{ text: 'Понял! Я готов помочь преподавателям с методическими вопросами. Чем могу помочь?' }]
    })

    // Add conversation history
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        })
      }
    }

    // Add current message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    })

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            }
          ]
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error:', errorText)

      // Parse error for better messaging
      let errorMessage = 'Ошибка при обращении к ИИ'
      try {
        const errorData = JSON.parse(errorText)
        if (errorData.error?.message) {
          if (errorData.error.message.includes('API_KEY_INVALID')) {
            errorMessage = 'Неверный API ключ Gemini. Проверьте ключ в настройках.'
          } else if (errorData.error.message.includes('QUOTA_EXCEEDED')) {
            errorMessage = 'Превышен лимит запросов к API. Попробуйте позже.'
          } else {
            errorMessage = `Ошибка Gemini: ${errorData.error.message}`
          }
        }
      } catch {
        // Keep default message
      }

      return NextResponse.json(
        { error: 'GEMINI_ERROR', message: errorMessage, details: errorText },
        { status: 500 }
      )
    }

    const data = await response.json()

    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!aiResponse) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      )
    }

    return NextResponse.json({ response: aiResponse })
  } catch (error) {
    console.error('AI chat error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
