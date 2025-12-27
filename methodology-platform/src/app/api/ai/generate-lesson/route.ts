import { NextRequest, NextResponse } from 'next/server'
import { generateLessonPlan } from '@/lib/groq/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { topic, subject, grade, duration } = body

    if (!topic || !subject || !grade) {
      return NextResponse.json(
        { error: 'Missing required fields: topic, subject, grade' },
        { status: 400 }
      )
    }

    const lessonPlan = await generateLessonPlan(topic, subject, grade, duration)

    return NextResponse.json({ lessonPlan })
  } catch (error) {
    console.error('Error generating lesson plan:', error)
    return NextResponse.json(
      { error: 'Failed to generate lesson plan' },
      { status: 500 }
    )
  }
}
