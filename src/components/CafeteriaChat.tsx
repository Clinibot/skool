"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Send, Coffee } from "lucide-react";

interface Mensaje {
    id: string;
    contenido: string;
    created_at: string;
    autor_id: string | null;
    profesor_ia_id: string | null;
    profiles?: { full_name: string | null; username: string };
    profesores_ia?: { nombre: string; avatar_emoji: string };
}

export function CafeteriaChat({ userId }: { userId: string }) {
    const [mensajes, setMensajes] = useState<Mensaje[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    useEffect(() => {
        const fetchMensajes = async () => {
            const { data } = await supabase
                .from('mensajes')
                .select('*, profiles(full_name, username), profesores_ia(nombre, avatar_emoji)')
                .eq('tipo', 'cafeteria')
                .order('created_at', { ascending: true })
                .limit(100);
            setMensajes((data as any) || []);
        };
        fetchMensajes();

        const channel = supabase.channel('cafeteria')
            .on('postgres_changes', { event: 'INSERT', schema: 'skool', table: 'mensajes', filter: 'tipo=eq.cafeteria' }, (payload) => {
                setMensajes(prev => [...prev, payload.new as any]);
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [mensajes]);

    const sendMensaje = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;
        setLoading(true);
        await supabase.from('mensajes').insert({
            tipo: 'cafeteria',
            autor_id: userId,
            contenido: input.trim(),
            aula_id: null,
        });
        setInput("");
        setLoading(false);
    };

    return (
        <div className="flex flex-col h-full rounded-[40px] border border-white/5 bg-white/[0.01] overflow-hidden backdrop-blur-md shadow-2xl">
            <div className="flex-1 overflow-y-auto p-10 space-y-6 scrollbar-hide">
                {mensajes.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <div className="relative mb-6">
                            <Coffee className="w-12 h-12 text-amber-500/30 animate-bounce" />
                            <div className="absolute inset-0 bg-amber-500/10 blur-2xl rounded-full" />
                        </div>
                        <p className="text-zinc-500 font-light tracking-wide">El salón está tranquilo...<br />Sé el primero en pedir un café virtual ☕</p>
                    </div>
                )}
                {mensajes.map((m) => {
                    const isMine = m.autor_id === userId;
                    const isIA = !!m.profesor_ia_id;
                    const name = isIA
                        ? `${m.profesores_ia?.avatar_emoji || '🤖'} ${m.profesores_ia?.nombre}`
                        : (m.profiles?.full_name || m.profiles?.username || 'Anónimo');

                    return (
                        <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} group`}>
                            <div className={`max-w-[80%] ${isMine ? 'items-end' : 'items-start'} flex flex-col gap-1.5`}>
                                {!isMine && (
                                    <span className="text-[9px] text-zinc-600 uppercase tracking-[0.2em] px-2 font-bold mb-0.5">
                                        {name} {isIA && <span className="text-amber-500/50 ml-1">IA</span>}
                                    </span>
                                )}
                                <div className={`px-6 py-4 rounded-[24px] text-sm leading-relaxed transition-all duration-500 ${isMine
                                    ? 'bg-gradient-to-br from-indigo-600 to-indigo-500 text-white rounded-br-md shadow-lg shadow-indigo-900/10'
                                    : isIA
                                        ? 'bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 text-amber-100 rounded-bl-md shadow-lg shadow-amber-900/5'
                                        : 'bg-white/5 border border-white/5 text-zinc-300 rounded-bl-md hover:bg-white/[0.08] transition-colors'
                                    }`}>
                                    {m.contenido}
                                </div>
                                <span className="text-[8px] text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity px-2">
                                    {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            <div className="p-8 bg-gradient-to-t from-black/40 to-transparent">
                <form onSubmit={sendMensaje} className="relative flex items-center gap-3 bg-white/[0.03] border border-white/10 rounded-[24px] p-2 pr-4 focus-within:border-amber-500/30 transition-all duration-500">
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Escribe algo en la cafetería..."
                        className="flex-1 bg-transparent border-none rounded-2xl px-5 py-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-0"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || loading}
                        className={`w-12 h-12 rounded-2xl transition-all duration-500 flex items-center justify-center disabled:opacity-20 ${input.trim() ? 'bg-amber-500 text-black scale-100' : 'bg-white/5 text-zinc-500 scale-95'
                            }`}
                    >
                        {loading ? <div className="w-4 h-4 border-2 border-black/20 border-t-black animate-spin rounded-full" /> : <Send className="w-4 h-4" />}
                    </button>
                </form>
            </div>
        </div>
    );
}
