import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase.js'
import SubjectsReportScreen from './SubjectsReportScreen.jsx'
import TeacherSearchScreen from './TeacherSearchScreen.jsx'

function LoginScreen(props) {
    var onLoggedIn = props.onLoggedIn
    var [email, setEmail] = useState('')
    var [password, setPassword] = useState('')
    var [error, setError] = useState('')
    var [loading, setLoading] = useState(false)

    function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)
        setError('')
        supabase.auth.signInWithPassword({ email: email, password: password }).then(function (res) {
            setLoading(false)
            if (res.error) {
                setError(res.error.message)
                return
            }
            onLoggedIn()
        })
    }

    return (
        <div className="min-h-screen w-full bg-white flex items-center justify-center px-4">
            <div className="w-full max-w-sm">
                <div className="font-brand font-bold text-2xl text-center mb-8">CENULAPE</div>
                <p className="text-blue-600 font-bold text-xs uppercase tracking-wide mb-2 text-center">
                    Acces administrateur
                </p>
                <h1 className="text-2xl font-extrabold text-center mb-8">Connexion</h1>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block font-bold text-sm mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={function (e) { setEmail(e.target.value) }}
                            required
                            className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-blue-600"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block font-bold text-sm mb-2">Mot de passe</label>
                        <input
                            type="password"
                            value={password}
                            onChange={function (e) { setPassword(e.target.value) }}
                            required
                            className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-blue-600"
                        />
                    </div>
                    {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-neutral-900 hover:bg-blue-600 disabled:opacity-50 text-white font-bold rounded-full px-6 py-3 text-base transition-colors"
                    >
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </button>
                </form>
            </div>
        </div>
    )
}

function TeachersListScreen() {
    var [rows, setRows] = useState([])
    var [loading, setLoading] = useState(true)
    var [error, setError] = useState('')
    var [filterText, setFilterText] = useState('')

    useEffect(function () {
        setLoading(true)
        supabase
            .from('v_teacher_report')
            .select('*')
            .order('submitted_at', { ascending: false })
            .then(function (res) {
                if (res.error) setError(res.error.message)
                else setRows(res.data || [])
                setLoading(false)
            })
    }, [])

    var filtered = rows
    if (filterText.trim()) {
        var q = filterText.trim().toLowerCase()
        filtered = rows.filter(function (r) {
            var subjectsText = (r.subjects || []).join(' ').toLowerCase()
            var nameText = (r.full_name || '').toLowerCase()
            return subjectsText.indexOf(q) !== -1 || nameText.indexOf(q) !== -1
        })
    }

    return (
        <div>
            <h2 className="text-xl font-extrabold mb-6">Tous les enseignants</h2>

            <div className="mb-6 max-w-sm">
                <label className="block font-bold text-sm mb-2">Filtrer par nom ou matiere</label>
                <input
                    type="text"
                    value={filterText}
                    onChange={function (e) { setFilterText(e.target.value) }}
                    placeholder="Ex: Programmation Web"
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-blue-600"
                />
            </div>

            {loading && <p className="text-neutral-500">Chargement...</p>}
            {error && <p className="text-red-600">{error}</p>}

            {!loading && !error && (
                <>
                    <p className="text-neutral-500 text-sm mb-3">{filtered.length} enseignant(s)</p>
                    <div className="overflow-x-auto border border-neutral-200 rounded-2xl">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-neutral-50 text-left">
                                    <th className="px-4 py-3 font-bold">Nom</th>
                                    <th className="px-4 py-3 font-bold">Contact</th>
                                    <th className="px-4 py-3 font-bold">Cycle</th>
                                    <th className="px-4 py-3 font-bold">Domaines</th>
                                    <th className="px-4 py-3 font-bold">Matieres</th>
                                    <th className="px-4 py-3 font-bold">Disponibilites</th>
                                    <th className="px-4 py-3 font-bold">Soumis le</th>
                                    <th className="px-4 py-3 font-bold">PDF</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(function (r) {
                                    return (
                                        <tr key={r.teacher_id} className="border-t border-neutral-100 align-top">
                                            <td className="px-4 py-3 font-bold whitespace-nowrap">{r.full_name}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">{r.contact}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">{r.cycle}</td>
                                            <td className="px-4 py-3">{(r.domains || []).join(', ')}</td>
                                            <td className="px-4 py-3">{(r.subjects || []).join(', ')}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">{(r.availability_slots || []).join(', ')}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-neutral-500">
                                                {new Date(r.submitted_at).toLocaleString('fr-FR')}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {r.pdf_url ? (
                                                    <a href={r.pdf_url} target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline">
                                                        Voir
                                                    </a>
                                                ) : (
                                                    <span className="text-neutral-300">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    )
}

function Dashboard() {
    var [tab, setTab] = useState('teachers')

    function handleLogout() {
        supabase.auth.signOut().then(function () {
            window.location.reload()
        })
    }

    var tabs = [
        { id: 'teachers', label: 'Tous les enseignants' },
        { id: 'subjects', label: 'Par UE' },
        { id: 'search', label: 'Recherche enseignant' }
    ]

    return (
        <div className="min-h-screen w-full bg-white px-4 sm:px-8 py-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="font-brand font-bold text-xl">CENULAPE</div>
                        <h1 className="text-2xl font-extrabold mt-1">Administration</h1>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-neutral-500 hover:text-neutral-900 font-bold text-sm px-4 py-2 border border-neutral-200 rounded-full transition-colors"
                    >
                        Se deconnecter
                    </button>
                </div>

                <div className="flex gap-2 mb-8 border-b border-neutral-200">
                    {tabs.map(function (t) {
                        return (
                            <button
                                key={t.id}
                                onClick={function () { setTab(t.id) }}
                                className={
                                    'px-4 py-3 font-bold text-sm border-b-2 -mb-px transition-colors ' +
                                    (tab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-neutral-500 hover:text-neutral-900')
                                }
                            >
                                {t.label}
                            </button>
                        )
                    })}
                </div>

                {tab === 'teachers' && <TeachersListScreen />}
                {tab === 'subjects' && <SubjectsReportScreen />}
                {tab === 'search' && <TeacherSearchScreen />}
            </div>
        </div>
    )
}

export default function AdminApp() {
    var [session, setSession] = useState(undefined)

    useEffect(function () {
        supabase.auth.getSession().then(function (res) {
            setSession(res.data.session)
        })
        var sub = supabase.auth.onAuthStateChange(function (event, newSession) {
            setSession(newSession)
        })
        return function () {
            sub.data.subscription.unsubscribe()
        }
    }, [])

    if (session === undefined) {
        return <div className="min-h-screen flex items-center justify-center text-neutral-500">Chargement...</div>
    }
    if (!session) {
        return <LoginScreen onLoggedIn={function () { }} />
    }
    return <Dashboard />
}