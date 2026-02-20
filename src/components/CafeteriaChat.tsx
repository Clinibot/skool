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
        <div className="flex flex-col h-[calc(100vh-220px)] rounded-[28px] border border-white/5 bg-white/[0.02] overflow-hidden">
            <div className="flex-1 overflow-y-auto p-8 space-y-4">
                {mensajes.length === 0 && (
                    <div className="text-center py-16 text-zinc-600">
                        <Coffee className="w-8 h-8 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Sé el primero en escribir algo ☕</p>
                    </div>
                )}
                {mensajes.map((m) => {
                    const isMine = m.autor_id === userId;
                    const isIA = !!m.profesor_ia_id;
                    const name = isIA
                        ? `${m.profesores_ia?.avatar_emoji || '🤖'} ${m.profesores_ia?.nombre}`
                        : (m.profiles?.full_name || m.profiles?.username || 'Anónimo');

                    return (
                        <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] ${isMine ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                                {!isMine && <span className="text-[10px] text-zinc-600 uppercase tracking-wider px-1">{name}</span>}
                                <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed ${isMine
                                    ? 'bg-indigo-600 text-white rounded-br-md'
                                    : isIA
                                        ? 'bg-violet-500/10 border border-violet-500/20 text-zinc-300 rounded-bl-md'
                                        : 'bg-white/5 border border-white/5 text-zinc-300 rounded-bl-md'
                                    }`}>
                                    {m.contenido}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            <form onSubmit={sendMensaje} className="p-6 border-t border-white/5 flex gap-3">
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Escribe algo en la cafetería..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
                <button
                    type="submit"
                    disabled={!input.trim() || loading}
                    className="w-12 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-colors flex items-center justify-center disabled:opacity-30"
                >
                    <Send className="w-4 h-4 text-white" />
                </button>
            </form>
        </div>
    );
}
