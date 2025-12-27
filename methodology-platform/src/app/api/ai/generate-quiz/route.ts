import { NextRequest, NextResponse } from 'next/server'
import { generateQuiz } from '@/lib/groq/client'

interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
}

function validateQuizQuestion(q: unknown): q is QuizQuestion {
  if (!q || typeof q !== 'object') return false
  const question = q as Record<string, unknown>

  return (
    typeof question.question === 'string' &&
    Array.isArray(question.options) &&
    question.options.length >= 2 &&
    question.options.every((o: unknown) => typeof o === 'string') &&
    typeof question.correctAnswer === 'number' &&
    question.correctAnswer >= 0 &&
    question.correctAnswer < question.options.length &&
    typeof question.explanation === 'string' &&
    ['easy', 'medium', 'hard'].includes(question.difficulty as string)
  )
}

function extractAndParseJSON(text: string): unknown[] | null {
  // Try to find JSON array in different formats
  const patterns = [
    /\[[\s\S]*\]/,           // Standard JSON array
    /```json\s*(\[[\s\S]*?\])\s*```/, // Markdown code block
    /```\s*(\[[\s\S]*?\])\s*```/,     // Generic code block
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      try {
        const jsonStr = match[1] || match[0]
        return JSON.parse(jsonStr)
      } catch {
        continue
      }
    }
  }

  // Try parsing the entire response as JSON
  try {
    const parsed = JSON.parse(text)
    if (Array.isArray(parsed)) return parsed
    if (parsed.questions && Array.isArray(parsed.questions)) return parsed.questions
  } catch {
    // Not valid JSON
  }

  return null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { topic, subject, grade, questionsCount = 10 } = body

    if (!topic || !subject || !grade) {
      return NextResponse.json(
        { error: 'Missing required fields: topic, subject, grade' },
        { status: 400 }
      )
    }

    const quizText = await generateQuiz(topic, subject, grade, questionsCount)

    // Try to parse JSON from the response
    const parsedQuestions = extractAndParseJSON(quizText)

    if (!parsedQuestions || !Array.isArray(parsedQuestions)) {
      console.error('Failed to extract quiz JSON from response')
      return NextResponse.json(
        { error: 'Не удалось сгенерировать тест. Попробуйте еще раз.' },
        { status: 500 }
      )
    }

    // Validate and sanitize questions
    const validQuestions: QuizQuestion[] = []
    for (const q of parsedQuestions) {
      if (validateQuizQuestion(q)) {
        validQuestions.push({
          question: q.question.trim(),
          options: q.options.map((o: string) => o.trim()),
          correctAnswer: q.correctAnswer,
          explanation: q.explanation.trim(),
          difficulty: q.difficulty,
        })
      }
    }

    if (validQuestions.length === 0) {
      console.error('No valid questions in response')
      return NextResponse.json(
        { error: 'Не удалось сгенерировать корректные вопросы. Попробуйте еще раз.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ questions: validQuestions })
  } catch (error) {
    console.error('Error generating quiz:', error)
    return NextResponse.json(
      { error: 'Ошибка при генерации теста. Попробуйте позже.' },
      { status: 500 }
    )
  }
}
