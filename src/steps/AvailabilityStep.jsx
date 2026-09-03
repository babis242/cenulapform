import { useState } from 'react'
import { t } from '../lib/i18n.js'
import { useForm } from '../lib/FormContext.jsx'
import { submitTeacherForm } from '../lib/submit.js'

const DAYS = ['L', 'M1', 'M2', 'J', 'V', 'S']
const SLOTS = ['08h-12h', '13h-17h']

export default function AvailabilityStep({ onBack, onSubmitted }) {
    const form = useForm()
    const lang = form.language
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    async function handleSubmit() {
        setSubmitting(true)
        setError('')
        try {
            const result = await submitTeacherForm(form)
            onSubmitted(result)
        } catch (e) {
            console.error(e)
            setError(e.message || 'Une erreur est survenue. Veuillez réessayer.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div>
            <p className="text-blue-600 font-bold text-xs sm:text-sm uppercase tracking-wide mb-3">
                {t(lang, 'cycleEyebrowTpl', { current: 5, total: 6 })}
            </p>
            <h1 className="text-2xl sm:text-4xl font-extrabold leading-tight mb-3 break-words">
                {t(lang, 'availabilityTitle')}
            </h1>
            <p className="text-neutral-500 text-sm sm:text-base mb-8">
                {t(lang, 'availabilitySubtitle')}
            </p>

            <div className="border border-neutral-200 rounded-2xl p-3 sm:p-4 overflow-x-auto">
                <div className="grid grid-cols-[60px_repeat(6,1fr)] sm:grid-cols-[80px_repeat(6,1fr)] gap-1.5 min-w-[420px]">
                    <div />
                    {DAYS.map(day => (
                        <div key={day} className="text-center text-xs font-bold text-neutral-500">
                            {t(lang, 'days')[day]}
                        </div>
                    ))}

                    {SLOTS.map(slot => (
                        <>
                            <div key={`label-${slot}`} className="flex items-center text-xs text-neutral-500 pr-1">
                                {t(lang, 'slots')[slot]}
                            </div>
                            {DAYS.map(day => {
                                const key = `${day}_${slot}`
                                const checked = !!form.availability[key]
                                return (
                                    <button
                                        key={key}
                                        onClick={() => form.toggleAvailability(day, slot)}
                                        disabled={submitting}
                                        className={`aspect-square rounded-lg border flex items-center justify-center text-sm font-bold transition-colors ${checked
                                            ? 'bg-blue-600 border-blue-600 text-white'
                                            : 'border-neutral-200 hover:border-blue-600'
                                            }`}
                                    >
                                        {checked ? '✓' : ''}
                                    </button>
                                )
                            })}
                        </>
                    ))}
                </div>
            </div>

            {error && <p className="text-red-600 text-sm mt-4">{error}</p>}

            <div className="flex justify-between items-center gap-3 mt-8">
                <button
                    onClick={onBack}
                    disabled={submitting}
                    className="text-neutral-500 hover:text-neutral-900 font-bold text-sm sm:text-base px-4 py-3 transition-colors"
                >
                    {t(lang, 'back')}
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="bg-neutral-900 hover:bg-blue-600 disabled:opacity-50 text-white font-bold rounded-full px-6 sm:px-8 py-3 text-sm sm:text-base transition-colors"
                >
                    {submitting ? t(lang, 'submitting') : t(lang, 'submit')}
                </button>
            </div>
        </div>
    )
}