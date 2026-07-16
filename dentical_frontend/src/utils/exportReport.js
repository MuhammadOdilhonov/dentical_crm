// Hisobotlarni Excel (.xls) faylga eksport qilish utiliti.
// Tashqi kutubxonasiz ishlaydi: HTML-jadval formatini Excel to'g'ridan-to'g'ri ochadi,
// UTF-8 BOM kirill/lotin belgilarining to'g'ri chiqishini ta'minlaydi.

const escapeHtml = (value) => {
    if (value === null || value === undefined) return ""
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
}

/**
 * Hisobotni Excel faylga eksport qiladi.
 * @param {Object} options
 * @param {string} options.title - Hisobot sarlavhasi (fayl ichida ko'rinadi)
 * @param {string} options.subtitle - Davr/filial haqida qo'shimcha qator
 * @param {Array} options.sections - [{ heading, summary: [[label, value]], columns: [], rows: [[]] }]
 * @param {string} options.fileName - Fayl nomi (.xls siz)
 */
export function exportReportToExcel({ title, subtitle = "", sections = [], fileName = "hisobot" }) {
    const sectionHtml = sections
        .map((section) => {
            let html = ""
            if (section.heading) {
                html += `<h3 style="margin:16px 0 4px">${escapeHtml(section.heading)}</h3>`
            }
            if (section.summary && section.summary.length > 0) {
                html += `<table border="1" cellspacing="0" cellpadding="4" style="border-collapse:collapse">`
                html += section.summary
                    .map(
                        ([label, value]) =>
                            `<tr><td style="font-weight:bold;background:#eef3f8">${escapeHtml(label)}</td><td>${escapeHtml(value)}</td></tr>`,
                    )
                    .join("")
                html += `</table><br/>`
            }
            if (section.columns && section.columns.length > 0) {
                html += `<table border="1" cellspacing="0" cellpadding="4" style="border-collapse:collapse">`
                html += `<tr>${section.columns
                    .map((col) => `<th style="background:#2b6cb0;color:#ffffff">${escapeHtml(col)}</th>`)
                    .join("")}</tr>`
                html += (section.rows || [])
                    .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`)
                    .join("")
                html += `</table>`
            }
            return html
        })
        .join("<br/>")

    const documentHtml = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
<head>
<meta charset="UTF-8" />
<!--[if gte mso 9]><xml>
<x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
<x:Name>${escapeHtml(title).substring(0, 30)}</x:Name>
<x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
</x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook>
</xml><![endif]-->
</head>
<body>
<h2>${escapeHtml(title)}</h2>
${subtitle ? `<p>${escapeHtml(subtitle)}</p>` : ""}
${sectionHtml}
</body>
</html>`

    // ﻿ — UTF-8 BOM, Excelda kirill/lotin harflari buzilmasligi uchun
    const blob = new Blob(["﻿" + documentHtml], { type: "application/vnd.ms-excel;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${fileName}.xls`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

export default exportReportToExcel
