"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const EMOJIS = ['🤖', '👩‍🏫', '👨‍🏫', '🎓', '🦉', '🧠', '📚', '🌟', '🚀', '💡'];

export default function NuevoProfesorIAPage() {
    const [nombre, setNombre] = useState("");
    const [materia, setMateria] = useState("");
    const [personalidad, setPersonalidad] = useState("Amable, paciente y pedagógico");
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
        <div className="min-h-screen bg-[#0a0a0b] text-white p-12">
            <div className="max-w-xl mx-auto">
                <button onClick={() => router.back()} className="text-[10px] text-zinc-600 uppercase tracking-widest hover:text-zinc-400 transition-colors mb-8 block">
                    ← Volver
                </button>
                <h1 className="text-3xl font-light tracking-wider uppercase mb-2">Nuevo Profesor IA</h1>
                <p className="text-zinc-500 mb-10">Crea un asistente de inteligencia artificial para tus clases</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Avatar Emoji */}
                    <div>
                        <label className="text-xs uppercase tracking-widest text-zinc-500 block mb-3">Avatar</label>
                        <div className="flex flex-wrap gap-3">
                            {EMOJIS.map(e => (
                                <button key={e} type="button" onClick={() => setEmoji(e)}
                                    className={`w-12 h-12 rounded-xl text-2xl transition-all ${emoji === e ? 'bg-indigo-500/20 border border-indigo-500/50 scale-110' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}>
                                    {e}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-xs uppercase tracking-widest text-zinc-500 block mb-2">Nombre *</label>
                        <input required value={nombre} onChange={e => setNombre(e.target.value)}
                            placeholder="Ej: Prof. Ana García"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-colors" />
                    </div>
                    <div>
                        <label className="text-xs uppercase tracking-widest text-zinc-500 block mb-2">Materia</label>
                        <input value={materia} onChange={e => setMateria(e.target.value)}
                            placeholder="Ej: Matemáticas, Historia, Programación..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-colors" />
                    </div>
                    <div>
                        <label className="text-xs uppercase tracking-widest text-zinc-500 block mb-2">Personalidad / Instrucciones</label>
                        <textarea value={personalidad} onChange={e => setPersonalidad(e.target.value)}
                            rows={4} placeholder="Describe cómo debe comportarse este profesor IA..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 resize-none transition-colors" />
                    </div>
                    <div>
                        <label className="text-xs uppercase tracking-widest text-zinc-500 block mb-2">Modelo IA</label>
                        <select value={modelo} onChange={e => setModelo(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500/50 transition-colors">
                            <option value="gpt-4o-mini">GPT-4o Mini (rápido)</option>
                            <option value="gpt-4o">GPT-4o (potente)</option>
                            <option value="claude-3-5-haiku">Claude 3.5 Haiku</option>
                            <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                        </select>
                    </div>
                    <button type="submit" disabled={loading || !nombre.trim()}
                        className="w-full py-4 bg-white text-black rounded-xl font-bold hover:bg-zinc-200 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Crear Profesor IA
                    </button>
                </form>
            </div>
        </div>
    );
}
