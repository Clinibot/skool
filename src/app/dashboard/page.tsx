import { createClient, createPublicClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import Link from "next/link";

export default async function DashboardPage() {
    const supabase = await createClient();
    const publicSupabase = await createPublicClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const { data: profileData, error: profileError } = await publicSupabase
        .rpc('get_my_profile', { uid: user!.id });

    if (profileError) console.error('[dashboard] get_my_profile error:', profileError);

    const profile = profileData?.[0] ?? null;
    if (!profile?.global_role) redirect("/onboarding");

    // Fetch communities the user belongs to
    const { data: memberships } = await supabase
        .from('memberships')
        .select('*, communities(*)')
        .eq('user_id', user!.id);

    const communities = memberships?.map((m: any) => m.communities).filter(Boolean) || [];

    // ── CREATOR VIEW: show hallway (aulas) ──────────────────────────────────
    if (profile.global_role === 'creator') {
        let aulas: any[] = [];
        if (communities.length > 0) {
            const { data } = await supabase
                .from('aulas')
                .select('*')
                .in('community_id', communities.map((c: any) => c.id));
            aulas = data || [];
        }

        return (
            <div className="min-h-screen bg-[#0a0a0b] text-white flex">
                <Sidebar profile={profile} />
                <main className="flex-1 ml-64 p-12">
                    <div className="mb-12 flex justify-between items-end">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.3em] text-indigo-400 mb-2">Universidad Saby</p>
                            <h1 className="text-3xl font-light tracking-wider uppercase">El Pasillo</h1>
                            <p className="text-zinc-500 mt-1">Gestiona tus aulas y comunidades</p>
                        </div>
                        <Link href="/dashboard/clases/nueva" className="px-6 py-2.5 bg-white text-black rounded-xl font-bold text-sm hover:bg-zinc-200 transition-all">
                            + Nueva Aula
                        </Link>
                    </div>
                    {aulas.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 text-center">
                            <div className="text-6xl mb-6">🏫</div>
                            <h2 className="text-xl font-light text-zinc-400 mb-3">El pasillo está vacío</h2>
                            <p className="text-zinc-600 text-sm max-w-xs">Crea tu primera aula para empezar a compartir conocimiento.</p>
                            <Link href="/dashboard/clases/nueva" className="mt-6 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-500 transition-all">
                                Crear primera aula
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {aulas.map((aula: any) => (
                                <Link key={aula.id} href={`/dashboard/clases/${aula.id}`}>
                                    <div className="relative h-64 rounded-[28px] border border-white/5 bg-white/[0.02] p-8 group hover:border-indigo-500/40 transition-all cursor-pointer overflow-hidden">
                                        <div className={`absolute top-0 right-0 w-40 h-40 blur-[60px] -translate-y-1/2 translate-x-1/2 transition-colors ${aula.is_active ? 'bg-indigo-500/30' : 'bg-white/5 group-hover:bg-indigo-500/15'}`} />
                                        {aula.is_active && (
                                            <div className="absolute top-5 right-5 flex items-center gap-1.5">
                                                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                                <span className="text-[9px] uppercase tracking-widest text-green-400 font-bold">En vivo</span>
                                            </div>
                                        )}
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-5 font-bold text-indigo-400 text-lg">
                                            {aula.nombre.charAt(0).toUpperCase()}
                                        </div>
                                        <h3 className="text-lg font-bold mb-2 uppercase tracking-tight">{aula.nombre}</h3>
                                        <p className="text-zinc-500 text-sm line-clamp-2">{aula.descripcion || 'Sin descripción'}</p>
                                        <div className="absolute bottom-6 left-8">
                                            <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-600">Entrar →</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        );
    }

    // ── PARTICIPANT VIEW: show their communities (tribus) ───────────────────
    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white flex">
            <Sidebar profile={profile} />
            <main className="flex-1 ml-64 p-12">
                <div className="mb-12">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-violet-400 mb-2">Universidad Saby</p>
                    <h1 className="text-3xl font-light tracking-wider uppercase">Mis Tribus</h1>
                    <p className="text-zinc-500 mt-1">Elige una comunidad para explorar</p>
                </div>

                {communities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <div className="text-6xl mb-6">🌍</div>
                        <h2 className="text-xl font-light text-zinc-400 mb-3">Aún no formas parte de ninguna tribu</h2>
                        <p className="text-zinc-600 text-sm max-w-xs">Busca comunidades y únete a las que más te interesen para empezar a aprender.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {communities.map((community: any) => (
                            <Link key={community.id} href={`/dashboard/tribu/${community.id}`}>
                                <div className="relative h-72 rounded-[28px] border border-white/5 bg-white/[0.02] p-8 group hover:border-violet-500/40 transition-all cursor-pointer overflow-hidden">
                                    {/* Glow */}
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-violet-500/10 blur-[60px] -translate-y-1/2 translate-x-1/2 group-hover:bg-violet-500/20 transition-colors" />

                                    {/* Logo */}
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600/30 to-indigo-600/20 border border-violet-500/20 flex items-center justify-center mb-5 font-black text-violet-300 text-xl">
                                        {community.name.charAt(0).toUpperCase()}
                                    </div>

                                    <h3 className="text-lg font-bold mb-2 group-hover:text-violet-300 transition-colors">{community.name}</h3>
                                    <p className="text-zinc-500 text-sm leading-relaxed line-clamp-2">{community.description || 'Tu comunidad de aprendizaje.'}</p>

                                    {/* Bottom row */}
                                    <div className="absolute bottom-6 left-8 right-8 flex items-center justify-between">
                                        <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest text-zinc-600">
                                            <span>☕ Cafetería</span>
                                            <span>🎥 Clases</span>
                                        </div>
                                        <span className="text-zinc-600 text-sm">→</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
