import { useState } from 'react'
import { useForm } from '../lib/FormContext.jsx'
import { t } from '../lib/i18n.js'

export default function IdentityStep({ onBack, onNext }) {
    const form = useForm()
    const lang = form.language
    const [error, setError] = useState('')

    function handleNext() {
        if (!form.fullName.trim() || !form.contact.trim()) {
            setError(t(lang, 'errRequired'))
            return
        }
        setError('')
        onNext()
    }

    return (
        <div>
            <p className="text-blue-600 font-bold text-xs sm:text-sm uppercase tracking-wide mb-3">
                {t(lang, 'cycleEyebrowTpl', { current: 2, total: 6 })}
            </p>
            <h1 className="text-2xl sm:text-4xl font-extrabold leading-tight mb-3 break-words">
                {t(lang, 'identityTitle')}
            </h1>
            <p className="text-neutral-500 text-sm sm:text-base mb-8">
                {t(lang, 'identitySubtitle')}
            </p>

            <div className="mb-5">
                <label className="block font-bold text-sm mb-2" htmlFor="fullName">
                    {t(lang, 'nameLabel')}
                </label>
                <input
                    id="fullName"
                    type="text"
                    value={form.fullName}
                    onChange={e => form.setFullName(e.target.value)}
                    placeholder={t(lang, 'namePlaceholder')}
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-blue-600"
                />
            </div>

            <div className="mb-6">
                <label className="block font-bold text-sm mb-2" htmlFor="contact">
                    {t(lang, 'contactLabel')}
                </label>
                <input
                    id="contact"
                    type="tel"
                    value={form.contact}
                    onChange={e => form.setContact(e.target.value)}
                    placeholder={t(lang, 'contactPlaceholder')}
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-blue-600"
                />
            </div>

            {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

            <div className="flex justify-between items-center gap-3">
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
