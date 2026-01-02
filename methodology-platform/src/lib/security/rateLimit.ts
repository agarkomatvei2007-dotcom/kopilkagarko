/**
 * Rate Limiting для защиты от DDoS и спама
 * In-memory store - работает для одного сервера
 * Для production с несколькими серверами используйте Redis
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory store для rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>()

// Очистка старых записей каждые 5 минут
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

export interface RateLimitConfig {
  windowMs: number      // Временное окно в миллисекундах
  maxRequests: number   // Максимум запросов за окно
  blockDuration?: number // Время блокировки после превышения (мс)
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  retryAfter?: number
}

/**
 * Проверяет rate limit для ключа (обычно IP или userId)
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  // Если записи нет или время сброшено - создаём новую
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs
    })
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs
    }
  }

  // Увеличиваем счётчик
  entry.count++

  // Проверяем лимит
  if (entry.count > config.maxRequests) {
    // Если есть blockDuration - продлеваем блокировку
    if (config.blockDuration) {
      entry.resetTime = now + config.blockDuration
    }
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter: Math.ceil((entry.resetTime - now) / 1000)
    }
  }

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime
  }
}

/**
 * Предустановленные конфигурации для разных типов endpoints
 */
export const RATE_LIMITS = {
  // Общий API - 100 запросов в минуту
  api: {
    windowMs: 60 * 1000,
    maxRequests: 100,
    blockDuration: 60 * 1000
  },

  // AI генерация - 10 запросов в минуту (дорогие операции)
  aiGeneration: {
    windowMs: 60 * 1000,
    maxRequests: 10,
    blockDuration: 2 * 60 * 1000
  },

  // Аутентификация - 5 попыток в 15 минут
  auth: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
    blockDuration: 30 * 60 * 1000
  },

  // Отправка сообщений - 30 в минуту
  messaging: {
    windowMs: 60 * 1000,
    maxRequests: 30,
    blockDuration: 60 * 1000
  },

  // Загрузка файлов - 20 в час
  fileUpload: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 20,
    blockDuration: 60 * 60 * 1000
  },

  // Создание материалов - 20 в час
  createMaterial: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 20,
    blockDuration: 30 * 60 * 1000
  }
} as const

/**
 * Получить IP из запроса
 */
export function getClientIP(request: Request): string {
  // Vercel/Cloudflare добавляют эти заголовки
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  // Fallback
  return 'unknown'
}
