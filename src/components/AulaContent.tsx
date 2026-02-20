"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Send, BookOpen, FileText, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

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
        await supabase.from('mensajes').insert({
            aula_id: aula.id, tipo: 'foro', autor_id: userId, contenido: input.trim(),
        });
        setInput("");
        setSending(false);
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
        <div className="flex flex-col h-screen">
            {/* Header */}
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div>
                    <Link href="/dashboard/clases" className="text-[10px] text-zinc-600 uppercase tracking-widest hover:text-zinc-400 transition-colors">← Volver al pasillo</Link>
                    <h1 className="text-2xl font-bold mt-2">{aula.nombre}</h1>
                    <p className="text-zinc-500 text-sm mt-1">{aula.descripcion}</p>
                </div>
                {aula.is_active && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-sm text-green-400 font-medium">Clase en vivo</span>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/5">
                {tabs.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id as any)}
                        className={`px-8 py-4 text-sm font-medium transition-colors ${tab === t.id ? 'text-white border-b-2 border-indigo-500' : 'text-zinc-500 hover:text-zinc-300'}`}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
                {tab === 'clase' && (
                    <div className="p-8 space-y-8">
                        {/* Video */}
                        {aula.video_url ? (
                            <div className="aspect-video rounded-2xl overflow-hidden bg-black border border-white/5">
                                <iframe src={aula.video_url} className="w-full h-full" allowFullScreen />
                            </div>
                        ) : (
                            <div className="aspect-video rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-5xl mb-4">🎬</div>
                                    <p className="text-zinc-500 text-sm">Sin vídeo todavía</p>
                                </div>
                            </div>
                        )}

                        {/* Esquema */}
                        {aula.esquema && (
                            <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
                                <button onClick={() => setEsquemaOpen(!esquemaOpen)}
                                    className="w-full flex items-center justify-between p-6 text-left hover:bg-white/[0.02] transition-colors">
                                    <div className="flex items-center gap-3">
                                        <BookOpen className="w-5 h-5 text-indigo-400" />
                                        <span className="font-medium">Esquema de la clase</span>
                                    </div>
                                    {esquemaOpen ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                                </button>
                                {esquemaOpen && (
                                    <div className="px-6 pb-6 prose prose-invert prose-sm max-w-none">
                                        <pre className="whitespace-pre-wrap text-zinc-300 text-sm leading-relaxed font-sans">{aula.esquema}</pre>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Creator controls */}
                        {profile.global_role === 'creator' && (
                            <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <FileText className="w-4 h-4 text-indigo-400" />
                                    <span className="text-sm font-medium text-indigo-300">Controles del Creador</span>
                                </div>
                                <Link href={`/dashboard/clases/${aula.id}/editar`}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-medium transition-colors">
                                    Editar aula
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {tab === 'foro' && (
                    <div className="flex flex-col h-full">
                        <div className="flex-1 overflow-y-auto p-8 space-y-4">
                            {mensajes.length === 0 && (
                                <div className="text-center py-16 text-zinc-600">
                                    <p className="text-sm">Sé el primero en preguntar algo 💬</p>
                                </div>
                            )}
                            {mensajes.map((m: any) => {
                                const isMine = m.autor_id === userId;
                                const isIA = !!m.profesor_ia_id;
                                const name = isIA
                                    ? `${m.profesores_ia?.avatar_emoji || '🤖'} ${m.profesores_ia?.nombre}`
                                    : (m.profiles?.full_name || m.profiles?.username || 'Anónimo');
                                return (
                                    <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] flex flex-col gap-1 ${isMine ? 'items-end' : 'items-start'}`}>
                                            {!isMine && <span className="text-[10px] text-zinc-600 uppercase tracking-wider px-1">{name}</span>}
                                            <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed ${isMine ? 'bg-indigo-600 text-white rounded-br-md' : isIA ? 'bg-violet-500/10 border border-violet-500/20 text-zinc-300 rounded-bl-md' : 'bg-white/5 border border-white/5 text-zinc-300 rounded-bl-md'}`}>
                                                {m.contenido}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={bottomRef} />
                        </div>
                        <form onSubmit={sendMensaje} className="p-6 border-t border-white/5 flex gap-3">
                            <input value={input} onChange={e => setInput(e.target.value)}
                                placeholder="Escribe tu pregunta..."
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-colors" />
                            <button type="submit" disabled={!input.trim() || sending}
                                className="w-12 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-colors flex items-center justify-center disabled:opacity-30">
                                <Send className="w-4 h-4 text-white" />
                            </button>
                        </form>
                    </div>
                )}

                {tab === 'examen' && (
                    <div className="p-8 max-w-2xl">
                        {miExamen ? (
                            <div className="text-center py-16">
                                <div className={`text-7xl font-bold mb-4 ${miExamen.nota >= 5 ? 'text-green-400' : 'text-red-400'}`}>{miExamen.nota}</div>
                                <p className="text-zinc-400 text-lg">Tu nota en este examen</p>
                                <p className="text-zinc-600 text-sm mt-2">{miExamen.nota >= 5 ? '¡Aprobado! Buen trabajo 🎉' : 'Sigue estudiando, tú puedes 💪'}</p>
                            </div>
                        ) : preguntas.length === 0 ? (
                            <div className="text-center py-16 text-zinc-600">
                                <p>No hay preguntas de examen todavía.</p>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <h2 className="text-xl font-bold">Examen — {aula.nombre}</h2>
                                {preguntas.map((pregunta: string, i: number) => (
                                    <div key={i} className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
                                        <p className="font-medium mb-4 text-sm text-zinc-300">{i + 1}. {pregunta}</p>
                                        <textarea
                                            value={respuestas[i] || ''}
                                            onChange={e => setRespuestas(prev => ({ ...prev, [i]: e.target.value }))}
                                            placeholder="Tu respuesta..."
                                            rows={3}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 resize-none"
                                        />
                                    </div>
                                ))}
                                <div className="flex items-center gap-4">
                                    <div>
                                        <label className="text-xs text-zinc-500 uppercase tracking-widest block mb-2">Tu autoevaluación (0–10)</label>
                                        <input type="number" min={0} max={10} value={nota || ''} onChange={e => setNota(parseInt(e.target.value))}
                                            className="w-24 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center text-white focus:outline-none focus:border-indigo-500/50" />
                                    </div>
                                    <button onClick={submitExamen}
                                        className="mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-bold transition-colors">
                                        Enviar examen
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
