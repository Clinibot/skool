import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import Link from "next/link";

export default async function ProfesoresIAPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (!profile?.global_role) redirect("/onboarding");
    if (profile.global_role !== 'creator') redirect("/dashboard");

    const { data: memberships } = await supabase.from('memberships').select('community_id').eq('user_id', user.id);
    const communityIds = memberships?.map((m: any) => m.community_id) || [];

    let profesores: any[] = [];
    if (communityIds.length > 0) {
        const { data } = await supabase.from('profesores_ia').select('*').in('community_id', communityIds).order('created_at', { ascending: false });
        profesores = data || [];
    }

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white flex">
            <Sidebar profile={profile} />
            <main className="flex-1 ml-64 p-12">
                <div className="mb-12 flex justify-between items-end">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-indigo-400 mb-2">Universidad Saby</p>
                        <h1 className="text-3xl font-light tracking-wider uppercase">Profesores IA</h1>
                        <p className="text-zinc-500 mt-1">Crea y gestiona tus asistentes de inteligencia artificial</p>
                    </div>
                    <Link href="/dashboard/profesores-ia/nuevo" className="px-6 py-2.5 bg-white text-black rounded-xl font-bold text-sm hover:bg-zinc-200 transition-all">
                        + Nuevo Profesor IA
                    </Link>
                </div>

                {profesores.length === 0 ? (
                    <div className="text-center py-24">
                        <div className="text-6xl mb-4">🤖</div>
                        <h2 className="text-xl font-light text-zinc-400 mb-3">Sin profesores IA todavía</h2>
                        <p className="text-zinc-600 text-sm mb-6">Crea tu primer asistente de IA para gestionar clases y responder a tus alumnos.</p>
                        <Link href="/dashboard/profesores-ia/nuevo" className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-500 transition-all">
                            Crear primer Profesor IA
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {profesores.map((p: any) => (
                            <Link key={p.id} href={`/dashboard/profesores-ia/${p.id}`}>
                                <div className="p-8 rounded-[28px] border border-white/5 bg-white/[0.02] hover:border-violet-500/30 hover:bg-white/[0.04] transition-all group cursor-pointer">
                                    <div className="text-4xl mb-5">{p.avatar_emoji || '🤖'}</div>
                                    <h3 className="font-bold text-lg mb-1 group-hover:text-violet-300 transition-colors">{p.nombre}</h3>
                                    <p className="text-zinc-500 text-sm mb-3">{p.materia || 'Sin materia asignada'}</p>
                                    <p className="text-zinc-600 text-xs leading-relaxed line-clamp-2">{p.personalidad}</p>
                                    <div className="mt-6 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                                        <span className="text-[10px] uppercase tracking-widest text-zinc-500">{p.modelo}</span>
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
