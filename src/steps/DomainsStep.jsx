import { useState } from 'react'
import { useForm } from '../lib/FormContext.jsx'
import { t } from '../lib/i18n.js'

export default function DomainsStep({ onBack, onNext }) {
    const form = useForm()
    const lang = form.language
    const [error, setError] = useState('')

    function handleNext() {
        if (form.selectedDomainIds.length === 0) {
            setError(t(lang, 'errPickOneDomain'))
            return
        }
        setError('')
        onNext()
    }

    return (
        <div>
            <p className="text-blue-600 font-bold text-xs sm:text-sm uppercase tracking-wide mb-3">
                {t(lang, 'cycleEyebrowTpl', { current: 3, total: 6 })}
            </p>
            <h1 className="text-2xl sm:text-4xl font-extrabold leading-tight mb-3 break-words">
                {t(lang, 'domainsTitle')}
            </h1>
            <p className="text-neutral-500 text-sm sm:text-base mb-8">
                {t(lang, 'domainsSubtitle')}
            </p>

            <div className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto pr-1">
                {form.availableDomains.map(domain => {
                    const selected = form.selectedDomainIds.includes(domain.id)
                    return (
                        <button
                            key={domain.id}
                            onClick={() => form.toggleDomain(domain.id)}
                            className={`w-full text-left border rounded-2xl px-5 py-4 transition-colors flex items-start gap-3 ${selected
                                    ? 'border-blue-600 bg-blue-50/60'
                                    : 'border-neutral-200 hover:border-blue-600'
                                }`}
                        >
                            <span
                                className={`mt-1 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${selected ? 'border-blue-600 bg-blue-600' : 'border-neutral-300'
                                    }`}
                            >
                                {selected && (
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                        <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                            </span>
                            <span>
                                <span className="block font-bold text-base">{domain.label}</span>
                                <span className="block text-neutral-500 text-xs sm:text-sm">
                                    {domain.filieres.join(' · ')}
                                </span>
                            </span>
                        </button>
                    )
                })}
            </div>

            {error && <p className="text-red-600 text-sm mt-4">{error}</p>}

            <div className="flex justify-between items-center gap-3 mt-8">
                <button
                    onClick={onBack}
                    className="text-neutral-500 hover:text-neutral-900 font-bold text-sm sm:text-base px-4 py-3 transition-colors"
                >
                    {t(lang, 'back')}
                </button>
                <button
                    onClick={handleNext}
                    className="bg-neutral-900 hover:bg-blue-600 text-white font-bold rounded-full px-6 sm:px-8 py-3 text-sm sm:text-base transition-colors"
                >
                    {t(lang, 'next')}
                </button>
            </div>
        </div>
    )
}