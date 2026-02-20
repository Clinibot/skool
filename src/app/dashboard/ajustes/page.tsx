import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { setUserRole } from "../actions";
import { Settings, User, Shield, Zap } from "lucide-react";

export default async function AjustesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (!profile?.global_role) redirect("/onboarding");

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white flex overflow-hidden">
            <Sidebar profile={profile} />
            <main className="flex-1 ml-64 p-12 relative flex flex-col h-screen overflow-y-auto scrollbar-hide">
                {/* Decorative background */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/[0.03] blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10 max-w-4xl mx-auto w-full">
                    <div className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500">
                                <Settings className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.4em] text-indigo-500 font-black">Configuración</p>
                                <h1 className="text-3xl font-black tracking-tight uppercase mt-1">
                                    Ajustes de <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">Cuenta</span>
                                </h1>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Profile Section */}
                        <section className="bg-white/[0.02] border border-white/5 rounded-[40px] p-10 backdrop-blur-sm">
                            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-zinc-500 mb-8 flex items-center gap-3">
                                <User className="w-4 h-4" />
                                Perfil Académico
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest text-zinc-600 font-black ml-1">Nombre Completo</label>
                                    <div className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-zinc-400">
                                        {profile.full_name || profile.username}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest text-zinc-600 font-black ml-1">Email de Acceso</label>
                                    <div className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-zinc-400">
                                        {user.email}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Role Switching Section */}
                        <section className="bg-white/[0.02] border border-white/5 rounded-[40px] p-10 backdrop-blur-sm relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="relative z-10">
                                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-zinc-500 mb-2 flex items-center gap-3">
                                    <Shield className="w-4 h-4 text-indigo-500" />
                                    Identidad en la Plataforma
                                </h3>
                                <p className="text-zinc-500 text-xs font-light mb-10">Cambia tu rol para explorar las diferentes funcionalidades de Saby Uni.</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <form action={async () => {
                                        "use server";
                                        await setUserRole('creator');
                                        redirect('/dashboard');
                                    }}>
                                        <button
                                            type="submit"
                                            disabled={profile.global_role === 'creator'}
                                            className={`w-full p-8 rounded-[32px] border text-left transition-all ${profile.global_role === 'creator'
                                                ? 'border-indigo-500/50 bg-indigo-500/10 cursor-default'
                                                : 'border-white/5 bg-white/[0.01] hover:border-white/20 hover:bg-white/[0.03]'}`}
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-lg font-black uppercase tracking-tight">Modo Rector</h4>
                                                {profile.global_role === 'creator' && <div className="px-3 py-1 bg-indigo-500 text-[8px] font-black uppercase tracking-widest rounded-full">Activo</div>}
                                            </div>
                                            <p className="text-zinc-500 text-[11px] leading-relaxed">Acceso completo a la creación de aulas, gestión de profesores IA y expedientes de alumnos.</p>
                                        </button>
                                    </form>

                                    <form action={async () => {
                                        "use server";
                                        await setUserRole('participant');
                                        redirect('/dashboard');
                                    }}>
                                        <button
                                            type="submit"
                                            disabled={profile.global_role === 'participant'}
                                            className={`w-full p-8 rounded-[32px] border text-left transition-all ${profile.global_role === 'participant'
                                                ? 'border-violet-500/50 bg-violet-500/10 cursor-default'
                                                : 'border-white/5 bg-white/[0.01] hover:border-white/20 hover:bg-white/[0.03]'}`}
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-lg font-black uppercase tracking-tight">Modo Alumno</h4>
                                                {profile.global_role === 'participant' && <div className="px-3 py-1 bg-violet-500 text-[8px] font-black uppercase tracking-widest rounded-full">Activo</div>}
                                            </div>
                                            <p className="text-zinc-500 text-[11px] leading-relaxed">Experiencia de aprendizaje, acceso a comunidades, participación en foros y realización de exámenes.</p>
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </section>

                        <div className="flex items-center justify-center gap-2 py-8 opacity-20 hover:opacity-100 transition-opacity">
                            <Zap className="w-3 h-3 text-indigo-500" />
                            <p className="text-[10px] uppercase tracking-[0.5em] font-black">Protocolo Saby Uni v1.0</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
