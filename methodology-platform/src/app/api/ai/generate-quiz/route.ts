import { NextRequest, NextResponse } from 'next/server'
import { generateQuiz } from '@/lib/groq/client'

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
    let questions = []
    try {
      // Find JSON array in response
      const jsonMatch = quizText.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0])
      }
    } catch (parseError) {
      console.error('Failed to parse quiz JSON:', parseError)
      return NextResponse.json(
        { error: 'Failed to parse quiz response', raw: quizText },
        { status: 500 }
      )
    }

    return NextResponse.json({ questions })
  } catch (error) {
    console.error('Error generating quiz:', error)
    return NextResponse.json(
      { error: 'Failed to generate quiz' },
      { status: 500 }
    )
  }
}
