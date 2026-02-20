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

    if (profileError) {
        console.error('[dashboard] get_my_profile error:', profileError);
    }

    const profile = profileData?.[0] ?? null;
    if (!profile?.global_role) redirect("/onboarding");

    // Fetch communities
    const { data: memberships } = await supabase
        .from('memberships')
        .select('*, communities(*)')
        .eq('user_id', user.id);

    const communities = memberships?.map((m: any) => m.communities).filter(Boolean) || [];

    // Fetch aulas for each community
    let aulas: any[] = [];
    if (communities.length > 0) {
        const { data } = await supabase
            .from('aulas')
            .select('*, profesores_ia(*)')
            .in('community_id', communities.map((c: any) => c.id));
        aulas = data || [];
    }

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white flex">
            <Sidebar profile={profile} />
            <main className="flex-1 ml-64 p-12">
                {/* Header */}
                <div className="mb-12 flex justify-between items-end">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-indigo-400 mb-2">Universidad Saby</p>
                        <h1 className="text-3xl font-light tracking-wider uppercase">El Pasillo</h1>
                        <p className="text-zinc-500 mt-1">Elige un aula y empieza a aprender</p>
                    </div>
                    {profile.global_role === 'creator' && (
                        <Link href="/dashboard/clases/nueva" className="px-6 py-2.5 bg-white text-black rounded-xl font-bold text-sm tracking-tight hover:bg-zinc-200 transition-all shadow-xl shadow-white/10">
                            + Nueva Aula
                        </Link>
                    )}
                </div>

                {/* Hallway Grid */}
                {aulas.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <div className="text-6xl mb-6">🏫</div>
                        <h2 className="text-xl font-light text-zinc-400 mb-3">El pasillo está vacío</h2>
                        <p className="text-zinc-600 text-sm max-w-xs">
                            {profile.global_role === 'creator'
                                ? 'Crea tu primera aula para empezar a compartir conocimiento.'
                                : 'Aún no hay aulas disponibles. Vuelve pronto.'}
                        </p>
                        {profile.global_role === 'creator' && (
                            <Link href="/dashboard/clases/nueva" className="mt-6 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-500 transition-all">
                                Crear primera aula
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {aulas.map((aula: any) => (
                            <Link key={aula.id} href={`/dashboard/clases/${aula.id}`}>
                                <div className="relative h-64 rounded-[28px] border border-white/5 bg-white/[0.02] backdrop-blur-3xl p-8 group hover:border-indigo-500/40 transition-all cursor-pointer overflow-hidden">
                                    {/* Glow effect */}
                                    <div className={`absolute top-0 right-0 w-40 h-40 blur-[60px] -translate-y-1/2 translate-x-1/2 transition-colors ${aula.is_active ? 'bg-indigo-500/30' : 'bg-white/5 group-hover:bg-indigo-500/15'}`} />

                                    {/* Active indicator */}
                                    {aula.is_active && (
                                        <div className="absolute top-5 right-5 flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                            <span className="text-[9px] uppercase tracking-widest text-green-400 font-bold">En vivo</span>
                                        </div>
                                    )}

                                    {/* Door number */}
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-5 font-bold text-indigo-400 text-lg group-hover:bg-indigo-500/20 transition-colors">
                                        {aula.nombre.charAt(0).toUpperCase()}
                                    </div>

                                    <h3 className="text-lg font-bold mb-2 uppercase tracking-tight group-hover:tracking-[0.05em] transition-all duration-500">
                                        {aula.nombre}
                                    </h3>
                                    <p className="text-zinc-500 text-sm leading-relaxed line-clamp-2">
                                        {aula.descripcion || 'Entra al aula para ver el contenido.'}
                                    </p>

                                    <div className="absolute bottom-6 left-8 right-8 flex items-center justify-between">
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
