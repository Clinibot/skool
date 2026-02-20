import { createClient, createPublicClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import Link from "next/link";

export default async function TribuPage({ params }: { params: { communityId: string } }) {
    const supabase = await createClient();
    const publicSupabase = await createPublicClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const { data: profileData } = await publicSupabase.rpc('get_my_profile', { uid: user!.id });
    const profile = profileData?.[0] ?? null;
    if (!profile?.global_role) redirect("/onboarding");

    // Verify membership
    const { data: membership } = await supabase
        .from('memberships')
        .select('*, communities(*)')
        .eq('user_id', user!.id)
        .eq('community_id', params.communityId)
        .single();

    if (!membership) notFound();
    const community = membership.communities as any;

    // Get aulas for this community
    const { data: aulas } = await supabase
        .from('aulas')
        .select('*')
        .eq('community_id', params.communityId)
        .order('created_at', { ascending: true });

    // Get recent cafetería messages count
    const { count: cafCount } = await supabase
        .from('mensajes')
        .select('*', { count: 'exact', head: true })
        .eq('tipo', 'cafeteria');

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white flex">
            <Sidebar profile={profile} />
            <main className="flex-1 ml-64">
                {/* Hero banner */}
                <div className="relative h-48 bg-gradient-to-br from-violet-900/40 via-indigo-900/30 to-transparent border-b border-white/5 flex items-end p-10 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] to-transparent z-10" />
                    <div className="absolute top-0 left-0 w-96 h-96 bg-violet-600/20 blur-[100px] rounded-full -translate-x-1/2 -translate-y-1/2" />
                    <div className="relative z-20">
                        <Link href="/dashboard" className="text-[10px] text-zinc-600 uppercase tracking-widest hover:text-zinc-400 transition-colors block mb-3">
                            ← Mis Tribus
                        </Link>
                        <h1 className="text-3xl font-bold">{community.name}</h1>
                        {community.description && (
                            <p className="text-zinc-400 text-sm mt-1">{community.description}</p>
                        )}
                    </div>
                </div>

                <div className="p-10 space-y-10">
                    {/* Quick access */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Cafetería */}
                        <Link href={`/dashboard/cafeteria`}>
                            <div className="group flex items-center gap-6 p-7 rounded-[24px] border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-500/40 transition-all cursor-pointer">
                                <div className="text-4xl">☕</div>
                                <div>
                                    <h2 className="text-lg font-bold group-hover:text-amber-300 transition-colors">Cafetería</h2>
                                    <p className="text-zinc-500 text-sm mt-0.5">Chat social de la comunidad</p>
                                </div>
                                <span className="ml-auto text-zinc-600 group-hover:translate-x-1 transition-transform">→</span>
                            </div>
                        </Link>

                        {/* Clases */}
                        <div className="group flex items-center gap-6 p-7 rounded-[24px] border border-indigo-500/20 bg-indigo-500/5">
                            <div className="text-4xl">🎓</div>
                            <div>
                                <h2 className="text-lg font-bold text-indigo-300">{aulas?.length || 0} Aulas disponibles</h2>
                                <p className="text-zinc-500 text-sm mt-0.5">Clases magistrales con vídeo y exámenes</p>
                            </div>
                        </div>
                    </div>

                    {/* Pasillo de aulas */}
                    <div>
                        <h2 className="text-xs uppercase tracking-[0.3em] text-zinc-500 mb-5">
                            🏫 El Pasillo — Aulas
                        </h2>

                        {!aulas || aulas.length === 0 ? (
                            <div className="text-center py-16 rounded-[24px] border border-white/5 bg-white/[0.01]">
                                <p className="text-zinc-600">El creador aún no ha publicado ninguna clase.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {aulas.map((aula: any) => (
                                    <Link key={aula.id} href={`/dashboard/clases/${aula.id}`}>
                                        <div className="relative h-52 rounded-[24px] border border-white/5 bg-white/[0.02] p-7 group hover:border-indigo-500/30 transition-all cursor-pointer overflow-hidden">
                                            <div className={`absolute top-0 right-0 w-32 h-32 blur-[50px] -translate-y-1/2 translate-x-1/2 transition-colors ${aula.is_active ? 'bg-green-500/25' : 'bg-white/5 group-hover:bg-indigo-500/15'}`} />

                                            {aula.is_active && (
                                                <div className="absolute top-4 right-4 flex items-center gap-1.5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                                    <span className="text-[9px] uppercase tracking-widest text-green-400 font-bold">En vivo</span>
                                                </div>
                                            )}

                                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 font-bold text-indigo-400">
                                                {aula.nombre.charAt(0).toUpperCase()}
                                            </div>
                                            <h3 className="font-bold mb-1 group-hover:text-indigo-300 transition-colors">{aula.nombre}</h3>
                                            <p className="text-zinc-600 text-xs line-clamp-2">{aula.descripcion || 'Sin descripción'}</p>

                                            <div className="absolute bottom-5 left-7 flex items-center gap-4 text-[10px] text-zinc-700">
                                                {aula.video_url && <span>🎥 Vídeo</span>}
                                                {aula.preguntas_examen?.length > 0 && <span>📝 Examen</span>}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
