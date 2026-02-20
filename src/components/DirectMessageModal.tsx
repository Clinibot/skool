"use client";

import { useState } from "react";
import { Send, X, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { sendDirectMessage } from "@/app/dashboard/actions";

export function DirectMessageModal({ isOpen, onClose, student }: { isOpen: boolean, onClose: () => void, student: any }) {
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSend = async () => {
        if (!message.trim()) return;
        setSending(true);
        try {
            await sendDirectMessage(student.id, message);
            setSent(true);
            setTimeout(() => {
                setSent(false);
                setMessage("");
                onClose();
            }, 2000);
        } catch (err) {
            console.error(err);
            alert("Error al enviar el mensaje");
        }
        setSending(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-[#0f0f12] border border-white/10 rounded-[40px] p-8 max-w-lg w-full shadow-2xl relative overflow-hidden"
                    >
                        {/* Background glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 blur-[40px] -translate-y-1/2 translate-x-1/2" />

                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-violet-500/20 flex items-center justify-center text-lg font-black border border-white/5">
                                    {(student.full_name || student.username || "?").charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black tracking-tight uppercase">Mensaje Directo</h3>
                                    <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">Para: {student.full_name || student.username}</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                                <X className="w-5 h-5 text-zinc-500" />
                            </button>
                        </div>

                        {sent ? (
                            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                                <CheckCircle2 className="w-16 h-16 text-green-400 opacity-20" />
                                <p className="text-xl font-bold text-green-400">Mensaje enviado</p>
                                <p className="text-zinc-500 text-sm">El alumno recibirá tu comunicación en breve.</p>
                            </div>
                        ) : (
                            <div className="space-y-6 relative z-10">
                                <textarea
                                    autoFocus
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    placeholder="Escribe tu mensaje aquí..."
                                    className="w-full h-48 bg-white/5 border border-white/10 rounded-3xl px-6 py-5 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500/30 resize-none transition-all"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={sending || !message.trim()}
                                    className="w-full py-5 bg-white text-black rounded-[24px] font-black uppercase tracking-[0.2em] text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-30"
                                >
                                    {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                    Enviar Comunicación
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
