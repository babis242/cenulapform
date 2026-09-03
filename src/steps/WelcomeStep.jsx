const CONTENT = {
    fr: {
        title: "Fiche de vœux d'enseignement",
        p1: "Ce formulaire nous permet de recueillir les matières que vous vous sentez capable d'enseigner au sein du Centre Universitaire La Perle (CENULAPE), ainsi que vos disponibilités pour l'année académique en cours.",
        p2: "En quelques minutes, vous allez : choisir votre cycle d'enseignement, indiquer vos coordonnées, sélectionner vos domaines de spécialité puis les matières correspondantes, et enfin renseigner vos disponibilités.",
        cta: 'Commencer'
    },
    en: {
        title: 'Teaching preferences form',
        p1: 'This form lets us collect the subjects you feel able to teach at Centre Universitaire La Perle (CENULAPE), along with your availability for the current academic year.',
        p2: 'In a few minutes, you will: choose your teaching cycle, provide your contact details, select your areas of specialty and the matching subjects, and finally indicate your availability.',
        cta: 'Start'
    }
}

export default function WelcomeStep({ onNext, language }) {
    const c = CONTENT[language] || CONTENT.fr

    return (
        <div className="text-center w-full">
            <h1 className="text-2xl sm:text-4xl font-extrabold leading-tight mb-5 text-neutral-900 break-words">
                {c.title}
            </h1>
            <p className="text-neutral-800 text-sm sm:text-base mb-3 max-w-md mx-auto break-words">
                {c.p1}
            </p>
            <p className="text-neutral-500 text-sm sm:text-base mb-8 max-w-md mx-auto break-words">
                {c.p2}
            </p>

            <button
                onClick={onNext}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full px-8 py-3 text-sm sm:text-base transition-colors"
            >
                {c.cta}
            </button>
        </div>
    )
}