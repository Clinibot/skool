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
            <main className="flex-1 ml-64 p-12 relative overflow-hidden">
                {/* Decorative items */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10 max-w-7xl mx-auto">
                    <div className="mb-16 flex justify-between items-end">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="h-[1px] w-8 bg-violet-500/50" />
                                <p className="text-[10px] uppercase tracking-[0.4em] text-violet-400 font-bold">Facultad de Inteligencia</p>
                            </div>
                            <h1 className="text-4xl font-extralight tracking-tight uppercase">
                                Profesores <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">IA</span>
                            </h1>
                            <p className="text-zinc-500 mt-2 text-sm font-light">Diseña y supervisa a los docentes virtuales de tu universidad</p>
                        </div>
                        <Link href="/dashboard/profesores-ia/nuevo"
                            className="group relative px-8 py-3 bg-white text-black rounded-2xl font-bold text-sm hover:scale-105 transition-all duration-500 overflow-hidden">
                            <span className="relative z-10 flex items-center gap-2">
                                <span className="text-lg">+</span> Nuevo Profesor
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-100 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                    </div>

                    {profesores.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-40 text-center relative">
                            <div className="relative mb-8">
                                <div className="text-7xl relative z-10 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700 cursor-default">🤖</div>
                                <div className="absolute inset-0 bg-violet-500/20 blur-3xl rounded-full" />
                            </div>
                            <h2 className="text-2xl font-light text-zinc-300 mb-4 tracking-tight">Tu claustro de profesores está vacío</h2>
                            <p className="text-zinc-500 text-sm max-w-xs leading-relaxed font-light">
                                Crea tu primer asistente de IA para automatizar el aprendizaje y soporte de tus alumnos.
                            </p>
                            <Link href="/dashboard/profesores-ia/nuevo"
                                className="mt-10 px-8 py-3.5 bg-violet-600/10 border border-violet-500/20 text-violet-400 rounded-2xl font-bold text-sm hover:bg-violet-600 hover:text-white transition-all duration-500">
                                Reclutar Profesor IA
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {profesores.map((p: any) => (
                                <Link key={p.id} href={`/dashboard/profesores-ia/${p.id}`}>
                                    <div className="relative p-10 rounded-[40px] border border-white/5 bg-white/[0.02] hover:border-violet-500/30 hover:bg-white/[0.04] transition-all duration-700 group cursor-pointer backdrop-blur-sm overflow-hidden h-full flex flex-col">
                                        {/* Glow */}
                                        <div className="absolute top-0 right-0 w-40 h-40 bg-violet-600/10 blur-[60px] -translate-y-1/2 translate-x-1/2 group-hover:bg-violet-600/20 transition-colors duration-700" />

                                        <div className="text-5xl mb-8 group-hover:scale-110 transition-transform duration-700 origin-left grayscale-[0.5] group-hover:grayscale-0">{p.avatar_emoji || '🤖'}</div>

                                        <div className="flex-1">
                                            <h3 className="font-bold text-xl mb-2 group-hover:text-violet-300 transition-colors duration-500 uppercase tracking-tight">{p.nombre}</h3>
                                            <div className="inline-block px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[10px] uppercase tracking-widest text-violet-400 font-bold mb-4">
                                                {p.materia || 'Materia General'}
                                            </div>
                                            <p className="text-zinc-500 text-sm font-light leading-relaxed line-clamp-3 mb-8">{p.personalidad}</p>
                                        </div>

                                        <div className="mt-auto flex items-center justify-between pt-6 border-t border-white/5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.5)]" />
                                                <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-bold">{p.modelo}</span>
                                            </div>
                                            <span className="text-zinc-700 text-sm group-hover:text-violet-400 transition-colors">→</span>
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
