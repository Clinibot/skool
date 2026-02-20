"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, ChevronLeft, Bot, Sparkles, Brain, Cpu, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

const EMOJIS = ['🤖', '👩‍🏫', '👨‍🏫', '🎓', '🦉', '🧠', '📚', '🌟', '🚀', '💡'];

export default function NuevoProfesorIAPage() {
    const [nombre, setNombre] = useState("");
    const [materia, setMateria] = useState("");
    const [personalidad, setPersonalidad] = useState("Amable, paciente y pedagógico. Siempre motiva al alumno a seguir aprendiendo.");
    const [modelo, setModelo] = useState("gpt-4o-mini");
    const [emoji, setEmoji] = useState("🤖");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: memberships } = await supabase
            .from('memberships').select('community_id').eq('user_id', user.id).limit(1);
        const communityId = memberships?.[0]?.community_id;
        if (!communityId) { setLoading(false); return; }

        const { error } = await supabase.from('profesores_ia').insert({
            community_id: communityId,
            nombre, materia, personalidad, modelo, avatar_emoji: emoji,
        });

        if (!error) router.push('/dashboard/profesores-ia');
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white p-6 md:p-12 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-violet-600/5 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="max-w-3xl mx-auto relative z-10">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-[10px] text-zinc-500 uppercase tracking-[0.3em] hover:text-white transition-all mb-12 group"
                >
                    <ChevronLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                    Regresar al Claustro
                </button>

                <div className="mb-16">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
                            <Bot className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] uppercase tracking-[0.4em] text-violet-500 font-black">Departamento de Reclutamiento</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">Reclutar <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">Catedrático IA</span></h1>
                    <p className="text-zinc-500 mt-4 text-lg font-light">Diseña el intelecto y la personalidad que guiará a tus estudiantes.</p>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Left Column: Avatar & Basic Info */}
                    <div className="md:col-span-7 space-y-8">
                        <div className="bg-white/[0.02] border border-white/5 rounded-[40px] p-8 md:p-10 backdrop-blur-sm space-y-8 shadow-2xl">
                            <div className="space-y-4">
                                <h3 className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 font-black flex items-center gap-2">
                                    <Sparkles className="w-3 h-3" />
                                    Identidad del Agente
                                </h3>
                                <div className="space-y-4">
                                    <input
                                        required
                                        value={nombre}
                                        onChange={e => setNombre(e.target.value)}
                                        placeholder="Nombre del Profesor (ej: Dr. Saby AI)"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-lg font-bold text-white placeholder:text-zinc-700 focus:outline-none focus:border-violet-500/30 transition-all"
                                    />
                                    <input
                                        value={materia}
                                        onChange={e => setMateria(e.target.value)}
                                        placeholder="Materia o Especialidad (ej: Marketing Digital)"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-violet-500/30 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 font-black flex items-center gap-2">
                                    <MessageSquare className="w-3 h-3" />
                                    Psique & Comportamiento
                                </h3>
                                <textarea
                                    rows={5}
                                    value={personalidad}
                                    onChange={e => setPersonalidad(e.target.value)}
                                    placeholder="Describe cómo debe actuar, su tono y sus objetivos..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-violet-500/30 resize-none transition-all leading-relaxed"
                                />
                                <p className="text-[10px] text-zinc-700 ml-2 italic leading-relaxed">Este texto define el "Prompt del Sistema" que el agente seguirá durante sus interacciones.</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Visual & Engine */}
                    <div className="md:col-span-5 space-y-8">
                        <div className="bg-white/[0.02] border border-white/5 rounded-[40px] p-8 md:p-10 backdrop-blur-sm space-y-8 shadow-2xl">
                            <div className="space-y-4">
                                <h3 className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 font-black flex items-center gap-2">
                                    <Brain className="w-3 h-3" />
                                    Representación
                                </h3>
                                <div className="grid grid-cols-5 gap-3">
                                    {EMOJIS.map(e => (
                                        <button
                                            key={e}
                                            type="button"
                                            onClick={() => setEmoji(e)}
                                            className={`aspect-square rounded-2xl text-2xl flex items-center justify-center transition-all ${emoji === e ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/40 scale-110' : 'bg-white/5 border border-white/10 text-zinc-500 hover:bg-white/10'}`}
                                        >
                                            {e}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 font-black flex items-center gap-2">
                                    <Cpu className="w-3 h-3" />
                                    Motor Cognitivo
                                </h3>
                                <select
                                    value={modelo}
                                    onChange={e => setModelo(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm text-white focus:outline-none focus:border-violet-500/30 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="gpt-4o-mini">GPT-4o Mini (Óptimo)</option>
                                    <option value="gpt-4o">GPT-4o (Avanzado)</option>
                                    <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                                </select>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading || !nombre.trim()}
                                    className="w-full py-5 bg-white text-black rounded-[24px] font-black uppercase tracking-[0.2em] text-[10px] hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-30"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Bot className="w-5 h-5" />}
                                    Dar de Alta Profesor
                                </button>
                            </div>
                        </div>

                        <div className="p-8 rounded-[30px] border border-yellow-500/10 bg-yellow-500/[0.02] text-yellow-500/60 text-[10px] leading-relaxed uppercase tracking-widest font-black text-center">
                            Recordatorio: Una vez creado, podrás asignar este profesor a tus aulas virtuales desde la sección de edición de clases.
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
