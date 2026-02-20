"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, BookOpen, Video, FileText, ChevronLeft, Send, Brain } from "lucide-react";
import { generateAICourseContent } from "./actions";

export default function NuevaAulaPage() {
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [videoUrl, setVideoUrl] = useState("");
    const [esquema, setEsquema] = useState("");
    const [preguntasRaw, setPreguntasRaw] = useState("");
    const [loading, setLoading] = useState(false);
    const [aiGenerating, setAiGenerating] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [showAiModal, setShowAiModal] = useState(false);

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

        if (!communityId) {
            alert("Necesitas pertenecer a una comunidad para crear un aula.");
            setLoading(false);
            return;
        }

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
        } else {
            console.error(error);
            alert("Error al crear el aula");
        }
        setLoading(false);
    };

    const handleAIGenerate = async () => {
        if (!transcript.trim()) return;
        setAiGenerating(true);
        try {
            const result = await generateAICourseContent(transcript);
            if (result) {
                setDescripcion(result.summary || "");
                setEsquema(result.schema || "");
                setPreguntasRaw(result.questions?.join('\n') || "");
                setShowAiModal(false);
            }
        } catch (err) {
            console.error(err);
            alert("Error al generar contenido con IA");
        }
        setAiGenerating(false);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white p-6 md:p-12 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/5 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-violet-600/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="max-w-5xl mx-auto relative z-10">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-[10px] text-zinc-500 uppercase tracking-[0.3em] hover:text-white transition-all mb-12 group"
                >
                    <ChevronLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                    Regresar al Pasillo
                </button>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] uppercase tracking-[0.4em] text-indigo-500 font-black">Constructor de Clases</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">Crear Nueva <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">Aula Virtual</span></h1>
                        <p className="text-zinc-500 mt-4 text-lg font-light">Diseña una experiencia educativa de alto impacto para tu comunidad.</p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowAiModal(true)}
                        className="flex items-center gap-3 px-8 py-4 bg-indigo-600/10 border border-indigo-500/30 rounded-2xl text-indigo-400 text-xs font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-xl group"
                    >
                        <Sparkles className="w-4 h-4 animate-pulse" />
                        IA Content Magic
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column: Basic Info */}
                    <div className="lg:col-span-7 space-y-10">
                        <div className="bg-white/[0.02] border border-white/5 rounded-[40px] p-10 backdrop-blur-sm space-y-8">
                            <div className="space-y-3">
                                <h3 className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 font-black flex items-center gap-2">
                                    <FileText className="w-3 h-3" />
                                    Identidad de la Clase
                                </h3>
                                <div className="space-y-4">
                                    <input
                                        required
                                        value={nombre}
                                        onChange={e => setNombre(e.target.value)}
                                        placeholder="Nombre del aula (ej: Masterclass de Marketing)"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-lg font-bold text-white placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500/30 transition-all"
                                    />
                                    <textarea
                                        value={descripcion}
                                        onChange={e => setDescripcion(e.target.value)}
                                        rows={4}
                                        placeholder="Breve descripción académica para los alumnos..."
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500/30 resize-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 font-black flex items-center gap-2">
                                    <Video className="w-3 h-3" />
                                    Contenido Audiovisual
                                </h3>
                                <input
                                    value={videoUrl}
                                    onChange={e => setVideoUrl(e.target.value)}
                                    placeholder="URL del vídeo (YouTube, Vimeo...)"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500/30 transition-all"
                                />
                                <p className="text-[10px] text-zinc-600 ml-2 italic">Asegúrate de usar el enlace de 'Insertar' (embed) si es YouTube.</p>
                            </div>
                        </div>

                        <div className="bg-white/[0.02] border border-white/5 rounded-[40px] p-10 backdrop-blur-sm space-y-3">
                            <h3 className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 font-black flex items-center gap-2">
                                <Brain className="w-3 h-3" />
                                Evaluación & Nivel
                            </h3>
                            <textarea
                                value={preguntasRaw}
                                onChange={e => setPreguntasRaw(e.target.value)}
                                rows={6}
                                placeholder={"Escribe una pregunta por línea para el examen final...\n¿Cuál es el concepto principal?\n¿Cómo se aplica X en Y?\n..."}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500/30 resize-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Right Column: Schema/Plan */}
                    <div className="lg:col-span-5 space-y-8">
                        <div className="bg-white/[0.02] border border-white/5 rounded-[40px] p-10 backdrop-blur-sm h-full flex flex-col">
                            <h3 className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 font-black mb-6 flex items-center gap-2">
                                <BookOpen className="w-3 h-3" />
                                Plan de Estudios (Esquema)
                            </h3>
                            <textarea
                                value={esquema}
                                onChange={e => setEsquema(e.target.value)}
                                rows={20}
                                placeholder="Escribe el índice de contenidos o puntos clave que aparecerán en el sidebar de la clase..."
                                className="flex-1 w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500/30 resize-none font-mono transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !nombre.trim()}
                            className="w-full py-6 bg-white text-black rounded-[26px] font-black uppercase tracking-[0.2em] text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-indigo-500/10 flex items-center justify-center gap-4 disabled:opacity-30"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            Fundar Aula Académica
                        </button>
                    </div>
                </form>
            </div>

            {/* AI Modal */}
            {showAiModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-black/60">
                    <div className="bg-[#0f0f12] border border-white/10 rounded-[40px] p-10 max-w-2xl w-full shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-tight">Magia IA de Saby</h3>
                        </div>
                        <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
                            Pega aquí la transcripción de tu video y la IA de Saby generará automáticamente un resumen, el plan de estudios y un examen de nivel.
                        </p>
                        <textarea
                            value={transcript}
                            onChange={e => setTranscript(e.target.value)}
                            placeholder="Pega la transcripción aquí..."
                            className="w-full h-64 bg-white/5 border border-white/10 rounded-3xl px-6 py-5 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500/30 resize-none mb-8 transition-all"
                        />
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowAiModal(false)}
                                className="flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAIGenerate}
                                disabled={aiGenerating || !transcript.trim()}
                                className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20 disabled:opacity-30"
                            >
                                {aiGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                Generar Contenido Magico
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
