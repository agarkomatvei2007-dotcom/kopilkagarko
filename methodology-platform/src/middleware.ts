import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Rate Limiting Store (работает на Edge)
 * Примечание: В Edge Runtime нельзя использовать общий store между запросами,
 * поэтому для production рекомендуется Vercel KV или Upstash Redis
 */

// Простая проверка на подозрительные запросы
function isSuspiciousRequest(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent') || ''

  // Блокируем известные боты и сканеры
  const suspiciousPatterns = [
    /sqlmap/i,
    /nikto/i,
    /nmap/i,
    /masscan/i,
    /zgrab/i,
    /python-requests\/\d/i, // Блокируем базовые скрипты
    /curl\/\d/i, // Блокируем curl без кастомного UA
  ]

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(userAgent)) {
      return true
    }
  }

  return false
}

// Проверка на SQL injection и XSS в URL
function hasInjectionAttempt(url: string): boolean {
  const dangerousPatterns = [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i, // SQL injection
    /<script[\s\S]*?>[\s\S]*?<\/script>/i, // XSS
    /javascript:/i,
    /on\w+\s*=/i, // Event handlers
    /union\s+select/i,
    /drop\s+table/i,
    /insert\s+into/i,
    /delete\s+from/i,
  ]

  for (const pattern of dangerousPatterns) {
    if (pattern.test(decodeURIComponent(url))) {
      return true
    }
  }

  return false
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Добавляем security headers ко всем ответам
  const response = NextResponse.next()

  // Security Headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  )

  // Content Security Policy (не слишком строгий для работы с Firebase)
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.firebaseapp.com https://*.googleapis.com https://apis.google.com https://accounts.google.com https://*.gstatic.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: blob: https://*.googleusercontent.com https://*.firebasestorage.app https://firebasestorage.googleapis.com https://*.gstatic.com; " +
    "media-src 'self' blob: https://*.firebasestorage.app https://firebasestorage.googleapis.com; " +
    "connect-src 'self' https://*.firebase.com https://*.firebaseio.com https://*.googleapis.com https://*.cloudfunctions.net wss://*.firebaseio.com https://accounts.google.com https://securetoken.googleapis.com https://identitytoolkit.googleapis.com https://apis.google.com; " +
    "frame-src 'self' https://*.firebaseapp.com https://accounts.google.com;"
  )

  // Проверка на подозрительные запросы
  if (isSuspiciousRequest(request)) {
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    console.warn(`Blocked suspicious request from ${clientIP}: ${request.headers.get('user-agent')}`)
    return new NextResponse('Forbidden', { status: 403 })
  }

  // Проверка на injection attacks
  if (hasInjectionAttempt(request.url)) {
    console.warn(`Blocked injection attempt: ${request.url}`)
    return new NextResponse('Bad Request', { status: 400 })
  }

  // Для API routes - добавляем дополнительные проверки
  if (pathname.startsWith('/api/')) {
    // Проверяем Content-Type для POST запросов
    if (request.method === 'POST') {
      const contentType = request.headers.get('content-type')
      if (!contentType?.includes('application/json')) {
        // Разрешаем multipart для загрузки файлов
        if (!contentType?.includes('multipart/form-data')) {
          return new NextResponse('Invalid Content-Type', { status: 415 })
        }
      }
    }

    // Добавляем заголовки для предотвращения кэширования API
    response.headers.set('Cache-Control', 'no-store, max-age=0')
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
