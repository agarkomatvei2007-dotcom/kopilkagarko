import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIP, RATE_LIMITS, RateLimitConfig } from './rateLimit'

type ApiHandler = (request: NextRequest) => Promise<NextResponse>

interface ProtectedApiOptions {
  rateLimit?: RateLimitConfig
  requireAuth?: boolean
  maxBodySize?: number // в байтах
}

/**
 * Обёртка для защиты API routes
 */
export function protectedApi(
  handler: ApiHandler,
  options: ProtectedApiOptions = {}
): ApiHandler {
  const {
    rateLimit = RATE_LIMITS.api,
    maxBodySize = 1024 * 1024 // 1MB по умолчанию
  } = options

  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // 1. Rate Limiting
      const clientIP = getClientIP(request)
      const rateLimitKey = `${clientIP}:${request.nextUrl.pathname}`
      const limitResult = checkRateLimit(rateLimitKey, rateLimit)

      if (!limitResult.allowed) {
        return NextResponse.json(
          {
            error: 'Too Many Requests',
            message: 'Слишком много запросов. Попробуйте позже.',
            retryAfter: limitResult.retryAfter
          },
          {
            status: 429,
            headers: {
              'Retry-After': String(limitResult.retryAfter),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': String(limitResult.resetTime)
            }
          }
        )
      }

      // 2. Проверка размера body
      const contentLength = request.headers.get('content-length')
      if (contentLength && parseInt(contentLength) > maxBodySize) {
        return NextResponse.json(
          { error: 'Request too large', message: 'Запрос слишком большой' },
          { status: 413 }
        )
      }

      // 3. Вызов оригинального handler
      const response = await handler(request)

      // 4. Добавляем rate limit headers к ответу
      response.headers.set('X-RateLimit-Remaining', String(limitResult.remaining))
      response.headers.set('X-RateLimit-Reset', String(limitResult.resetTime))

      return response
    } catch (error) {
      console.error('API Error:', error)

      // Не раскрываем детали ошибок пользователю
      return NextResponse.json(
        { error: 'Internal Server Error', message: 'Произошла ошибка на сервере' },
        { status: 500 }
      )
    }
  }
}

/**
 * Валидация и санитизация входных данных
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return ''

  return input
    .trim()
    .slice(0, 10000) // Ограничение длины
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '') // Удаление script тегов
    .replace(/javascript:/gi, '') // Удаление javascript: протокола
    .replace(/on\w+\s*=/gi, '') // Удаление event handlers
}

/**
 * Проверка, что объект содержит только разрешённые поля
 */
export function validateFields<T extends Record<string, unknown>>(
  data: T,
  allowedFields: (keyof T)[]
): Partial<T> {
  const result: Partial<T> = {}

  for (const field of allowedFields) {
    if (field in data) {
      result[field] = data[field]
    }
  }

  return result
}

/**
 * Логирование подозрительной активности
 */
export function logSuspiciousActivity(
  request: NextRequest,
  reason: string,
  details?: Record<string, unknown>
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    ip: getClientIP(request),
    path: request.nextUrl.pathname,
    method: request.method,
    userAgent: request.headers.get('user-agent'),
    reason,
    details
  }

  console.warn('[SECURITY] Suspicious activity:', JSON.stringify(logEntry))

  // В production можно отправлять в monitoring service (Sentry, LogRocket, etc.)
}
