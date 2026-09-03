import React, { createContext, useContext, useMemo, useState } from 'react'
import subjectsData from '../data/subjects.json'

const FormContext = createContext(null)

function buildAvailableDomains(cycle) {
    if (cycle === 'BTS') {
        return subjectsData.bts.domains.map(d => ({ ...d, cycleSource: 'bts' }))
    }
    if (cycle === 'HND') {
        return subjectsData.hnd.domains.map(d => ({ ...d, cycleSource: 'hnd' }))
    }
    if (cycle === 'BTS_HND') {
        return [
            ...subjectsData.bts.domains.map(d => ({ ...d, cycleSource: 'bts' })),
            ...subjectsData.hnd.domains.map(d => ({ ...d, cycleSource: 'hnd' }))
        ]
    }
    return []
}

export function FormProvider({ children }) {
    const [cycle, setCycle] = useState(null)
    const [fullName, setFullName] = useState('')
    const [contact, setContact] = useState('')
    const [selectedDomainIds, setSelectedDomainIds] = useState([])
    const [subjectSelections, setSubjectSelections] = useState({})
    const [availability, setAvailability] = useState({})
    const [currentSubjectDomainIndex, setCurrentSubjectDomainIndex] = useState(0)

    const language = cycle === 'HND' ? 'en' : 'fr'
    const availableDomains = useMemo(() => buildAvailableDomains(cycle), [cycle])

    const chosenDomains = useMemo(() => {
        return selectedDomainIds
            .map(id => availableDomains.find(d => d.id === id))
            .filter(Boolean)
    }, [selectedDomainIds, availableDomains])

    function toggleDomain(domainId) {
        setSelectedDomainIds(prev => {
            if (prev.includes(domainId)) {
                setSubjectSelections(sels => {
                    const copy = { ...sels }
                    delete copy[domainId]
                    return copy
                })
                return prev.filter(id => id !== domainId)
            }
            return [...prev, domainId]
        })
    }

    function toggleSubject(domainId, subjectId) {
        setSubjectSelections(prev => {
            const current = prev[domainId] || []
            const next = current.includes(subjectId)
                ? current.filter(s => s !== subjectId)
                : [...current, subjectId]
            return { ...prev, [domainId]: next }
        })
    }

    function toggleAvailability(day, slot) {
        const key = `${day}_${slot}`
        setAvailability(prev => ({ ...prev, [key]: !prev[key] }))
    }

    const value = {
        cycle, setCycle,
        language,
        fullName, setFullName,
        contact, setContact,
        availableDomains,
        selectedDomainIds, toggleDomain,
        chosenDomains,
        subjectSelections, toggleSubject,
        availability, toggleAvailability,
        currentSubjectDomainIndex, setCurrentSubjectDomainIndex
    }

    return <FormContext.Provider value={value}>{children}</FormContext.Provider>
}

export function useForm() {
    const ctx = useContext(FormContext)
    if (!ctx) throw new Error('useForm must be used within FormProvider')
    return ctx
}