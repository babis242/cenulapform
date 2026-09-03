import { useState } from 'react'
import { FormProvider, useForm } from './lib/FormContext.jsx'
import WelcomeStep from './steps/WelcomeStep.jsx'
import CycleStep from './steps/CycleStep.jsx'
import IdentityStep from './steps/IdentityStep.jsx'
import DomainsStep from './steps/DomainsStep.jsx'
import SubjectsStep from './steps/SubjectsStep.jsx'
import AvailabilityStep from './steps/AvailabilityStep.jsx'
import ConfirmationStep from './steps/ConfirmationStep.jsx'

const PHASE = {
  WELCOME: 'welcome',
  CYCLE: 'cycle',
  IDENTITY: 'identity',
  DOMAINS: 'domains',
  SUBJECTS: 'subjects',
  AVAILABILITY: 'availability',
  CONFIRMATION: 'confirmation'
}

function LanguageToggle({ language, onChange }) {
  return (
    <div className="inline-flex border border-neutral-200 rounded-full p-0.5 shrink-0">
      <button
        onClick={() => onChange('fr')}
        className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold transition-colors ${language === 'fr' ? 'bg-blue-600 text-white' : 'text-neutral-500'
          }`}
      >
        FR
      </button>
      <button
        onClick={() => onChange('en')}
        className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold transition-colors ${language === 'en' ? 'bg-blue-600 text-white' : 'text-neutral-500'
          }`}
      >
        EN
      </button>
    </div>
  )
}

function Inner() {
  const form = useForm()
  const [phase, setPhase] = useState(PHASE.WELCOME)
  const [uiLanguage, setUiLanguage] = useState('fr')
  const [submitResult, setSubmitResult] = useState(null)

  const totalDomainPages = form.chosenDomains.length

  function goToDomainsNext() {
    form.setCurrentSubjectDomainIndex(0)
    if (totalDomainPages === 0) return
    setPhase(PHASE.SUBJECTS)
  }

  function goSubjectsNext() {
    const isLast = form.currentSubjectDomainIndex >= totalDomainPages - 1
    if (isLast) {
      setPhase(PHASE.AVAILABILITY)
    } else {
      form.setCurrentSubjectDomainIndex(i => i + 1)
    }
  }

  function goSubjectsBack() {
    if (form.currentSubjectDomainIndex === 0) {
      setPhase(PHASE.DOMAINS)
    } else {
      form.setCurrentSubjectDomainIndex(i => i - 1)
    }
  }

  const baseSteps = { [PHASE.WELCOME]: 4, [PHASE.CYCLE]: 12, [PHASE.IDENTITY]: 20, [PHASE.DOMAINS]: 28 }
  let progress = baseSteps[phase] ?? 28
  if (phase === PHASE.SUBJECTS && totalDomainPages > 0) {
    const span = 40
    progress = 28 + Math.round(((form.currentSubjectDomainIndex + 1) / totalDomainPages) * span)
  } else if (phase === PHASE.AVAILABILITY) {
    progress = 85
  } else if (phase === PHASE.CONFIRMATION) {
    progress = 100
  }

  return (
    <div className="min-h-screen w-full bg-white text-neutral-900 flex flex-col overflow-x-hidden">
      <header className="w-full px-4 sm:px-8 py-5 sm:py-6 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div />
        <div className="font-brand font-bold text-xl sm:text-3xl tracking-tight text-neutral-900 text-center whitespace-nowrap">
          CENULAPE
        </div>
        <div className="flex justify-end">
          <LanguageToggle language={uiLanguage} onChange={setUiLanguage} />
        </div>
      </header>

      <div className="h-1 bg-neutral-100 w-full">
        <div
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <main className="flex-1 w-full flex items-start sm:items-center justify-center px-4 sm:px-8 py-10 sm:py-16">
        <div className="w-full max-w-md">
          {phase === PHASE.WELCOME && (
            <WelcomeStep language={uiLanguage} onNext={() => setPhase(PHASE.CYCLE)} />
          )}
          {phase === PHASE.CYCLE && (
            <CycleStep onNext={() => setPhase(PHASE.IDENTITY)} />
          )}
          {phase === PHASE.IDENTITY && (
            <IdentityStep
              onBack={() => setPhase(PHASE.CYCLE)}
              onNext={() => setPhase(PHASE.DOMAINS)}
            />
          )}
          {phase === PHASE.DOMAINS && (
            <DomainsStep
              onBack={() => setPhase(PHASE.IDENTITY)}
              onNext={goToDomainsNext}
            />
          )}
          {phase === PHASE.SUBJECTS && totalDomainPages > 0 && (
            <SubjectsStep
              domain={form.chosenDomains[form.currentSubjectDomainIndex]}
              index={form.currentSubjectDomainIndex}
              total={totalDomainPages}
              onBack={goSubjectsBack}
              onNext={goSubjectsNext}
            />
          )}
          {phase === PHASE.AVAILABILITY && (
            <AvailabilityStep
              onBack={() => {
                form.setCurrentSubjectDomainIndex(totalDomainPages - 1)
                setPhase(PHASE.SUBJECTS)
              }}
              onSubmitted={(result) => {
                setSubmitResult(result)
                setPhase(PHASE.CONFIRMATION)
              }}
            />
          )}
          {phase === PHASE.CONFIRMATION && (
            <ConfirmationStep language={form.language} result={submitResult} />
          )}
        </div>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <FormProvider>
      <Inner />
    </FormProvider>
  )
}