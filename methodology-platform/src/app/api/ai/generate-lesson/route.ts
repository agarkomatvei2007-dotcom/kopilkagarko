import { NextRequest, NextResponse } from 'next/server'
import { generateLessonPlan } from '@/lib/groq/client'
import { protectedApi, sanitizeInput } from '@/lib/security/apiProtection'
import { RATE_LIMITS } from '@/lib/security/rateLimit'

async function handler(request: NextRequest) {
  const body = await request.json()
  const { topic, subject, grade, duration } = body

  if (!topic || !subject || !grade) {
    return NextResponse.json(
      { error: 'Missing required fields: topic, subject, grade' },
      { status: 400 }
    )
  }

  // Санитизация входных данных
  const safeTopic = sanitizeInput(topic)
  const safeSubject = sanitizeInput(subject)
  const safeGrade = Number(grade) || 1

  const lessonPlan = await generateLessonPlan(safeTopic, safeSubject, safeGrade, duration)

  return NextResponse.json({ lessonPlan })
}

// Обёртка с rate limiting для AI генерации (10 запросов/мин)
export const POST = protectedApi(handler, {
  rateLimit: RATE_LIMITS.aiGeneration
})
