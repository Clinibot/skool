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

    // Fetch communities the user belongs to — wrapped in try/catch so schema errors don't 500
    let communities: any[] = [];
    let aulas: any[] = [];
    try {
        const { data: memberships, error: membError } = await supabase
            .from('memberships')
            .select('*, communities(*)')
            .eq('user_id', user!.id);

        if (membError) console.error('[dashboard] memberships error:', membError);
        communities = memberships?.map((m: any) => m.communities).filter(Boolean) || [];
    } catch (e) {
        console.error('[dashboard] memberships query crashed:', e);
    }

    // ── CREATOR VIEW: show hallway (aulas) ──────────────────────────────────
    if (profile.global_role === 'creator') {
        let creatorAulas: any[] = [];
        try {
            if (communities.length > 0) {
                const { data } = await supabase
                    .from('aulas')
                    .select('*')
                    .in('community_id', communities.map((c: any) => c.id));
                creatorAulas = data || [];
            }
        } catch (e) {
            console.error('[dashboard] aulas query crashed:', e);
        }

        return (
            <div className="min-h-screen bg-[#0a0a0b] text-white flex">
                <Sidebar profile={profile} />
                <main className="flex-1 ml-64 p-12 relative overflow-hidden">
                    {/* Decorative items */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-600/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

                    <div className="relative z-10 max-w-7xl mx-auto">
                        <div className="mb-16 flex justify-between items-end">
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="h-[1px] w-8 bg-indigo-500/50" />
                                    <p className="text-[10px] uppercase tracking-[0.4em] text-indigo-400 font-bold">Universidad Saby</p>
                                </div>
                                <h1 className="text-4xl font-extralight tracking-tight uppercase">
                                    El <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">Pasillo</span>
                                </h1>
                                <p className="text-zinc-500 mt-2 text-sm font-light">Gestiona tus aulas virtuales y comunidades académicas</p>
                            </div>
                            <Link href="/dashboard/clases/nueva"
                                className="group relative px-8 py-3 bg-white text-black rounded-2xl font-bold text-sm hover:scale-105 transition-all duration-500 overflow-hidden">
                                <span className="relative z-10 flex items-center gap-2">
                                    <span className="text-lg">+</span> Nueva Aula
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                        </div>

                        {creatorAulas.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-40 text-center relative">
                                <div className="relative mb-8">
                                    <div className="text-7xl relative z-10 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700 cursor-default">🏫</div>
                                    <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full" />
                                </div>
                                <h2 className="text-2xl font-light text-zinc-300 mb-4 tracking-tight">Tu pasillo universitario está en silencio</h2>
                                <p className="text-zinc-500 text-sm max-w-xs leading-relaxed font-light">
                                    Comienza tu legado educativo creando la primera aula para tu comunidad.
                                </p>
                                <Link href="/dashboard/clases/nueva"
                                    className="mt-10 px-8 py-3.5 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-2xl font-bold text-sm hover:bg-indigo-600 hover:text-white transition-all duration-500">
                                    Fundar Aula
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {creatorAulas.map((aula: any) => (
                                    <Link key={aula.id} href={`/dashboard/clases/${aula.id}`}>
                                        <div className="relative h-72 rounded-[40px] border border-white/5 bg-white/[0.02] p-10 group hover:border-indigo-500/40 hover:bg-white/[0.04] transition-all duration-700 cursor-pointer overflow-hidden backdrop-blur-sm">
                                            {/* Glow effect */}
                                            <div className={`absolute top-0 right-0 w-48 h-48 blur-[80px] -translate-y-1/2 translate-x-1/2 transition-all duration-700 ${aula.is_active ? 'bg-indigo-500/40 opacity-100' : 'bg-indigo-500/5 opacity-0 group-hover:opacity-100 group-hover:bg-indigo-500/20'}`} />

                                            {/* Status Badge */}
                                            {aula.is_active && (
                                                <div className="absolute top-6 right-8 flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
                                                    <span className="text-[10px] uppercase tracking-widest text-green-400 font-black">En vivo</span>
                                                </div>
                                            )}

                                            {/* Icon/Logo */}
                                            <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-indigo-500/10 to-violet-500/5 border border-white/10 flex items-center justify-center mb-8 font-black text-white text-2xl group-hover:scale-110 group-hover:border-indigo-500/30 transition-all duration-700 shadow-2xl">
                                                {aula.nombre.charAt(0).toUpperCase()}
                                            </div>

                                            <div className="space-y-3">
                                                <h3 className="text-xl font-bold uppercase tracking-tight group-hover:text-indigo-300 transition-colors duration-500">{aula.nombre}</h3>
                                                <p className="text-zinc-500 text-sm font-light leading-relaxed line-clamp-2">{aula.descripcion || 'Sin descripción académica definida.'}</p>
                                            </div>

                                            <div className="absolute bottom-10 left-10 flex items-center gap-2 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-700">
                                                <span className="text-[10px] uppercase tracking-[0.4em] text-indigo-400 font-bold">Entrar en el aula</span>
                                                <span className="text-indigo-400">→</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
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
