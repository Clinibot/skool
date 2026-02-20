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
            <main className="flex-1 ml-64 p-12 relative overflow-hidden">
                {/* Decorative items */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-600/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10 max-w-7xl mx-auto">
                    <div className="mb-16">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="h-[1px] w-8 bg-indigo-500/50" />
                            <p className="text-[10px] uppercase tracking-[0.4em] text-indigo-400 font-bold">Secretaría Académica</p>
                        </div>
                        <h1 className="text-4xl font-extralight tracking-tight uppercase">
                            Expediente de <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">Alumnos</span>
                        </h1>
                        <p className="text-zinc-500 mt-2 text-sm font-light">
                            Supervisa el progreso académico de {alumnos.length} estudiante{alumnos.length !== 1 ? 's' : ''} en tus comunidades.
                        </p>
                    </div>

                    {alumnos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-40 text-center relative">
                            <div className="relative mb-8">
                                <div className="text-7xl relative z-10 grayscale opacity-40">👨‍🎓</div>
                                <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full" />
                            </div>
                            <h2 className="text-2xl font-light text-zinc-300 mb-4 tracking-tight">Tu secretaría está vacía</h2>
                            <p className="text-zinc-500 text-sm max-w-xs leading-relaxed font-light">
                                Aún no tienes alumnos inscritos en tus comunidades universitarias.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {alumnos.map((m: any) => {
                                const alumno = m.profiles;
                                const notas = notasPorAlumno[alumno?.id] || [];
                                const promedio = notas.length > 0
                                    ? (notas.reduce((s: number, n: any) => s + n.nota, 0) / notas.length).toFixed(1)
                                    : null;

                                return (
                                    <div key={m.id} className="relative group p-8 rounded-[32px] border border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04] transition-all duration-700 backdrop-blur-sm overflow-hidden flex flex-col md:flex-row md:items-center gap-8 shadow-2xl">
                                        {/* Avatar and Info */}
                                        <div className="flex items-center gap-6 flex-1 min-w-0">
                                            <div className="relative">
                                                <div className="w-16 h-16 rounded-[20px] bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-xl font-black group-hover:scale-110 transition-transform duration-700 shadow-xl border border-white/10">
                                                    {(alumno?.full_name || alumno?.username || '?').charAt(0).toUpperCase()}
                                                </div>
                                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-[#0a0a0b] rounded-full" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-lg font-bold text-white tracking-tight">{alumno?.full_name || alumno?.username}</p>
                                                <p className="text-zinc-500 text-xs mt-1 uppercase tracking-widest font-medium">@{alumno?.username}</p>
                                            </div>
                                        </div>

                                        {/* Stats and Recent Grades */}
                                        <div className="flex flex-wrap items-center gap-10 md:gap-16">
                                            <div className="text-center md:text-left">
                                                <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 font-bold mb-2">Exámenes</p>
                                                <p className="text-2xl font-black text-white">{notas.length}</p>
                                            </div>

                                            <div className="text-center md:text-left">
                                                <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 font-bold mb-2">Promedio</p>
                                                <p className={`text-2xl font-black ${promedio ? (parseFloat(promedio) >= 5 ? 'text-green-400' : 'text-red-400') : 'text-zinc-700'}`}>
                                                    {promedio ?? '—'}
                                                </p>
                                            </div>

                                            <div className="w-px h-12 bg-white/5 hidden md:block" />

                                            <div className="flex-1 min-w-0 space-y-2">
                                                <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 font-bold mb-3">Últimas Calificaciones</p>
                                                <div className="flex flex-wrap gap-3">
                                                    {notas.length === 0 ? (
                                                        <span className="text-[10px] text-zinc-700 uppercase tracking-widest italic">Sin notas registradas</span>
                                                    ) : (
                                                        notas.slice(-2).map((n: any) => (
                                                            <div key={n.id} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2 group/nota hover:border-white/20 transition-all">
                                                                <span className="text-[10px] text-zinc-500 font-medium truncate max-w-[100px]">{n.aulas?.nombre}</span>
                                                                <span className={`text-[10px] font-black ${n.nota >= 5 ? 'text-green-400' : 'text-red-400'}`}>{n.nota}</span>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
