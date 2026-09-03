import { supabase } from './supabase.js'

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-teacher-pdf`

export async function submitTeacherForm(form) {
    const teacherId = crypto.randomUUID()

    // 1) Enregistrer en base (comme avant)
    const { error: teacherError } = await supabase
        .from('teachers')
        .insert({
            id: teacherId,
            full_name: form.fullName.trim(),
            contact: form.contact.trim(),
            cycle: form.cycle,
            language: form.language
        })

    if (teacherError) throw new Error(`Échec enregistrement enseignant : ${teacherError.message}`)

    const domainsPayload = form.chosenDomains.map(d => ({
        id: d.id,
        label: d.label,
        cycleSource: d.cycleSource
    }))

    const domainsRows = domainsPayload.map((d, i) => ({
        teacher_id: teacherId,
        domain_id: d.id,
        domain_label: d.label,
        cycle_source: d.cycleSource,
        selection_order: i
    }))
    if (domainsRows.length) {
        const { error } = await supabase.from('teacher_domains').insert(domainsRows)
        if (error) throw new Error(`Échec enregistrement domaines : ${error.message}`)
    }

    const subjectsPayload = form.chosenDomains.flatMap(d => {
        const chosenIds = form.subjectSelections[d.id] || []
        return d.subjects
            .filter(s => chosenIds.includes(s.id))
            .map(s => ({
                domainId: d.id,
                domainLabel: d.label,
                subjectId: s.id,
                subjectLabel: s.label,
                niveau: s.niveau
            }))
    })
    if (subjectsPayload.length) {
        const { error } = await supabase.from('teacher_subjects').insert(
            subjectsPayload.map(s => ({
                teacher_id: teacherId,
                domain_id: s.domainId,
                subject_id: s.subjectId,
                subject_label: s.subjectLabel,
                niveau: s.niveau
            }))
        )
        if (error) throw new Error(`Échec enregistrement matières : ${error.message}`)
    }

    const availabilityPayload = Object.entries(form.availability)
        .filter(([, checked]) => checked)
        .map(([key]) => {
            const [day, slot] = key.split('_')
            return { day, slot }
        })
    if (availabilityPayload.length) {
        const { error } = await supabase.from('availabilities').insert(
            availabilityPayload.map(a => ({ teacher_id: teacherId, ...a }))
        )
        if (error) throw new Error(`Échec enregistrement disponibilités : ${error.message}`)
    }

    // 2) Appeler l'Edge Function : génère le PDF, l'upload sur R2, construit le lien WhatsApp
    const res = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
            teacherId,
            fullName: form.fullName.trim(),
            contact: form.contact.trim(),
            cycle: form.cycle,
            language: form.language,
            domains: domainsPayload,
            subjects: subjectsPayload,
            availability: availabilityPayload
        })
    })

    if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`Échec génération du PDF : ${text}`)
    }

    const { pdfUrl, whatsappUrl } = await res.json()

    return { teacherId, pdfUrl, whatsappUrl }
}