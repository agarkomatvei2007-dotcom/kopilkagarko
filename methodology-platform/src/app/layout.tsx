import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "Методическая копилка - Платформа для учителей",
  description: "Делитесь учебными материалами, общайтесь с коллегами, обменивайтесь опытом. Платформа для учителей с AI-функциями, геймификацией и социальными возможностями.",
  keywords: ["учитель", "образование", "материалы", "уроки", "школа", "методика", "ФГОС"],
  authors: [{ name: "Методическая копилка" }],
  openGraph: {
    title: "Методическая копилка",
    description: "Платформа для обмена учебными материалами между учителями",
    type: "website",
    locale: "ru_RU",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
