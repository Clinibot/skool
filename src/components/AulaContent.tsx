"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Send, BookOpen, FileText, ChevronDown, ChevronUp, Bot, Sparkles } from "lucide-react";
import Link from "next/link";
import { sendForoMensaje } from "@/app/dashboard/clases/actions";

interface AulaContentProps {
    aula: any;
    profile: any;
    userId: string;
    mensajesIniciales: any[];
    miExamenInicial: any | null;
}

export function AulaContent({ aula, profile, userId, mensajesIniciales, miExamenInicial }: AulaContentProps) {
    const [tab, setTab] = useState<'clase' | 'foro' | 'examen'>('clase');
    const [mensajes, setMensajes] = useState(mensajesIniciales);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [miExamen, setMiExamen] = useState(miExamenInicial);
    const [respuestas, setRespuestas] = useState<Record<number, string>>({});
    const [nota, setNota] = useState<number | null>(null);
    const [esquemaOpen, setEsquemaOpen] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    const preguntas: string[] = aula.preguntas_examen || [];

    useEffect(() => {
        const channel = supabase.channel(`aula-${aula.id}`)
            .on('postgres_changes', {
                event: 'INSERT', schema: 'skool', table: 'mensajes',
                filter: `aula_id=eq.${aula.id}`
            }, (payload) => {
                setMensajes(prev => [...prev, payload.new as any]);
            })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [aula.id]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [mensajes]);

    const sendMensaje = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || sending) return;
        setSending(true);
        try {
            await sendForoMensaje(aula.id, input.trim());
            setInput("");
        } catch (err) {
            console.error(err);
            alert("Error al enviar mensaje");
        } finally {
            setSending(false);
        }
    };

    const submitExamen = async () => {
        const notaFinal = parseInt(String(nota));
        if (!notaFinal || notaFinal < 0 || notaFinal > 10) return;
        await supabase.from('examenes').upsert({
            aula_id: aula.id, alumno_id: userId, nota: notaFinal, respuestas,
        });
        setMiExamen({ nota: notaFinal, respuestas });
    };

    const tabs = [
        { id: 'clase', label: '🎥 Clase' },
        { id: 'foro', label: `💬 Foro (${mensajes.length})` },
        ...(profile.global_role === 'participant' ? [{ id: 'examen', label: '📝 Examen' }] : []),
    ] as const;

    return (
        <div className="flex h-screen bg-[#0a0a0b] overflow-hidden">
            {/* Curriculum/Esquema Sidebar (Skool Style) */}
            <div className="w-80 border-r border-white/5 bg-white/[0.01] flex flex-col backdrop-blur-3xl">
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-black">Plan de Estudios</span>
                    <BookOpen className="w-4 h-4 text-indigo-500/50" />
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-8">
                    {/* Assigned AI Professor Section */}
                    {aula.profesores_ia && (Array.isArray(aula.profesores_ia) ? aula.profesores_ia[0] : aula.profesores_ia) && (
                        <div className="px-4 space-y-4">
                            <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-600 font-bold">Mentor Asignado</span>
                            <div className="p-5 rounded-[28px] bg-indigo-500/[0.03] border border-indigo-500/10 backdrop-blur-sm group hover:border-indigo-500/30 transition-all duration-500">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all">
                                        {(Array.isArray(aula.profesores_ia) ? aula.profesores_ia[0] : aula.profesores_ia).avatar_emoji || '🤖'}
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black text-white uppercase tracking-tight">{(Array.isArray(aula.profesores_ia) ? aula.profesores_ia[0] : aula.profesores_ia).nombre}</p>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
                                            <p className="text-[9px] text-indigo-400 uppercase font-black tracking-widest leading-none">AI Mentor</p>
                                        </div>
                                    </div>
                                </div>
                                <p className="mt-4 text-[10px] text-zinc-500 font-light leading-relaxed italic">"Resolveré tus dudas en el foro utilizando el contenido de esta lección."</p>
                            </div>
                        </div>
                    )}

                    {/* Lesson Item */}
                    <div className="group relative px-6 py-4 rounded-3xl bg-white/[0.05] border border-white/10 shadow-lg shadow-indigo-500/5 cursor-default mx-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                            <span className="text-xs font-black text-white uppercase tracking-tight">{aula.nombre}</span>
                        </div>
                        <p className="text-[10px] text-zinc-500 font-light line-clamp-2 leading-relaxed">Lección principal y fundamentos</p>
                    </div>

                    {aula.esquema && (
                        <div className="mt-8 px-4 space-y-6">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="h-[1px] w-4 bg-white/10" />
                                <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-600 font-bold">Resumen del Módulo</span>
                            </div>
                            <div className="prose prose-invert prose-xs max-w-none">
                                <pre className="whitespace-pre-wrap text-zinc-400 text-[11px] leading-6 font-sans border-l border-white/10 pl-4">
                                    {aula.esquema}
                                </pre>
                            </div>
                        </div>
                    )}
                </div>

                {profile.global_role === 'creator' && (
                    <div className="p-6 border-t border-white/5 bg-indigo-500/[0.02]">
                        <Link href={`/dashboard/clases/${aula.id}/editar`}
                            className="flex items-center justify-center gap-2 w-full py-3 bg-white text-black rounded-[20px] text-xs font-black uppercase tracking-widest hover:scale-[1.02] transition-all">
                            <FileText className="w-3.5 h-3.5" />
                            Editar Clase
                        </Link>
                    </div>
                )}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Decorative background gradients */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/[0.03] blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />

                {/* Local Header */}
                <header className="p-8 pb-4 border-b border-white/5 flex items-center justify-between relative z-10 backdrop-blur-md bg-black/20">
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <Link href="/dashboard/clases" className="p-1.5 rounded-xl bg-white/5 border border-white/10 text-zinc-500 hover:text-white transition-colors">
                                <ChevronDown className="w-4 h-4 rotate-90" />
                            </Link>
                            <h1 className="text-xl font-black tracking-tight text-white uppercase">{aula.nombre}</h1>
                        </div>
                        <p className="text-sm text-zinc-500 font-light ml-12">{aula.descripcion}</p>
                    </div>
                    {aula.is_active && (
                        <div className="flex items-center gap-2 px-5 py-2.5 bg-green-500/5 border border-green-500/20 rounded-[20px] shadow-lg shadow-green-900/5">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
                            <span className="text-[10px] text-green-400 font-black uppercase tracking-widest">En Vivo ahora</span>
                        </div>
                    )}
                </header>

                <div className="flex-1 overflow-y-auto relative z-10">
                    <div className="max-w-5xl mx-auto p-8 space-y-12">
                        {/* Video Area */}
                        <section className="space-y-6">
                            {aula.video_url ? (
                                <div className="aspect-video rounded-[40px] overflow-hidden bg-black border border-white/10 shadow-2xl relative group">
                                    <iframe src={aula.video_url} className="w-full h-full" allowFullScreen />
                                    <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-[40px] pointer-events-none" />
                                </div>
                            ) : (
                                <div className="aspect-video rounded-[40px] bg-white/[0.01] border border-white/5 flex items-center justify-center backdrop-blur-sm">
                                    <div className="text-center group">
                                        <div className="text-6xl mb-6 grayscale group-hover:grayscale-0 transition-all duration-700">🎬</div>
                                        <p className="text-zinc-500 text-xs font-light tracking-widest uppercase">Esperando contenido de video...</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-6">
                                    <button onClick={() => setTab('clase')}
                                        className={`text-xs font-black uppercase tracking-[0.2em] transition-all pb-2 border-b-2 ${tab === 'clase' ? 'text-white border-indigo-500' : 'text-zinc-600 border-transparent hover:text-zinc-400'}`}>
                                        Descripción
                                    </button>
                                    <button onClick={() => setTab('foro')}
                                        className={`text-xs font-black uppercase tracking-[0.2em] transition-all pb-2 border-b-2 ${tab === 'foro' ? 'text-white border-indigo-500' : 'text-zinc-600 border-transparent hover:text-zinc-400'}`}>
                                        Discusión ({mensajes.length})
                                    </button>
                                    {profile.global_role === 'participant' && (
                                        <button onClick={() => setTab('examen')}
                                            className={`text-xs font-black uppercase tracking-[0.2em] transition-all pb-2 border-b-2 ${tab === 'examen' ? 'text-white border-indigo-500' : 'text-zinc-600 border-transparent hover:text-zinc-400'}`}>
                                            Evaluación
                                        </button>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Integrated Content below video */}
                        <div className="min-h-[500px]">
                            {tab === 'clase' && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="p-10 rounded-[40px] bg-white/[0.01] border border-white/5 backdrop-blur-sm">
                                        <h3 className="text-lg font-bold mb-6 text-white uppercase tracking-tight flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                            Sobre esta lección
                                        </h3>
                                        <p className="text-zinc-400 leading-relaxed font-light">
                                            {aula.descripcion || "En esta lección cubriremos los aspectos fundamentales para dominar la materia. Asegúrate de tomar notas y participar en el foro de discusión si tienes alguna duda."}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {tab === 'foro' && (
                                <div className="flex flex-col h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-700 rounded-[40px] border border-white/5 bg-white/[0.01] overflow-hidden backdrop-blur-sm">
                                    <div className="flex-1 overflow-y-auto p-10 space-y-6 scrollbar-hide">
                                        {mensajes.length === 0 && (
                                            <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                                                <Send className="w-8 h-8 mb-4 text-zinc-600" />
                                                <p className="text-xs uppercase tracking-widest">Inicia la conversación...</p>
                                            </div>
                                        )}
                                        {mensajes.map((m: any) => {
                                            const isMine = m.autor_id === userId;
                                            const isIA = !!m.profesor_ia_id;
                                            const name = isIA
                                                ? `${m.profesores_ia?.avatar_emoji || '🤖'} ${m.profesores_ia?.nombre}`
                                                : (m.profiles?.full_name || m.profiles?.username || 'Anónimo');
                                            return (
                                                <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} group animate-in slide-in-from-bottom-2 duration-300`}>
                                                    <div className={`max-w-[80%] flex flex-col gap-1.5 ${isMine ? 'items-end' : 'items-start'}`}>
                                                        {!isMine && <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold px-2">{name} {isIA && <span className="text-indigo-400 ml-1 italic">(Profesor)</span>}</span>}
                                                        <div className={`px-6 py-4 rounded-[26px] text-sm leading-relaxed transition-all ${isMine ? 'bg-indigo-600 text-white rounded-br-md shadow-lg shadow-indigo-900/20' : isIA ? 'bg-violet-500/10 border border-violet-500/20 text-zinc-200 rounded-bl-md' : 'bg-white/5 border border-white/5 text-zinc-300 rounded-bl-md hover:bg-white/[0.05]'}`}>
                                                            {m.contenido}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={bottomRef} />
                                    </div>
                                    <form onSubmit={sendMensaje} className="p-8 bg-black/40 border-t border-white/5 flex gap-4">
                                        <input value={input} onChange={e => setInput(e.target.value)}
                                            placeholder="Comparte tus dudas con la clase..."
                                            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-all" />
                                        <button type="submit" disabled={!input.trim() || sending}
                                            className="w-14 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-500 transition-all flex items-center justify-center disabled:opacity-30 shadow-lg shadow-indigo-900/20">
                                            <Send className="w-5 h-5 text-white" />
                                        </button>
                                    </form>
                                </div>
                            )}

                            {tab === 'examen' && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 p-10 rounded-[40px] bg-white/[0.01] border border-white/5 backdrop-blur-sm">
                                    {miExamen ? (
                                        <div className="text-center py-20 relative overflow-hidden rounded-[30px] border border-white/5 bg-white/[0.02]">
                                            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent" />
                                            <div className="relative z-10">
                                                <div className={`text-8xl font-black mb-6 ${miExamen.nota >= 5 ? 'text-green-400' : 'text-red-400'} tracking-tighter`}>{miExamen.nota}</div>
                                                <p className="text-zinc-500 text-[10px] uppercase tracking-[0.4em] font-black">Calificación Final</p>
                                                <div className="mt-8 flex justify-center">
                                                    <div className={`px-6 py-2 rounded-full border text-xs font-bold uppercase tracking-widest ${miExamen.nota >= 5 ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                                                        {miExamen.nota >= 5 ? '✓ Aprobado' : '✕ Necesita mejorar'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : preguntas.length === 0 ? (
                                        <div className="text-center py-20 opacity-30">
                                            <p className="text-xs uppercase tracking-widest font-black">Sin pruebas asignadas para esta lección</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-10">
                                            <div className="flex items-center gap-4 mb-2">
                                                <div className="w-10 h-10 rounded-[18px] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h2 className="text-xl font-black uppercase tracking-tight">Evaluación Académica</h2>
                                                    <p className="text-zinc-500 text-xs font-light">Completa las siguientes preguntas para validar tu aprendizaje</p>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                {preguntas.map((pregunta: string, i: number) => (
                                                    <div key={i} className="p-8 rounded-[32px] border border-white/5 bg-white/[0.01] group hover:bg-white/[0.03] transition-all">
                                                        <p className="font-bold mb-5 text-sm text-zinc-300 uppercase tracking-tight flex gap-3">
                                                            <span className="text-indigo-500 font-black">{String(i + 1).padStart(2, '0')}.</span>
                                                            {pregunta}
                                                        </p>
                                                        <textarea
                                                            value={respuestas[i] || ''}
                                                            onChange={e => setRespuestas(prev => ({ ...prev, [i]: e.target.value }))}
                                                            placeholder="Redacta tu respuesta aquí..."
                                                            rows={3}
                                                            className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-5 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500/30 resize-none transition-all"
                                                        />
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="p-10 rounded-[32px] bg-indigo-600/[0.03] border border-indigo-500/20 flex flex-col md:flex-row items-center justify-between gap-8">
                                                <div className="flex-1 text-center md:text-left">
                                                    <label className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-black block mb-3">Autoevaluación de Compromiso</label>
                                                    <p className="text-xs text-zinc-600 mb-6 font-light">¿Qué nota crees que mereces por tu esfuerzo hoy?</p>
                                                    <div className="flex items-center justify-center md:justify-start gap-4">
                                                        {[...Array(11)].map((_, i) => (
                                                            <button key={i} onClick={() => setNota(i)}
                                                                className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${nota === i ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30' : 'bg-white/5 text-zinc-600 hover:text-zinc-400 hover:bg-white/10'}`}>
                                                                {i}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <button onClick={submitExamen}
                                                    disabled={nota === null}
                                                    className="px-10 py-5 bg-white text-black rounded-[24px] text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-20">
                                                    Entregar Acta
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
