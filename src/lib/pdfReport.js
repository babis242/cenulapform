import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

function sanitize(t) {
    if (t === null || t === undefined) return ''
    return String(t)
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2013\u2014]/g, '-')
        .replace(/[^\x00-\xFF]/g, ' ')
}

export async function generateSubjectReportPdf(groupedData) {
    var NAVY = rgb(0.09, 0.16, 0.32)
    var GRAY = rgb(0.4, 0.4, 0.4)
    var BORDER = rgb(0.75, 0.75, 0.75)

    var PAGE_W = 841.89 // A4 paysage : plus de place pour les colonnes
    var PAGE_H = 595.28
    var margin = 36
    var contentW = PAGE_W - margin * 2

    var pdfDoc = await PDFDocument.create()
    var font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    var fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    var page = pdfDoc.addPage([PAGE_W, PAGE_H])
    var y = PAGE_H - 40

    function newPage() {
        page = pdfDoc.addPage([PAGE_W, PAGE_H])
        y = PAGE_H - 40
    }

    function text(t, x, yy, opts) {
        opts = opts || {}
        page.drawText(sanitize(t), {
            x: x, y: yy,
            size: opts.size || 9,
            font: opts.bold ? fontBold : font,
            color: opts.color || rgb(0, 0, 0)
        })
    }

    function wrap(t, size, maxWidth) {
        t = sanitize(t)
        if (!t) return ['']
        var words = t.split(' ')
        var lines = []
        var current = ''
        for (var i = 0; i < words.length; i++) {
            var test = current ? current + ' ' + words[i] : words[i]
            if (font.widthOfTextAtSize(test, size) > maxWidth && current) {
                lines.push(current)
                current = words[i]
            } else {
                current = test
            }
        }
        if (current) lines.push(current)
        return lines
    }

    text('CENULAPE - Rapport des enseignements par domaine', margin, y, { bold: true, size: 14, color: NAVY })
    y -= 20
    text('Genere le ' + new Date().toLocaleDateString('fr-FR'), margin, y, { size: 8, color: GRAY })
    y -= 26

    var subjectColW = 220
    var teachersColW = contentW - subjectColW

    groupedData.forEach(function (domain) {
        if (y < 100) newPage()

        text(domain.domainLabel, margin, y, { bold: true, size: 12, color: NAVY })
        y -= 6
        page.drawLine({ start: { x: margin, y: y }, end: { x: margin + contentW, y: y }, thickness: 1, color: NAVY })
        y -= 16

        text('Matiere', margin, y, { bold: true, size: 8.5 })
        text('Enseignant(s) et disponibilites', margin + subjectColW, y, { bold: true, size: 8.5 })
        y -= 4
        page.drawLine({ start: { x: margin, y: y }, end: { x: margin + contentW, y: y }, thickness: 0.5, color: BORDER })
        y -= 12

        domain.subjects.forEach(function (subject) {
            var subjLines = wrap(subject.subjectLabel, 8.5, subjectColW - 10)

            var teacherLines = []
            if (subject.teachers.length === 0) {
                teacherLines.push('(aucun enseignant)')
            } else {
                subject.teachers.forEach(function (tch) {
                    var line = tch.fullName + '  -  ' + tch.availabilityText
                    var wrapped = wrap(line, 8.5, teachersColW - 10)
                    wrapped.forEach(function (l) { teacherLines.push(l) })
                })
            }

            var rowLines = Math.max(subjLines.length, teacherLines.length)
            var rowHeight = rowLines * 12 + 6

            if (y - rowHeight < 50) {
                newPage()
                text(domain.domainLabel + ' (suite)', margin, y, { bold: true, size: 12, color: NAVY })
                y -= 20
            }

            var rowTop = y
            subjLines.forEach(function (l, i) {
                text(l, margin, rowTop - i * 12, { size: 8.5 })
            })
            teacherLines.forEach(function (l, i) {
                text(l, margin + subjectColW, rowTop - i * 12, { size: 8.5 })
            })

            y = rowTop - rowHeight
            page.drawLine({ start: { x: margin, y: y + 3 }, end: { x: margin + contentW, y: y + 3 }, thickness: 0.3, color: BORDER })
        })

        y -= 20
    })

    return await pdfDoc.save()
}