import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import Link from "next/link";

export default async function ClasesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (!profile?.global_role) redirect("/onboarding");

    const { data: memberships } = await supabase
        .from('memberships').select('community_id').eq('user_id', user.id);
    const communityIds = memberships?.map((m: any) => m.community_id) || [];

    let aulas: any[] = [];
    if (communityIds.length > 0) {
        const { data } = await supabase
            .from('aulas')
            .select('*')
            .in('community_id', communityIds)
            .order('created_at', { ascending: false });
        aulas = data || [];
    }

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white flex">
            <Sidebar profile={profile} />
            <main className="flex-1 ml-64 p-12">
                <div className="mb-12 flex justify-between items-end">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-indigo-400 mb-2">Universidad Saby</p>
                        <h1 className="text-3xl font-light tracking-wider uppercase">Mis Clases</h1>
                        <p className="text-zinc-500 mt-1">Todas las aulas disponibles</p>
                    </div>
                    {profile.global_role === 'creator' && (
                        <Link href="/dashboard/clases/nueva" className="px-6 py-2.5 bg-white text-black rounded-xl font-bold text-sm hover:bg-zinc-200 transition-all">
                            + Nueva Aula
                        </Link>
                    )}
                </div>

                <div className="space-y-3">
                    {aulas.length === 0 ? (
                        <div className="text-center py-24">
                            <div className="text-5xl mb-4">📚</div>
                            <p className="text-zinc-500">No hay aulas todavía.</p>
                        </div>
                    ) : aulas.map((aula: any) => (
                        <Link key={aula.id} href={`/dashboard/clases/${aula.id}`}>
                            <div className="flex items-center gap-6 p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-indigo-500/30 hover:bg-white/[0.04] transition-all group">
                                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xl font-bold text-indigo-400 shrink-0">
                                    {aula.nombre.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-white group-hover:text-indigo-300 transition-colors">{aula.nombre}</h3>
                                    <p className="text-zinc-500 text-sm truncate mt-1">{aula.descripcion || 'Sin descripción'}</p>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    {aula.is_active && (
                                        <span className="flex items-center gap-1.5 text-[10px] text-green-400 uppercase tracking-widest font-bold">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                            En vivo
                                        </span>
                                    )}
                                    <span className="text-zinc-600 text-sm">→</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
}
