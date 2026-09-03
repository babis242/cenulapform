import { useForm } from '../lib/FormContext.jsx'

export default function CycleStep({ onNext }) {
    const form = useForm()

    const options = [
        { value: 'BTS', title: 'BTS', desc: 'Formulaire en français' },
        { value: 'HND', title: 'HND', desc: 'Form in English' },
        { value: 'BTS_HND', title: 'BTS et HND', desc: 'Formulaire en français' }
    ]

    function choose(value) {
        form.setCycle(value)
        onNext()
    }

    return (
        <div>
            <p className="text-blue-600 font-bold text-xs sm:text-sm uppercase tracking-wide mb-3">
                Étape 1 sur 6 · Step 1 of 6
            </p>
            <h1 className="text-2xl sm:text-4xl font-extrabold leading-tight mb-3">
                Pour quel cycle souhaitez-vous enseigner ?
            </h1>
            <p className="text-neutral-500 text-sm sm:text-base mb-8">
                Ce choix détermine la langue du formulaire.
            </p>

            <div className="flex flex-col gap-3">
                {options.map(opt => (
                    <button
                        key={opt.value}
                        onClick={() => choose(opt.value)}
                        className="w-full text-left border border-neutral-200 hover:border-blue-600 hover:bg-blue-50/50 rounded-2xl px-5 py-4 transition-colors"
                    >
                        <div className="font-bold text-base sm:text-lg">{opt.title}</div>
                        <div className="text-neutral-500 text-sm">{opt.desc}</div>
                    </button>
                ))}
            </div>
        </div>
    )
}