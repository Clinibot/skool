"use client";

import { useState } from "react";
import { Mail, MessageCircle, BarChart3, GraduationCap } from "lucide-react";
import { DirectMessageModal } from "@/components/DirectMessageModal";

export function StudentsList({ alumnos, notasPorAlumno }: { alumnos: any[], notasPorAlumno: Record<string, any[]> }) {
    const [selectedStudent, setSelectedStudent] = useState<any>(null);

    return (
        <div className="grid gap-6">
            {alumnos.map((m: any) => {
                const alumno = m.profiles;
                const notas = notasPorAlumno[alumno?.id] || [];
                const promedio = notas.length > 0
                    ? (notas.reduce((s: number, n: any) => s + n.nota, 0) / notas.length).toFixed(1)
                    : null;

                return (
                    <div key={m.id} className="relative group p-8 rounded-[32px] border border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04] transition-all duration-700 backdrop-blur-sm overflow-hidden flex flex-col xl:flex-row xl:items-center gap-8 shadow-2xl">
                        {/* Background glow for record */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/[0.02] blur-[80px] -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />

                        {/* Avatar and Info */}
                        <div className="flex items-center gap-6 flex-1 min-w-0 relative z-10">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-[22px] bg-gradient-to-tr from-indigo-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center text-xl font-black group-hover:scale-110 transition-transform duration-700 shadow-xl">
                                    {(alumno?.full_name || alumno?.username || '?').charAt(0).toUpperCase()}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-[#0a0a0b] rounded-full" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xl font-black text-white tracking-tight uppercase">{alumno?.full_name || alumno?.username}</p>
                                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                    <span className="text-zinc-500 text-[10px] uppercase tracking-widest font-black">@{alumno?.username}</span>
                                    <span className="w-1 h-1 rounded-full bg-zinc-800" />
                                    <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] uppercase tracking-widest font-black">
                                        <Mail className="w-3 h-3 text-indigo-500/40" />
                                        {alumno?.email || 'email@desconocido.com'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats Dashboard for Student */}
                        <div className="flex flex-wrap items-center gap-8 md:gap-12 relative z-10">
                            <div className="flex items-center gap-6 px-8 py-4 bg-white/[0.01] border border-white/5 rounded-3xl">
                                <div className="text-center">
                                    <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-600 font-black mb-1">Cursos</p>
                                    <p className="text-xl font-black text-white">{notas.length > 0 ? Array.from(new Set(notas.map(n => n.aula_id))).length : 0}</p>
                                </div>
                                <div className="w-px h-8 bg-white/5" />
                                <div className="text-center">
                                    <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-600 font-black mb-1">Notas</p>
                                    <p className="text-xl font-black text-white">{notas.length}</p>
                                </div>
                                <div className="w-px h-8 bg-white/5" />
                                <div className="text-center">
                                    <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-600 font-black mb-1">Promedio</p>
                                    <p className={`text-xl font-black ${promedio ? (parseFloat(promedio) >= 5 ? 'text-green-400' : 'text-red-400') : 'text-zinc-800'}`}>
                                        {promedio ?? '—'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex-1 min-w-[200px] space-y-3">
                                <p className="text-[9px] uppercase tracking-[0.4em] text-zinc-600 font-black flex items-center gap-2">
                                    <BarChart3 className="w-3 h-3" />
                                    Calificaciones Académicas
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {notas.length === 0 ? (
                                        <span className="text-[10px] text-zinc-700 uppercase tracking-widest italic font-bold">Sin registros</span>
                                    ) : (
                                        notas.map((n: any) => (
                                            <div key={n.id} className="px-3 py-2 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3 group/nota hover:border-indigo-500/30 transition-all cursor-default">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] text-zinc-500 font-black uppercase tracking-tight truncate max-w-[80px]">{n.aulas?.nombre}</span>
                                                    <div className="flex items-center gap-1 mt-0.5">
                                                        <span className={`text-[10px] font-black ${n.nota >= 5 ? 'text-green-400' : 'text-red-400'}`}>{n.nota}</span>
                                                        <span className="text-[8px] text-zinc-700">/ 10</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <button
                                onClick={() => setSelectedStudent(alumno)}
                                className="px-6 py-4 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-600 hover:text-white transition-all shadow-lg flex items-center gap-3"
                            >
                                <MessageCircle className="w-4 h-4" />
                                Redactar DM
                            </button>
                        </div>
                    </div>
                );
            })}

            {selectedStudent && (
                <DirectMessageModal
                    isOpen={!!selectedStudent}
                    onClose={() => setSelectedStudent(null)}
                    student={selectedStudent}
                />
            )}
        </div>
    );
}
