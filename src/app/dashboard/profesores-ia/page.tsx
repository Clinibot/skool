import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import Link from "next/link";
import { Zap, ChevronRight, GraduationCap, Bot } from "lucide-react";

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
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
                                    <Bot className="w-6 h-6" />
                                </div>
                                <p className="text-[10px] uppercase tracking-[0.4em] text-violet-400 font-black">Facultad de Inteligencia</p>
                            </div>
                            <h1 className="text-4xl font-black tracking-tighter uppercase">
                                Profesores <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">IA</span>
                            </h1>
                            <p className="text-zinc-500 mt-2 text-lg font-light">Diseña y supervisa a los docentes virtuales de tu universidad.</p>
                        </div>
                        <Link href="/dashboard/profesores-ia/nuevo"
                            className="group relative px-10 py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all duration-500 overflow-hidden shadow-2xl">
                            <span className="relative z-10 flex items-center gap-2">
                                + Reclutar Profesor
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-100 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                    </div>

                    {profesores.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-40 text-center relative border border-white/5 bg-white/[0.01] rounded-[60px] border-dashed">
                            <div className="relative mb-8">
                                <div className="text-7xl relative z-10 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700 cursor-default">🤖</div>
                                <div className="absolute inset-0 bg-violet-500/20 blur-3xl rounded-full" />
                            </div>
                            <h2 className="text-2xl font-black text-zinc-300 mb-4 tracking-tight uppercase">Tu claustro de profesores está vacío</h2>
                            <p className="text-zinc-500 text-sm max-w-xs leading-relaxed font-light">
                                Crea tu primer asistente de IA para automatizar el aprendizaje y soporte de tus alumnos.
                            </p>
                            <Link href="/dashboard/profesores-ia/nuevo"
                                className="mt-10 px-8 py-3.5 bg-violet-600/10 border border-violet-500/20 text-violet-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-violet-600 hover:text-white transition-all duration-500">
                                Reclutar Catedrático IA
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {profesores.map((p: any) => (
                                <Link key={p.id} href={`/dashboard/profesores-ia/${p.id}`}>
                                    <div className="relative p-10 rounded-[45px] border border-white/5 bg-white/[0.02] hover:border-indigo-500/30 hover:bg-white/[0.04] transition-all duration-700 group cursor-pointer backdrop-blur-sm overflow-hidden h-full flex flex-col">
                                        {/* Animated Glow */}
                                        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/5 blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-600/20 transition-all duration-700" />

                                        <div className="relative mb-10 w-20 h-20 rounded-[28px] bg-gradient-to-tr from-white/[0.05] to-white/[0.01] border border-white/5 flex items-center justify-center text-4xl shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-700">
                                            {p.avatar_emoji || '🤖'}
                                            <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500/20 to-violet-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>

                                        <div className="flex-1 relative z-10">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                                                <span className="text-[10px] uppercase tracking-[0.4em] text-indigo-400 font-black">Catedrático Virtual</span>
                                            </div>
                                            <h3 className="font-black text-2xl mb-2 text-white uppercase tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/60 transition-all">{p.nombre}</h3>
                                            <div className="inline-block px-4 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-[10px] uppercase tracking-widest text-zinc-500 font-black mb-6">
                                                Especialidad: <span className="text-zinc-300 ml-1">{p.materia || 'General'}</span>
                                            </div>
                                            <p className="text-zinc-500 text-sm font-light leading-relaxed line-clamp-3 mb-8 italic">"{p.personalidad}"</p>
                                        </div>

                                        <div className="mt-auto flex items-center justify-between pt-8 border-t border-white/10 relative z-10">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                                                    <Zap className="w-3.5 h-3.5" />
                                                </div>
                                                <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-bold">{p.modelo}</span>
                                            </div>
                                            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-500">
                                                <ChevronRight className="w-4 h-4" />
                                            </div>
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
