"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronLeft,
    BookOpen,
    Sparkles,
    FileText,
    Video,
    Brain,
    Save,
    Bot,
    Loader2,
    Trash2
} from "lucide-react";
import { updateAula, updateAulaProfessor } from "@/app/dashboard/clases/actions";

interface EditAulaFormProps {
    aula: any;
    profesores: any[];
    assignedProfesorId: string | null;
}

export function EditAulaForm({ aula, profesores, assignedProfesorId }: EditAulaFormProps) {
    const [nombre, setNombre] = useState(aula.nombre);
    const [descripcion, setDescripcion] = useState(aula.descripcion || "");
    const [videoUrl, setVideoUrl] = useState(aula.video_url || "");
    const [esquema, setEsquema] = useState(aula.esquema || "");
    const [preguntasRaw, setPreguntasRaw] = useState(aula.preguntas_examen?.join('\n') || "");
    const [profesorId, setProfesorId] = useState<string | null>(assignedProfesorId);

    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const preguntas = preguntasRaw.split('\n').map(p => p.trim()).filter(p => p !== "");

            await updateAula(aula.id, {
                nombre,
                descripcion,
                video_url: videoUrl,
                esquema,
                preguntas_examen: preguntas
            });

            await updateAulaProfessor(aula.id, profesorId);

            router.push(`/dashboard/clases/${aula.id}`);
            router.refresh();
        } catch (err) {
            console.error(err);
            alert("Error al actualizar la clase");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-12 pb-20">
            <button
                type="button"
                onClick={() => router.back()}
                className="flex items-center gap-2 text-[10px] text-zinc-500 uppercase tracking-[0.3em] hover:text-white transition-all mb-12 group"
            >
                <ChevronLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                Cancelar Cambios
            </button>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] uppercase tracking-[0.4em] text-indigo-500 font-black">Editor de Aulas</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">Editar <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">Lección</span></h1>
                    <p className="text-zinc-500 mt-4 text-lg font-light">Actualiza el contenido académico y asigna un mentor virtual.</p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-3 px-10 py-5 bg-white text-black rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl disabled:opacity-30"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Guardar Cambios
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left Column: Basic Info & AI Professor */}
                <div className="lg:col-span-7 space-y-10">
                    <div className="bg-white/[0.02] border border-white/5 rounded-[40px] p-10 backdrop-blur-sm space-y-10 shadow-2xl">
                        <div className="space-y-4">
                            <h3 className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 font-black flex items-center gap-2">
                                <FileText className="w-3 h-3" />
                                Identidad de la Clase
                            </h3>
                            <div className="space-y-4">
                                <input
                                    required
                                    value={nombre}
                                    onChange={e => setNombre(e.target.value)}
                                    placeholder="Nombre del aula"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-xl font-bold text-white placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500/30 transition-all"
                                />
                                <textarea
                                    value={descripcion}
                                    onChange={e => setDescripcion(e.target.value)}
                                    rows={4}
                                    placeholder="Descripción académica..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500/30 resize-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 font-black flex items-center gap-2">
                                <Bot className="w-3 h-3" />
                                Asignación de Profesor IA
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div
                                    onClick={() => setProfesorId(null)}
                                    className={`p-6 rounded-3xl border cursor-pointer transition-all flex items-center gap-4 ${profesorId === null ? 'bg-indigo-600/10 border-indigo-500/40' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                                >
                                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-500">
                                        <Trash2 className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-black uppercase tracking-tight text-white">Sin Mentor</p>
                                        <p className="text-[10px] text-zinc-600 uppercase font-bold mt-0.5">La clase no tendrá IA</p>
                                    </div>
                                </div>

                                {profesores.map((p: any) => (
                                    <div
                                        key={p.id}
                                        onClick={() => setProfesorId(p.id)}
                                        className={`p-6 rounded-3xl border cursor-pointer transition-all flex items-center gap-4 ${profesorId === p.id ? 'bg-indigo-600/10 border-indigo-500/40 shadow-lg shadow-indigo-900/10' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center text-xl shadow-xl">
                                            {p.avatar_emoji || '🤖'}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-black uppercase tracking-tight text-white truncate">{p.nombre}</p>
                                            <p className="text-[10px] text-indigo-400 uppercase font-black tracking-widest mt-0.5">{p.materia || 'General'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="text-[10px] text-zinc-600 ml-2 italic">El profesor seleccionado responderá las dudas de los alumnos basándose en el contenido de esta lección.</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Knowledge Base */}
                <div className="lg:col-span-5 space-y-10">
                    <div className="bg-white/[0.02] border border-white/5 rounded-[40px] p-10 backdrop-blur-sm space-y-8 shadow-2xl">
                        <div className="space-y-4">
                            <h3 className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 font-black flex items-center gap-2">
                                <Video className="w-3 h-3" />
                                Contenido de Video
                            </h3>
                            <input
                                value={videoUrl}
                                onChange={e => setVideoUrl(e.target.value)}
                                placeholder="URL del vídeo"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500/30 transition-all"
                            />
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 font-black flex items-center gap-2">
                                <Sparkles className="w-3 h-3" />
                                Base de Conocimientos (RAG)
                            </h3>
                            <textarea
                                value={esquema}
                                onChange={e => setEsquema(e.target.value)}
                                rows={8}
                                placeholder="Pega aquí el plan de estudios, transcripción o puntos clave..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-[11px] text-zinc-400 placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500/30 resize-none transition-all leading-6"
                            />
                            <p className="text-[9px] text-zinc-700 uppercase tracking-widest font-black text-center">Este contenido será la fuente de verdad para el Profesor IA.</p>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 font-black flex items-center gap-2">
                                <Brain className="w-3 h-3" />
                                Evaluación Final
                            </h3>
                            <textarea
                                value={preguntasRaw}
                                onChange={e => setPreguntasRaw(e.target.value)}
                                rows={4}
                                placeholder="Escribe las preguntas (una por línea)"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-xs text-white placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500/30 resize-none transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
