import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export const geminiModel = genAI.getGenerativeModel({ model: 'gemini-pro' })

export async function generateLessonPlan(
  topic: string,
  subject: string,
  grade: number,
  duration: number = 45
): Promise<string> {
  const prompt = `
    Создай подробный план занятия по дисциплине "${subject}" на тему "${topic}" для ${grade} курса колледжа.
    Продолжительность урока: ${duration} минут.

    Структура плана:
    1. Цели урока (образовательные, развивающие, воспитательные)
    2. Необходимые материалы и оборудование
    3. Ход урока:
       - Организационный момент (2-3 мин)
       - Актуализация знаний (5-7 мин)
       - Объяснение нового материала (15-20 мин)
       - Закрепление материала (10-15 мин)
       - Подведение итогов (3-5 мин)
    4. Домашнее задание
    5. Критерии оценивания

    Формат ответа: Markdown с четкой структурой и заголовками.
    Язык: Русский.
  `

  const result = await geminiModel.generateContent(prompt)
  return result.response.text()
}

export async function generateQuiz(
  topic: string,
  subject: string,
  grade: number,
  questionsCount: number = 10
): Promise<string> {
  const prompt = `
    Создай тест из ${questionsCount} вопросов по дисциплине "${subject}" на тему "${topic}" для ${grade} курса колледжа.

    Требования:
    - Включи вопросы разной сложности (легкие, средние, сложные)
    - Каждый вопрос должен иметь 4 варианта ответа
    - Укажи правильный ответ
    - Добавь краткое объяснение к каждому ответу

    Формат ответа: JSON массив объектов вида:
    {
      "question": "Текст вопроса",
      "options": ["Вариант А", "Вариант Б", "Вариант В", "Вариант Г"],
      "correctAnswer": 0,
      "explanation": "Объяснение правильного ответа",
      "difficulty": "easy|medium|hard"
    }

    Верни ТОЛЬКО JSON без дополнительного текста.
  `

  const result = await geminiModel.generateContent(prompt)
  return result.response.text()
}

export async function generateDescription(content: string): Promise<string> {
  const prompt = `
    На основе следующего учебного материала создай краткое, но информативное описание (2-3 предложения).
    Описание должно передавать суть материала и привлекать внимание учителей.

    Материал:
    ${content.slice(0, 2000)}

    Верни ТОЛЬКО описание, без вводных фраз.
  `

  const result = await geminiModel.generateContent(prompt)
  return result.response.text()
}

export async function generateTags(content: string, subject: string): Promise<string[]> {
  const prompt = `
    Проанализируй следующий учебный материал по предмету "${subject}" и предложи 5-7 релевантных тегов.
    Теги должны быть на русском языке, в нижнем регистре, без знаков препинания.

    Материал:
    ${content.slice(0, 2000)}

    Верни теги через запятую, например: программирование, python, 2 курс, лабораторная работа
  `

  const result = await geminiModel.generateContent(prompt)
  const tagsString = result.response.text()
  return tagsString.split(',').map(tag => tag.trim().toLowerCase()).filter(Boolean)
}

export async function analyzeContent(content: string): Promise<{
  difficulty: 'easy' | 'medium' | 'hard'
  suggestedGrades: number[]
  topics: string[]
  improvements: string[]
}> {
  const prompt = `
    Проанализируй следующий учебный материал и определи:
    1. Уровень сложности (easy, medium, hard)
    2. Для каких курсов колледжа подходит (числа от 1 до 4)
    3. Основные темы/ключевые понятия (до 5)
    4. Рекомендации по улучшению (до 3)

    Материал:
    ${content.slice(0, 3000)}

    Ответ в формате JSON:
    {
      "difficulty": "easy|medium|hard",
      "suggestedGrades": [5, 6, 7],
      "topics": ["тема1", "тема2"],
      "improvements": ["рекомендация1", "рекомендация2"]
    }

    Верни ТОЛЬКО JSON.
  `

  const result = await geminiModel.generateContent(prompt)
  const text = result.response.text()

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0])
  }

  return {
    difficulty: 'medium',
    suggestedGrades: [],
    topics: [],
    improvements: [],
  }
}

export async function checkFGOSCompliance(
  content: string,
  subject: string,
  grade: number
): Promise<{
  isCompliant: boolean
  matchedStandards: string[]
  suggestions: string[]
}> {
  const prompt = `
    Проверь соответствие следующего учебного материала требованиям ФГОС СПО для ${grade} курса по дисциплине "${subject}".

    Материал:
    ${content.slice(0, 3000)}

    Ответ в формате JSON:
    {
      "isCompliant": true/false,
      "matchedStandards": ["стандарт1", "стандарт2"],
      "suggestions": ["рекомендация по улучшению соответствия ФГОС"]
    }

    Верни ТОЛЬКО JSON.
  `

  const result = await geminiModel.generateContent(prompt)
  const text = result.response.text()

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0])
  }

  return {
    isCompliant: true,
    matchedStandards: [],
    suggestions: [],
  }
}
