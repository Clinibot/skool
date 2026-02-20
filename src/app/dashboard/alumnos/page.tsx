import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { StudentsList } from "@/components/StudentsList";
import { GraduationCap } from "lucide-react";

export default async function AlumnosPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (!profile?.global_role) redirect("/onboarding");
    if (profile.global_role !== 'creator') redirect("/dashboard");

    const { data: myCommunities } = await supabase
        .from('communities').select('id, name').eq('owner_id', user.id);
    const communityIds = myCommunities?.map((c: any) => c.id) || [];

    let alumnos: any[] = [];
    if (communityIds.length > 0) {
        const { data } = await supabase
            .from('memberships')
            .select('*, profiles(*)')
            .in('community_id', communityIds);

        // Filter out the creator and ensure profiles exist
        alumnos = data?.filter((m: any) => m.profiles && m.profiles.id !== user.id) || [];
    }

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
            <main className="flex-1 ml-64 p-12 relative h-screen overflow-y-auto scrollbar-hide">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/[0.02] blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10 max-w-7xl mx-auto">
                    <div className="mb-16">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.4em] text-indigo-500 font-black">Gestión Universitaria</p>
                                <h1 className="text-4xl font-black tracking-tighter uppercase mt-1">
                                    Expediente <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">Académico</span>
                                </h1>
                            </div>
                        </div>
                        <p className="text-zinc-500 text-lg font-light max-w-2xl">
                            Supervisa y gestiona la trayectoria de {alumnos.length} estudiante{alumnos.length !== 1 ? 's' : ''} vinculados a tus comunidades saby.
                        </p>
                    </div>

                    {alumnos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-40 text-center relative bg-white/[0.01] border border-white/5 rounded-[50px] border-dashed">
                            <div className="relative mb-8">
                                <div className="text-7xl relative z-10 grayscale opacity-20">🏫</div>
                                <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full" />
                            </div>
                            <h2 className="text-2xl font-black text-zinc-400 mb-4 tracking-tight uppercase">Aula de Espera Vacía</h2>
                            <p className="text-zinc-600 text-sm max-w-xs leading-relaxed font-bold uppercase tracking-widest opacity-50">
                                Tus comunidades aún no tienen aspirantes matriculados.
                            </p>
                        </div>
                    ) : (
                        <StudentsList alumnos={alumnos} notasPorAlumno={notasPorAlumno} />
                    )}
                </div>
            </main>
        </div>
    );
}
