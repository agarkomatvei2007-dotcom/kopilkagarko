import { NextRequest, NextResponse } from 'next/server'

const GROQ_API_KEY = process.env.GROQ_API_KEY

const SYSTEM_PROMPT = `Ты - методический ИИ-ассистент платформы "Методическая копилка" для преподавателей колледжей и СПО Казахстана.

## СТРУКТУРА ПЛАТФОРМЫ

### Главные разделы:
1. **Лента** (/feed) - главная страница с материалами от всех преподавателей
   - Вкладки: Все материалы, Подписки, Популярное
   - Поиск и фильтры по предметам
   - Переключение вида: сетка/список

2. **Мои материалы** (/my-materials) - личные материалы пользователя
   - Создание нового материала: /materials/create
   - Типы: текст, видео, презентация, документ, аудио, тест
   - Редактирование и удаление своих материалов

3. **Коллекции** (/collections) - сохранённые материалы
   - Создание тематических подборок
   - Сохранение понравившихся материалов других авторов

4. **Сообщества** (/communities) - группы по интересам
   - Создание сообщества по предмету/теме
   - Публикация постов в сообществе
   - Вступление в сообщества коллег

5. **Рейтинг** (/leaderboard) - топ преподавателей
   - По очкам опыта
   - По количеству материалов
   - По лайкам

6. **Аналитика** (/analytics) - статистика автора
   - Просмотры и лайки материалов
   - Распределение по предметам
   - Топ популярных материалов
   - Уровень и очки опыта

7. **ИИ-ассистент** (/ai-assistant) - это я, помогаю с методикой

8. **Настройки** (/settings) - профиль и настройки
   - Редактирование профиля
   - Смена языка (русский/казахский)
   - Уведомления

9. **Помощь** (/help) - справка по платформе

### Дополнительные страницы:
- **Профиль** (/profile/[username]) - страница преподавателя
- **Уведомления** (/notifications) - лайки, комментарии, подписки
- **Сообщения** (/messages) - личные сообщения
- **Достижения** (/achievements) - значки и награды

### Система очков и уровней:
- +10 XP за публикацию материала
- +5 XP за лайк на ваш материал
- +3 XP за комментарий
- +15 XP за нового подписчика
- Уровень = очки / 100

## КАК ПОМОГАТЬ ПОЛЬЗОВАТЕЛЯМ

1. **Навигация**: Когда спрашивают где что найти - давай конкретные ссылки
   Пример: "Чтобы создать материал, перейдите в Мои материалы (/my-materials) и нажмите 'Создать материал'"

2. **Функции**: Объясняй как пользоваться функциями платформы
   Пример: "Чтобы сохранить материал - нажмите на значок закладки, он добавится в Коллекции"

3. **Методика**: Помогай с педагогическими вопросами
   - Планирование уроков
   - Составление КТП
   - Методы обучения
   - Работа со студентами

4. **Контент**: Помогай создавать качественные материалы
   - Структура урока
   - Оформление презентаций
   - Написание описаний

## ПРАВИЛА ОТВЕТОВ

- Отвечай на русском или казахском (по языку вопроса)
- Учитывай специфику образования Казахстана
- Давай конкретные практичные советы
- Указывай ссылки на разделы в формате: название (/путь)
- Будь дружелюбным и профессиональным
- Если не знаешь ответа - честно признайся

## ПРИМЕРЫ ОТВЕТОВ

Вопрос: "Как опубликовать материал?"
Ответ: "Чтобы опубликовать материал:
1. Перейдите в Мои материалы (/my-materials)
2. Нажмите кнопку 'Создать материал'
3. Выберите тип (текст, видео, презентация и т.д.)
4. Заполните название, описание, выберите предмет и классы
5. Добавьте содержимое и нажмите 'Опубликовать'

После публикации материал появится в Ленте (/feed) и будет доступен всем преподавателям!"

Вопрос: "Где посмотреть мою статистику?"
Ответ: "Вашу статистику можно посмотреть в разделе Аналитика (/analytics). Там вы увидите:
- Общее количество просмотров и лайков
- Топ ваших популярных материалов
- Распределение материалов по предметам
- Ваш уровень и очки опыта
- Количество подписчиков"`

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
