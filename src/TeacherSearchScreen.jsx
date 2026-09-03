import { useState } from 'react'
import { supabase } from './lib/supabase.js'

export default function TeacherSearchScreen() {
    var [query, setQuery] = useState('')
    var [results, setResults] = useState([])
    var [searched, setSearched] = useState(false)
    var [loading, setLoading] = useState(false)

    function handleSearch(e) {
        e.preventDefault()
        if (!query.trim()) return
        setLoading(true)
        setSearched(true)
        supabase
            .from('v_teacher_report')
            .select('*')
            .ilike('full_name', '%' + query.trim() + '%')
            .then(function (res) {
                setResults(res.data || [])
                setLoading(false)
            })
    }

    return (
        <div>
            <h2 className="text-xl font-extrabold mb-6">Recherche par enseignant</h2>

            <form onSubmit={handleSearch} className="flex gap-2 mb-8 max-w-md">
                <input
                    type="text"
                    value={query}
                    onChange={function (e) { setQuery(e.target.value) }}
                    placeholder="Nom de l'enseignant"
                    className="flex-1 border border-neutral-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-blue-600"
                />
                <button
                    type="submit"
                    className="bg-neutral-900 hover:bg-blue-600 text-white font-bold rounded-full px-6 py-3 text-sm transition-colors"
                >
                    Rechercher
                </button>
            </form>

            {loading && <p className="text-neutral-500">Recherche...</p>}

            {!loading && searched && results.length === 0 && (
                <p className="text-neutral-500">Aucun enseignant trouve pour "{query}".</p>
            )}

            {!loading && results.map(function (r) {
                return (
                    <div key={r.teacher_id} className="border border-neutral-200 rounded-2xl p-5 mb-4">
                        <div className="flex items-baseline justify-between mb-3">
                            <h3 className="text-lg font-extrabold">{r.full_name}</h3>
                            <span className="text-neutral-500 text-sm">{r.contact}</span>
                        </div>
                        <div className="text-sm text-neutral-500 mb-3">
                            Cycle : <span className="font-bold text-neutral-900">{r.cycle}</span>
                            {'  '}Domaines : <span className="font-bold text-neutral-900">{(r.domains || []).join(', ')}</span>
                        </div>
                        <div className="mb-2">
                            <span className="text-xs font-bold uppercase text-neutral-400">Disponibilites</span>
                            <p className="text-sm mt-1">
                                {(r.availability_slots || []).length > 0
                                    ? r.availability_slots.join(', ')
                                    : 'Aucune disponibilite renseignee'}
                            </p>
                        </div>
                        {r.pdf_url && (
                            <a href={r.pdf_url} target="_blank" rel="noreferrer" className="text-blue-600 font-bold text-sm hover:underline">
                                Voir le PDF
                            </a>
                        )}
                    </div>
                )
            })}
        </div>
    )
}