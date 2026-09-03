import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase.js'
import { generateSubjectReportPdf } from './lib/pdfReport.js'

export default function SubjectsReportScreen() {
    var [rows, setRows] = useState([])
    var [loading, setLoading] = useState(true)
    var [error, setError] = useState('')
    var [generating, setGenerating] = useState(false)

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

    // Regrouper : domaine -> matiere -> liste d'enseignants
    var grouped = []
    var domainMap = {}
    rows.forEach(function (r) {
        if (!domainMap[r.domain_id]) {
            domainMap[r.domain_id] = { domainLabel: r.domain_label, subjectMap: {}, subjects: [] }
            grouped.push(domainMap[r.domain_id])
        }
        var dom = domainMap[r.domain_id]
        if (!dom.subjectMap[r.subject_id]) {
            dom.subjectMap[r.subject_id] = { subjectLabel: r.subject_label, teachers: [] }
            dom.subjects.push(dom.subjectMap[r.subject_id])
        }
        dom.subjectMap[r.subject_id].teachers.push({
            fullName: r.full_name,
            contact: r.contact,
            availabilityText: r.availability_text
        })
    })

    function handleDownloadPdf() {
        setGenerating(true)
        generateSubjectReportPdf(grouped).then(function (bytes) {
            var blob = new Blob([bytes], { type: 'application/pdf' })
            var url = URL.createObjectURL(blob)
            var a = document.createElement('a')
            a.href = url
            a.download = 'cenulape-rapport-par-ue.pdf'
            a.click()
            URL.revokeObjectURL(url)
            setGenerating(false)
        })
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-extrabold">Enseignants par UE</h2>
                <button
                    onClick={handleDownloadPdf}
                    disabled={generating || grouped.length === 0}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-full px-6 py-2.5 text-sm transition-colors"
                >
                    {generating ? 'Generation...' : 'Telecharger le rapport PDF'}
                </button>
            </div>

            {loading && <p className="text-neutral-500">Chargement...</p>}
            {error && <p className="text-red-600">{error}</p>}

            {!loading && !error && grouped.map(function (domain) {
                return (
                    <div key={domain.domainLabel} className="mb-8">
                        <h3 className="text-lg font-extrabold text-neutral-900 mb-3">{domain.domainLabel}</h3>
                        <div className="overflow-x-auto border border-neutral-200 rounded-2xl">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-neutral-50 text-left">
                                        <th className="px-4 py-3 font-bold w-1/3">Matiere</th>
                                        <th className="px-4 py-3 font-bold">Enseignant(s) et disponibilites</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {domain.subjects.map(function (subject) {
                                        return (
                                            <tr key={subject.subjectLabel} className="border-t border-neutral-100 align-top">
                                                <td className="px-4 py-3 font-bold">{subject.subjectLabel}</td>
                                                <td className="px-4 py-3">
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
            })}
        </div>
    )
}