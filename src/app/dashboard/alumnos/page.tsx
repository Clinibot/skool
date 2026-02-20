import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

export default async function AlumnosPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (!profile?.global_role) redirect("/onboarding");
    if (profile.global_role !== 'creator') redirect("/dashboard");

    // Get all members of communities this creator owns
    const { data: myCommunities } = await supabase
        .from('communities').select('id, name').eq('owner_id', user.id);
    const communityIds = myCommunities?.map((c: any) => c.id) || [];

    let alumnos: any[] = [];
    if (communityIds.length > 0) {
        const { data } = await supabase
            .from('memberships')
            .select('*, profiles(*)')
            .in('community_id', communityIds)
            .neq('profiles.id', user.id);
        alumnos = data?.filter((m: any) => m.profiles && m.profiles.id !== user.id) || [];
    }

    // Notas por alumno
    let notasPorAlumno: Record<string, any[]> = {};
    if (alumnos.length > 0) {
        const alumnoIds = alumnos.map((a: any) => a.profiles?.id).filter(Boolean);
        const { data: examenes } = await supabase
            .from('examenes')
            .select('*, aulas(nombre)')
            .in('alumno_id', alumnoIds);

        examenes?.forEach((e: any) => {
            if (!notasPorAlumno[e.alumno_id]) notasPorAlumno[e.alumno_id] = [];
            notasPorAlumno[e.alumno_id].push(e);
        });
    }

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white flex">
            <Sidebar profile={profile} />
            <main className="flex-1 ml-64 p-12">
                <div className="mb-12">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-indigo-400 mb-2">Universidad Saby</p>
                    <h1 className="text-3xl font-light tracking-wider uppercase">Expediente de Alumnos</h1>
                    <p className="text-zinc-500 mt-1">{alumnos.length} alumno{alumnos.length !== 1 ? 's' : ''} registrado{alumnos.length !== 1 ? 's' : ''}</p>
                </div>

                {alumnos.length === 0 ? (
                    <div className="text-center py-24">
                        <div className="text-5xl mb-4">👨‍🎓</div>
                        <p className="text-zinc-500">Aún no tienes alumnos inscritos.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {alumnos.map((m: any) => {
                            const alumno = m.profiles;
                            const notas = notasPorAlumno[alumno?.id] || [];
                            const promedio = notas.length > 0
                                ? (notas.reduce((s: number, n: any) => s + n.nota, 0) / notas.length).toFixed(1)
                                : null;

                            return (
                                <div key={m.id} className="flex items-center gap-6 p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-sm font-bold shrink-0">
                                        {(alumno?.full_name || alumno?.username || '?').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-white">{alumno?.full_name || alumno?.username}</p>
                                        <p className="text-zinc-600 text-xs mt-0.5">@{alumno?.username}</p>
                                    </div>
                                    <div className="flex items-center gap-6 text-right shrink-0">
                                        <div>
                                            <p className="text-xs text-zinc-600 mb-1">Exámenes</p>
                                            <p className="font-bold text-white">{notas.length}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-zinc-600 mb-1">Promedio</p>
                                            <p className={`font-bold text-lg ${promedio ? (parseFloat(promedio) >= 5 ? 'text-green-400' : 'text-red-400') : 'text-zinc-500'}`}>
                                                {promedio ?? '—'}
                                            </p>
                                        </div>
                                        <div className="w-px h-8 bg-white/10" />
                                        <div className="text-left">
                                            {notas.slice(-3).map((n: any) => (
                                                <span key={n.id} className="inline-flex items-center mr-2 text-xs text-zinc-400">
                                                    {n.aulas?.nombre}: <span className={`ml-1 font-bold ${n.nota >= 5 ? 'text-green-400' : 'text-red-400'}`}>{n.nota}</span>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
