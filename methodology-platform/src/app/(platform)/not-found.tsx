import Link from 'next/link'
import { FileQuestion, Home, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function NotFound() {
  return (
    <div className="container mx-auto py-16 px-4 flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <FileQuestion className="h-8 w-8 text-emerald-600" />
          </div>
          <CardTitle className="text-2xl">Страница не найдена</CardTitle>
          <CardDescription>
            К сожалению, запрашиваемая страница не существует или была удалена.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button asChild variant="default">
              <Link href="/feed">
                <Home className="mr-2 h-4 w-4" />
                На главную
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/explore">
                <Search className="mr-2 h-4 w-4" />
                Найти материалы
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
