"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function NuevaAulaPage() {
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [videoUrl, setVideoUrl] = useState("");
    const [esquema, setEsquema] = useState("");
    const [preguntasRaw, setPreguntasRaw] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get first community
        const { data: memberships } = await supabase
            .from('memberships').select('community_id').eq('user_id', user.id).limit(1);
        const communityId = memberships?.[0]?.community_id;
        if (!communityId) { setLoading(false); return; }

        const preguntas = preguntasRaw.split('\n').map(p => p.trim()).filter(Boolean);

        const { data, error } = await supabase.from('aulas').insert({
            community_id: communityId,
            nombre,
            descripcion,
            video_url: videoUrl || null,
            esquema: esquema || null,
            preguntas_examen: preguntas,
        }).select().single();

        if (!error && data) {
            router.push(`/dashboard/clases/${data.id}`);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white p-12">
            <div className="max-w-2xl mx-auto">
                <button onClick={() => router.back()} className="text-[10px] text-zinc-600 uppercase tracking-widest hover:text-zinc-400 transition-colors mb-8 block">
                    ← Volver
                </button>
                <h1 className="text-3xl font-light tracking-wider uppercase mb-2">Nueva Aula</h1>
                <p className="text-zinc-500 mb-10">Configura tu nueva clase virtual</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="text-xs uppercase tracking-widest text-zinc-500 block mb-2">Nombre del aula *</label>
                        <input required value={nombre} onChange={e => setNombre(e.target.value)}
                            placeholder="Ej: Álgebra Lineal"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-colors" />
                    </div>
                    <div>
                        <label className="text-xs uppercase tracking-widest text-zinc-500 block mb-2">Descripción</label>
                        <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)}
                            rows={3} placeholder="¿De qué trata esta clase?"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 resize-none transition-colors" />
                    </div>
                    <div>
                        <label className="text-xs uppercase tracking-widest text-zinc-500 block mb-2">URL del vídeo (YouTube embed, Vimeo, etc.)</label>
                        <input value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
                            placeholder="https://www.youtube.com/embed/..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-colors" />
                    </div>
                    <div>
                        <label className="text-xs uppercase tracking-widest text-zinc-500 block mb-2">Esquema / resumen de la clase</label>
                        <textarea value={esquema} onChange={e => setEsquema(e.target.value)}
                            rows={6} placeholder="Escribe el índice de contenidos, resumen o puntos clave..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 resize-none font-mono text-sm transition-colors" />
                    </div>
                    <div>
                        <label className="text-xs uppercase tracking-widest text-zinc-500 block mb-2">Preguntas del examen (una por línea)</label>
                        <textarea value={preguntasRaw} onChange={e => setPreguntasRaw(e.target.value)}
                            rows={5} placeholder={"¿Qué es una matriz?\n¿Para qué sirve la determinante?\nDefine vector propio."}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 resize-none text-sm transition-colors" />
                    </div>
                    <button type="submit" disabled={loading || !nombre.trim()}
                        className="w-full py-4 bg-white text-black rounded-xl font-bold hover:bg-zinc-200 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Crear Aula
                    </button>
                </form>
            </div>
        </div>
    );
}
