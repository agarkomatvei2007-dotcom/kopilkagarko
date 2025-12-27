import { NextRequest, NextResponse } from 'next/server'

const GROQ_API_KEY = process.env.GROQ_API_KEY

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
    if (!GROQ_API_KEY) {
      console.error('GROQ_API_KEY is not set in environment variables')
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

    // Build messages array for Groq (OpenAI-compatible format)
    const messages = [
      {
        role: 'system',
        content: SYSTEM_PROMPT
      }
    ]

    // Add conversation history
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        messages.push({
          role: msg.role,
          content: msg.content
        })
      }
    }

    // Add current message
    messages.push({
      role: 'user',
      content: message
    })

    // Call Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.7,
        max_tokens: 2048,
        top_p: 0.95,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Groq API error:', errorText)

      let errorMessage = 'Ошибка при обращении к ИИ'
      try {
        const errorData = JSON.parse(errorText)
        if (errorData.error?.message) {
          if (errorData.error.message.includes('invalid_api_key')) {
            errorMessage = 'Неверный API ключ Groq. Проверьте ключ в настройках.'
          } else if (errorData.error.message.includes('rate_limit')) {
            errorMessage = 'Превышен лимит запросов. Попробуйте через минуту.'
          } else {
            errorMessage = `Ошибка Groq: ${errorData.error.message}`
          }
        }
      } catch {
        // Keep default message
      }

      return NextResponse.json(
        { error: 'GROQ_ERROR', message: errorMessage, details: errorText },
        { status: 500 }
      )
    }

    const data = await response.json()
    const aiResponse = data.choices?.[0]?.message?.content

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
