import type { Material } from '@/types'
import { MATERIAL_TYPE_LABELS, DIFFICULTY_LABELS, GRADE_LABELS } from '@/types'

/**
 * Создаёт HTML для печати материала
 */
function createMaterialHTML(material: Material): string {
  const dateStr = material.publishedAt?.toDate?.()
    ? new Date(material.publishedAt.toDate()).toLocaleDateString('ru-RU')
    : new Date().toLocaleDateString('ru-RU')

  const gradesText = material.grades
    .map(g => GRADE_LABELS[g as keyof typeof GRADE_LABELS])
    .join(', ')

  // Очищаем HTML теги из контента
  const cleanText = material.content.text
    ? material.content.text
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .trim()
    : ''

  let questionsHTML = ''
  if (material.type === 'quiz' && material.content.questions && material.content.questions.length > 0) {
    questionsHTML = `
      <div class="section">
        <h2>Тестовые вопросы</h2>
        ${material.content.questions.map((q, i) => `
          <div class="question">
            <p class="question-text"><strong>${i + 1}. ${q.question}</strong></p>
            <div class="options">
              ${q.options.map((opt, j) => `
                <p class="option">${String.fromCharCode(65 + j)}) ${opt}</p>
              `).join('')}
            </div>
            <p class="answer">Ответ: ${String.fromCharCode(65 + q.correctAnswer)}</p>
            ${q.explanation ? `<p class="explanation">Пояснение: ${q.explanation}</p>` : ''}
          </div>
        `).join('')}
      </div>
    `
  }

  let filesHTML = ''
  if (material.content.files && material.content.files.length > 0) {
    filesHTML = `
      <div class="section">
        <h2>Прикрепленные файлы</h2>
        <ul>
          ${material.content.files.map(f => `<li>${f.name}</li>`).join('')}
        </ul>
      </div>
    `
  }

  const tagsHTML = material.tags && material.tags.length > 0
    ? `<p class="tags">Теги: ${material.tags.map(t => `#${t}`).join(' ')}</p>`
    : ''

  return `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="UTF-8">
      <title>${material.title}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          font-size: 12pt;
          line-height: 1.5;
          color: #333;
          padding: 20mm;
          max-width: 210mm;
          margin: 0 auto;
        }
        h1 {
          font-size: 20pt;
          margin-bottom: 10px;
          color: #1a1a1a;
        }
        h2 {
          font-size: 14pt;
          margin: 20px 0 10px;
          color: #333;
          border-bottom: 1px solid #ddd;
          padding-bottom: 5px;
        }
        .meta {
          color: #666;
          font-size: 10pt;
          margin-bottom: 5px;
        }
        .divider {
          border-top: 1px solid #ddd;
          margin: 15px 0;
        }
        .section {
          margin-bottom: 20px;
        }
        .content {
          white-space: pre-wrap;
          margin: 10px 0;
        }
        .question {
          margin-bottom: 15px;
          padding: 10px;
          background: #f9f9f9;
          border-radius: 5px;
        }
        .question-text {
          margin-bottom: 8px;
        }
        .options {
          margin-left: 20px;
        }
        .option {
          margin: 3px 0;
        }
        .answer {
          color: #2563eb;
          font-size: 10pt;
          margin-top: 8px;
        }
        .explanation {
          color: #666;
          font-size: 10pt;
          font-style: italic;
          margin-top: 5px;
        }
        .tags {
          color: #666;
          font-size: 10pt;
          margin-top: 15px;
        }
        .footer {
          margin-top: 30px;
          padding-top: 10px;
          border-top: 1px solid #ddd;
          font-size: 9pt;
          color: #999;
          text-align: center;
        }
        @media print {
          body { padding: 15mm; }
          .question { break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <h1>${material.title}</h1>
      <p class="meta">${MATERIAL_TYPE_LABELS[material.type]} | ${DIFFICULTY_LABELS[material.difficulty]} | ${material.subject}</p>
      <p class="meta">Курсы: ${gradesText}</p>
      <p class="meta">Автор: ${material.authorName} | Дата: ${dateStr}</p>

      <div class="divider"></div>

      ${material.description ? `
        <div class="section">
          <h2>Описание</h2>
          <p>${material.description}</p>
        </div>
      ` : ''}

      ${cleanText ? `
        <div class="section">
          <h2>Содержание</h2>
          <div class="content">${cleanText}</div>
        </div>
      ` : ''}

      ${material.content.videoUrl ? `
        <div class="section">
          <p><strong>Видео:</strong> ${material.content.videoUrl}</p>
        </div>
      ` : ''}

      ${questionsHTML}
      ${filesHTML}
      ${tagsHTML}

      <div class="footer">
        Методическая копилка | ${new Date().toLocaleDateString('ru-RU')}
      </div>
    </body>
    </html>
  `
}

/**
 * Создаёт HTML для теста (печать)
 */
function createQuizHTML(material: Material, showAnswers: boolean): string {
  if (!material.content.questions) {
    throw new Error('Материал не содержит вопросов')
  }

  const questionsHTML = material.content.questions.map((q, i) => `
    <div class="question">
      <p class="question-text"><strong>${i + 1}. ${q.question}</strong></p>
      <div class="options">
        ${q.options.map((opt, j) => {
          const isCorrect = j === q.correctAnswer
          const correctMark = showAnswers && isCorrect ? ' <span class="correct">[ВЕРНО]</span>' : ''
          return `<p class="option ${showAnswers && isCorrect ? 'correct-option' : ''}">${String.fromCharCode(65 + j)}) ${opt}${correctMark}</p>`
        }).join('')}
      </div>
      ${showAnswers && q.explanation ? `<p class="explanation">Пояснение: ${q.explanation}</p>` : ''}
    </div>
  `).join('')

  // Бланк ответов (только если без ответов)
  let answerSheetHTML = ''
  if (!showAnswers) {
    const cells = material.content.questions.map((_, i) =>
      `<div class="answer-cell">${i + 1}</div>`
    ).join('')
    answerSheetHTML = `
      <div class="answer-sheet">
        <h3>Бланк ответов:</h3>
        <div class="answer-grid">${cells}</div>
      </div>
    `
  }

  return `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="UTF-8">
      <title>${material.title}${showAnswers ? ' (с ответами)' : ''}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          font-size: 11pt;
          line-height: 1.4;
          color: #333;
          padding: 15mm;
          max-width: 210mm;
          margin: 0 auto;
        }
        h1 {
          font-size: 16pt;
          margin-bottom: 5px;
        }
        .meta {
          color: #666;
          font-size: 10pt;
          margin-bottom: 10px;
        }
        .student-info {
          margin: 15px 0;
          padding: 10px;
          border: 1px solid #ddd;
          background: #f9f9f9;
        }
        .student-info p {
          margin: 5px 0;
        }
        .divider {
          border-top: 1px solid #333;
          margin: 15px 0;
        }
        .question {
          margin-bottom: 15px;
          page-break-inside: avoid;
        }
        .question-text {
          margin-bottom: 5px;
        }
        .options {
          margin-left: 15px;
        }
        .option {
          margin: 2px 0;
        }
        .correct-option {
          font-weight: bold;
          color: #16a34a;
        }
        .correct {
          color: #16a34a;
          font-weight: bold;
        }
        .explanation {
          color: #666;
          font-size: 9pt;
          font-style: italic;
          margin-top: 5px;
          margin-left: 15px;
        }
        .answer-sheet {
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px solid #333;
        }
        .answer-sheet h3 {
          font-size: 11pt;
          margin-bottom: 10px;
        }
        .answer-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }
        .answer-cell {
          width: 30px;
          height: 30px;
          border: 1px solid #333;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10pt;
        }
        @media print {
          body { padding: 10mm; }
          .question { break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <h1>${material.title}</h1>
      <p class="meta">${material.subject} | ${material.content.questions.length} вопросов</p>

      ${!showAnswers ? `
        <div class="student-info">
          <p>ФИО: _________________________________________________</p>
          <p>Дата: ________________  Группа: ________________</p>
        </div>
      ` : ''}

      <div class="divider"></div>

      ${questionsHTML}
      ${answerSheetHTML}
    </body>
    </html>
  `
}

/**
 * Открывает окно печати с содержимым
 */
function printHTML(html: string, fileName: string): void {
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('Пожалуйста, разрешите всплывающие окна для скачивания PDF')
    return
  }

  printWindow.document.write(html)
  printWindow.document.close()

  // Ждём загрузки и запускаем печать
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }
}

/**
 * Экспорт материала в PDF через печать браузера
 */
export async function exportMaterialToPDF(material: Material): Promise<void> {
  const html = createMaterialHTML(material)
  const fileName = `${material.title.replace(/[^a-zA-Zа-яА-Я0-9]/g, '_')}.pdf`
  printHTML(html, fileName)
}

/**
 * Экспорт теста в PDF через печать браузера
 */
export async function exportQuizToPDF(material: Material, showAnswers: boolean = false): Promise<void> {
  if (material.type !== 'quiz' || !material.content.questions) {
    throw new Error('Материал не является тестом')
  }

  const html = createQuizHTML(material, showAnswers)
  const suffix = showAnswers ? '_с_ответами' : '_для_печати'
  const fileName = `${material.title.replace(/[^a-zA-Zа-яА-Я0-9]/g, '_')}${suffix}.pdf`
  printHTML(html, fileName)
}
