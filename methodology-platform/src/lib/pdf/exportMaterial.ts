import jsPDF from 'jspdf'
import type { Material } from '@/types'
import { MATERIAL_TYPE_LABELS, DIFFICULTY_LABELS, GRADE_LABELS } from '@/types'

/**
 * Экспорт материала в PDF
 */
export async function exportMaterialToPDF(material: Material): Promise<void> {
  // Создаём PDF документ (A4)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - margin * 2
  let yPosition = margin

  // Загружаем шрифт для кириллицы (используем встроенный)
  doc.setFont('helvetica')

  // Функция для добавления новой страницы если нужно
  const checkPageBreak = (height: number) => {
    if (yPosition + height > pageHeight - margin) {
      doc.addPage()
      yPosition = margin
    }
  }

  // Функция для переноса длинного текста
  const addWrappedText = (text: string, fontSize: number, maxWidth: number): number => {
    doc.setFontSize(fontSize)
    const lines = doc.splitTextToSize(text, maxWidth)
    const lineHeight = fontSize * 0.4

    for (const line of lines) {
      checkPageBreak(lineHeight)
      doc.text(line, margin, yPosition)
      yPosition += lineHeight
    }

    return lines.length * lineHeight
  }

  // === ЗАГОЛОВОК ===
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  const titleLines = doc.splitTextToSize(material.title, contentWidth)
  for (const line of titleLines) {
    checkPageBreak(10)
    doc.text(line, margin, yPosition)
    yPosition += 10
  }
  yPosition += 5

  // === МЕТАДАННЫЕ ===
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)

  // Тип и сложность
  const metaLine1 = `${MATERIAL_TYPE_LABELS[material.type]} | ${DIFFICULTY_LABELS[material.difficulty]} | ${material.subject}`
  doc.text(metaLine1, margin, yPosition)
  yPosition += 5

  // Курсы
  const gradesText = material.grades.map(g => GRADE_LABELS[g as keyof typeof GRADE_LABELS]).join(', ')
  doc.text(`Курсы: ${gradesText}`, margin, yPosition)
  yPosition += 5

  // Автор и дата
  const dateStr = material.publishedAt?.toDate?.()
    ? new Date(material.publishedAt.toDate()).toLocaleDateString('ru-RU')
    : new Date().toLocaleDateString('ru-RU')
  doc.text(`Автор: ${material.authorName} | Дата: ${dateStr}`, margin, yPosition)
  yPosition += 10

  // Линия-разделитель
  doc.setDrawColor(200, 200, 200)
  doc.line(margin, yPosition, pageWidth - margin, yPosition)
  yPosition += 10

  // === ОПИСАНИЕ ===
  if (material.description) {
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Описание', margin, yPosition)
    yPosition += 7

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    addWrappedText(material.description, 11, contentWidth)
    yPosition += 8
  }

  // === КОНТЕНТ ===
  if (material.content.text) {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    checkPageBreak(15)
    doc.text('Содержание', margin, yPosition)
    yPosition += 7

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)

    // Очищаем HTML теги
    const cleanText = material.content.text
      .replace(/<[^>]*>/g, '') // Убираем HTML теги
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .trim()

    addWrappedText(cleanText, 11, contentWidth)
    yPosition += 8
  }

  // === ТЕСТ (если есть) ===
  if (material.type === 'quiz' && material.content.questions && material.content.questions.length > 0) {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    checkPageBreak(15)
    doc.text('Тестовые вопросы', margin, yPosition)
    yPosition += 10

    material.content.questions.forEach((question, qIndex) => {
      checkPageBreak(30)

      // Вопрос
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      const questionText = `${qIndex + 1}. ${question.question}`
      addWrappedText(questionText, 11, contentWidth)
      yPosition += 3

      // Варианты ответа
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      question.options.forEach((option, oIndex) => {
        checkPageBreak(6)
        const optionLetter = String.fromCharCode(65 + oIndex) // A, B, C, D...
        const optionText = `   ${optionLetter}) ${option}`
        doc.text(optionText, margin, yPosition)
        yPosition += 5
      })

      // Правильный ответ (мелким шрифтом)
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      const correctLetter = String.fromCharCode(65 + question.correctAnswer)
      doc.text(`Правильный ответ: ${correctLetter}`, margin, yPosition)
      yPosition += 4

      // Объяснение (если есть)
      if (question.explanation) {
        doc.setFontSize(9)
        const explanationText = `Пояснение: ${question.explanation}`
        addWrappedText(explanationText, 9, contentWidth)
      }

      doc.setTextColor(0, 0, 0)
      yPosition += 6
    })
  }

  // === ВИДЕО (если есть) ===
  if (material.content.videoUrl) {
    checkPageBreak(15)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text('Видео: ' + material.content.videoUrl, margin, yPosition)
    yPosition += 8
  }

  // === ФАЙЛЫ (если есть) ===
  if (material.content.files && material.content.files.length > 0) {
    checkPageBreak(15)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Прикрепленные файлы', margin, yPosition)
    yPosition += 7

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    material.content.files.forEach((file, index) => {
      checkPageBreak(6)
      doc.text(`${index + 1}. ${file.name}`, margin, yPosition)
      yPosition += 5
    })
    yPosition += 5
  }

  // === ТЕГИ ===
  if (material.tags && material.tags.length > 0) {
    checkPageBreak(15)
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    const tagsText = 'Теги: ' + material.tags.map(t => `#${t}`).join(' ')
    doc.text(tagsText, margin, yPosition)
    yPosition += 8
  }

  // === ФУТЕР ===
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(
      `Страница ${i} из ${totalPages} | Методическая копилка`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    )
  }

  // Скачиваем файл
  const fileName = `${material.title.replace(/[^a-zA-Zа-яА-Я0-9]/g, '_')}.pdf`
  doc.save(fileName)
}

/**
 * Экспорт только теста в PDF (для печати)
 */
export async function exportQuizToPDF(material: Material, showAnswers: boolean = false): Promise<void> {
  if (material.type !== 'quiz' || !material.content.questions) {
    throw new Error('Материал не является тестом')
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - margin * 2
  let yPosition = margin

  const checkPageBreak = (height: number) => {
    if (yPosition + height > pageHeight - margin) {
      doc.addPage()
      yPosition = margin
    }
  }

  // Заголовок
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(material.title, margin, yPosition)
  yPosition += 10

  // Метаданные
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text(`${material.subject} | ${material.content.questions.length} вопросов`, margin, yPosition)
  yPosition += 5

  // ФИО ученика
  doc.text('ФИО: ___________________________________', margin, yPosition)
  yPosition += 5
  doc.text('Дата: ____________  Группа: ____________', margin, yPosition)
  yPosition += 10

  doc.setDrawColor(200, 200, 200)
  doc.line(margin, yPosition, pageWidth - margin, yPosition)
  yPosition += 10

  doc.setTextColor(0, 0, 0)

  // Вопросы
  material.content.questions.forEach((question, qIndex) => {
    checkPageBreak(40)

    // Вопрос
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    const questionLines = doc.splitTextToSize(`${qIndex + 1}. ${question.question}`, contentWidth)
    for (const line of questionLines) {
      doc.text(line, margin, yPosition)
      yPosition += 5
    }
    yPosition += 2

    // Варианты
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    question.options.forEach((option, oIndex) => {
      checkPageBreak(7)
      const letter = String.fromCharCode(65 + oIndex)
      const isCorrect = oIndex === question.correctAnswer

      if (showAnswers && isCorrect) {
        doc.setFont('helvetica', 'bold')
        doc.text(`   ${letter}) ${option} [ВЕРНО]`, margin, yPosition)
        doc.setFont('helvetica', 'normal')
      } else {
        doc.text(`   ${letter}) ${option}`, margin, yPosition)
      }
      yPosition += 6
    })

    yPosition += 5
  })

  // Если без ответов - добавляем таблицу для ответов
  if (!showAnswers) {
    checkPageBreak(30)
    yPosition += 5
    doc.setDrawColor(200, 200, 200)
    doc.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 8

    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Бланк ответов:', margin, yPosition)
    yPosition += 6

    doc.setFont('helvetica', 'normal')
    const questionsPerRow = 10
    const cellWidth = 12
    const cellHeight = 8

    for (let i = 0; i < material.content.questions.length; i++) {
      if (i % questionsPerRow === 0 && i > 0) {
        yPosition += cellHeight + 2
        checkPageBreak(cellHeight + 5)
      }
      const x = margin + (i % questionsPerRow) * cellWidth
      doc.rect(x, yPosition, cellWidth, cellHeight)
      doc.text(String(i + 1), x + cellWidth / 2, yPosition + cellHeight / 2 + 1, { align: 'center' })
    }
    yPosition += cellHeight + 8
  }

  // Футер
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(
      `${i}/${totalPages}`,
      pageWidth - margin,
      pageHeight - 10,
      { align: 'right' }
    )
  }

  const suffix = showAnswers ? '_с_ответами' : '_для_печати'
  const fileName = `${material.title.replace(/[^a-zA-Zа-яА-Я0-9]/g, '_')}${suffix}.pdf`
  doc.save(fileName)
}
