import { useForm } from '../lib/FormContext.jsx'
import { t } from '../lib/i18n.js'

function niveauLabel(lang, niveau) {
    if (niveau === 'I') return t(lang, 'niveauI')
    if (niveau === 'II') return t(lang, 'niveauII')
    return t(lang, 'niveauBoth')
}

export default function SubjectsStep({ domain, index, total, onBack, onNext }) {
    const form = useForm()
    const lang = form.language

    if (!domain) return null

    const selected = form.subjectSelections[domain.id] || []

    return (
        <div>
            <p className="text-blue-600 font-bold text-xs sm:text-sm uppercase tracking-wide mb-3">
                {lang === 'en' ? `Domain ${index + 1} of ${total}` : `Domaine ${index + 1} sur ${total}`}
            </p>
            <h1 className="text-2xl sm:text-4xl font-extrabold leading-tight mb-3 break-words">
                {domain.label}
            </h1>
            <p className="text-neutral-500 text-sm sm:text-base mb-1">
                {t(lang, 'subjectsSubtitle')}
            </p>
            <p className="text-neutral-400 text-xs sm:text-sm mb-6 italic">
                {lang === 'en'
                    ? "No matching subject? You can simply move on."
                    : "Aucune matière ne vous correspond ? Vous pouvez simplement passer à la suite."}
            </p>

            <div className="border border-neutral-200 rounded-2xl divide-y divide-neutral-100 max-h-[50vh] overflow-y-auto">
                {domain.subjects.map(subject => {
                    const checked = selected.includes(subject.id)
                    const inputId = `${domain.id}-${subject.id}`
                    return (
                        <label
                            key={subject.id}
                            htmlFor={inputId}
                            className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-neutral-50 transition-colors"
                        >
                            <input
                                id={inputId}
                                type="checkbox"
                                checked={checked}
                                onChange={() => form.toggleSubject(domain.id, subject.id)}
                                className="w-4 h-4 accent-blue-600 shrink-0"
                            />
                            <span className="flex-1 text-sm sm:text-base">{subject.label}</span>
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 rounded-full px-2.5 py-1 shrink-0 whitespace-nowrap">
                                {niveauLabel(lang, subject.niveau)}
                            </span>
                        </label>
                    )
                })}
            </div>

            <div className="flex justify-between items-center gap-3 mt-8">
                <button
                    onClick={onBack}
                    className="text-neutral-500 hover:text-neutral-900 font-bold text-sm sm:text-base px-4 py-3 transition-colors"
                >
                    {t(lang, 'back')}
                </button>
                <button
                    onClick={onNext}
                    className="bg-neutral-900 hover:bg-blue-600 text-white font-bold rounded-full px-6 sm:px-8 py-3 text-sm sm:text-base transition-colors"
                >
                    {t(lang, 'next')}
                </button>
            </div>
        </div>
    )
}