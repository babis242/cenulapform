import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase.js'
import { generateSubjectReportPdf } from './lib/pdfReport.js'
import subjectsData from './data/subjects.json'

function buildFullCatalog() {
    var domains = []
    domains = domains.concat(subjectsData.bts.domains.map(function (d) {
        return { id: d.id, label: d.label, subjects: d.subjects }
    }))
    domains = domains.concat(subjectsData.hnd.domains.map(function (d) {
        return { id: d.id, label: d.label, subjects: d.subjects }
    }))
    return domains
}

export default function SubjectsReportScreen() {
    var [rows, setRows] = useState([])
    var [loading, setLoading] = useState(true)
    var [error, setError] = useState('')
    var [generating, setGenerating] = useState(false)
    var [selectedDomainId, setSelectedDomainId] = useState(null)
    var [searchText, setSearchText] = useState('')

    useEffect(function () {
        setLoading(true)
        supabase
            .from('v_subject_teachers')
            .select('*')
            .then(function (res) {
                if (res.error) setError(res.error.message)
                else setRows(res.data || [])
                setLoading(false)
            })
    }, [])

    var teachersIndex = {}
    rows.forEach(function (r) {
        var key = r.domain_id + '__' + r.subject_id
        if (!teachersIndex[key]) teachersIndex[key] = []
        teachersIndex[key].push({
            fullName: r.full_name,
            contact: r.contact,
            availabilityText: r.availability_text
        })
    })

    var catalog = buildFullCatalog()
    var selectedDomain = catalog.find(function (d) { return d.id === selectedDomainId })

    function subjectsWithTeachers(domain) {
        return domain.subjects.map(function (s) {
            var key = domain.id + '__' + s.id
            return { subjectLabel: s.label, teachers: teachersIndex[key] || [] }
        })
    }

    var query = searchText.trim().toLowerCase()
    var displayedSubjects = selectedDomain
        ? subjectsWithTeachers(selectedDomain).filter(function (s) {
            return query ? s.subjectLabel.toLowerCase().indexOf(query) !== -1 : true
        })
        : []

    function handleDownloadDomainPdf() {
        if (!selectedDomain) return
        setGenerating(true)
        var groupedData = [{ domainLabel: selectedDomain.label, subjects: displayedSubjects }]
        generateSubjectReportPdf(groupedData).then(function (bytes) {
            var blob = new Blob([bytes], { type: 'application/pdf' })
            var url = URL.createObjectURL(blob)
            var a = document.createElement('a')
            a.href = url
            a.download = 'cenulape-' + selectedDomain.id + '.pdf'
            a.click()
            URL.revokeObjectURL(url)
            setGenerating(false)
        })
    }

    function handleDownloadFullPdf() {
        setGenerating(true)
        var groupedData = catalog.map(function (d) {
            return { domainLabel: d.label, subjects: subjectsWithTeachers(d) }
        })
        generateSubjectReportPdf(groupedData).then(function (bytes) {
            var blob = new Blob([bytes], { type: 'application/pdf' })
            var url = URL.createObjectURL(blob)
            var a = document.createElement('a')
            a.href = url
            a.download = 'cenulape-rapport-complet.pdf'
            a.click()
            URL.revokeObjectURL(url)
            setGenerating(false)
        })
    }

    if (loading) return <p className="text-neutral-500">Chargement...</p>
    if (error) return <p className="text-red-600">{error}</p>

    // Vue 1 : liste des domaines à choisir
    if (!selectedDomain) {
        return (
            <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <h2 className="text-xl font-extrabold">Enseignants par UE</h2>
                    <button
                        onClick={handleDownloadFullPdf}
                        disabled={generating}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-full px-6 py-2.5 text-sm transition-colors whitespace-nowrap"
                    >
                        {generating ? 'Generation...' : 'Telecharger le rapport complet (tous domaines)'}
                    </button>
                </div>
                <p className="text-neutral-500 text-sm mb-4">Choisissez un domaine pour voir ses matieres et enseignants.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {catalog.map(function (d) {
                        var subjectCount = d.subjects.length
                        var withTeacherCount = d.subjects.filter(function (s) {
                            return (teachersIndex[d.id + '__' + s.id] || []).length > 0
                        }).length
                        return (
                            <button
                                key={d.id}
                                onClick={function () { setSelectedDomainId(d.id); setSearchText('') }}
                                className="text-left border border-neutral-200 hover:border-blue-600 rounded-2xl px-5 py-4 transition-colors"
                            >
                                <div className="font-bold">{d.label}</div>
                                <div className="text-neutral-500 text-xs mt-1">
                                    {subjectCount} UE au total - {withTeacherCount} avec au moins un enseignant
                                </div>
                            </button>
                        )
                    })}
                </div>
            </div>
        )
    }

    // Vue 2 : détail du domaine sélectionné, avec recherche
    return (
        <div>
            <button
                onClick={function () { setSelectedDomainId(null); setSearchText('') }}
                className="text-neutral-500 hover:text-neutral-900 font-bold text-sm mb-4"
            >
                ← Retour aux domaines
            </button>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h2 className="text-xl font-extrabold">{selectedDomain.label}</h2>
                <button
                    onClick={handleDownloadDomainPdf}
                    disabled={generating}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-full px-6 py-2.5 text-sm transition-colors whitespace-nowrap"
                >
                    {generating ? 'Generation...' : 'Telecharger ce domaine en PDF'}
                </button>
            </div>

            <div className="mb-6 max-w-sm">
                <label className="block font-bold text-sm mb-2">Rechercher une UE dans ce domaine</label>
                <input
                    type="text"
                    value={searchText}
                    onChange={function (e) { setSearchText(e.target.value) }}
                    placeholder="Ex: Programmation Web"
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-blue-600"
                />
            </div>

            <p className="text-neutral-500 text-sm mb-3">{displayedSubjects.length} UE affichee(s)</p>

            <div className="overflow-x-auto border border-neutral-200 rounded-2xl">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-neutral-50 text-left">
                            <th className="px-4 py-3 font-bold w-1/3">Matiere</th>
                            <th className="px-4 py-3 font-bold">Enseignant(s) et disponibilites</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedSubjects.map(function (subject) {
                            return (
                                <tr key={subject.subjectLabel} className="border-t border-neutral-100 align-top">
                                    <td className="px-4 py-3 font-bold">{subject.subjectLabel}</td>
                                    <td className="px-4 py-3">
                                        {subject.teachers.length === 0 && (
                                            <span className="text-neutral-300 italic">Aucun enseignant</span>
                                        )}
                                        {subject.teachers.map(function (t, i) {
                                            return (
                                                <div key={i} className="mb-1">
                                                    <span className="font-bold">{t.fullName}</span>
                                                    <span className="text-neutral-500"> - {t.availabilityText}</span>
                                                </div>
                                            )
                                        })}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}