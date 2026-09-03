import { useEffect } from 'react'

function WhatsappButton(props) {
    var url = props.url
    var label = props.label
    return (
        <a href={url} target="_blank" rel="noreferrer" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full px-8 py-3 text-sm sm:text-base transition-colors mr-3">
            {label}
        </a>
    )
}

function PdfLink(props) {
    var url = props.url
    var label = props.label
    return (
        <a href={url} target="_blank" rel="noreferrer" className="inline-block text-neutral-500 hover:text-neutral-900 font-bold text-sm sm:text-base px-4 py-3 transition-colors">
            {label}
        </a>
    )
}

export default function ConfirmationStep(props) {
    var language = props.language
    var result = props.result
    var isEn = language === 'en'

    useEffect(function () {
        if (result && result.whatsappUrl) {
            window.open(result.whatsappUrl, '_blank')
        }
    }, [result])

    var title = isEn ? 'Form submitted successfully' : 'Fiche envoyee avec succes'
    var body = isEn
        ? 'Your PDF has been generated. WhatsApp will open to send it.'
        : 'Votre PDF a ete genere. WhatsApp va s ouvrir pour l envoyer.'
    var waLabel = isEn ? 'Open WhatsApp' : 'Ouvrir WhatsApp'
    var pdfLabel = isEn ? 'Download PDF' : 'Telecharger le PDF'

    var hasWhatsapp = Boolean(result && result.whatsappUrl)
    var hasPdf = Boolean(result && result.pdfUrl)

    return (
        <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-green-600 text-white flex items-center justify-center text-2xl mx-auto mb-6">
                OK
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold leading-tight mb-3">{title}</h1>
            <p className="text-neutral-500 text-sm sm:text-base max-w-md mx-auto mb-8">{body}</p>

            {hasWhatsapp && <WhatsappButton url={result.whatsappUrl} label={waLabel} />}
            {hasPdf && <PdfLink url={result.pdfUrl} label={pdfLabel} />}
        </div>
    )
}