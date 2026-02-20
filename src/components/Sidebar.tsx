"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, Users, Settings, LogOut, Bot, Coffee, Lock, Zap, LayoutDashboard } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export function Sidebar({ profile }: { profile: any }) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    };

    const isCreator = profile?.global_role === 'creator';

    const navItems = isCreator ? [
        { icon: <LayoutDashboard className="w-5 h-5" />, label: "El Pasillo", href: "/dashboard" },
        { icon: <GraduationCap className="w-5 h-5" />, label: "Mis Clases", href: "/dashboard/clases" },
        { icon: <Bot className="w-5 h-5" />, label: "Profesores IA", href: "/dashboard/profesores-ia" },
        { icon: <Users className="w-5 h-5" />, label: "Expediente Alumnos", href: "/dashboard/alumnos" },
        { icon: <Lock className="w-5 h-5" />, label: "Clases Privadas", href: "/dashboard/clases-privadas" },
        { icon: <Coffee className="w-5 h-5" />, label: "Comunidad", href: "/dashboard/cafeteria" },
        { icon: <Settings className="w-5 h-5" />, label: "Ajustes", href: "/dashboard/ajustes" },
    ] : [
        { icon: <LayoutDashboard className="w-5 h-5" />, label: "Mis Tribus", href: "/dashboard" },
        { icon: <GraduationCap className="w-5 h-5" />, label: "Mis Clases", href: "/dashboard/clases" },
        { icon: <Coffee className="w-5 h-5" />, label: "Comunidad", href: "/dashboard/cafeteria" },
        { icon: <Settings className="w-5 h-5" />, label: "Ajustes", href: "/dashboard/ajustes" },
    ];

    return (
        <aside className="w-64 border-r border-white/5 bg-[#0a0a0b]/60 backdrop-blur-2xl flex flex-col p-8 fixed h-full z-50">
            <div className="flex items-center gap-3 mb-12 group cursor-pointer">
                <div className="relative">
                    <Zap className="w-6 h-6 text-indigo-500 fill-indigo-500 relative z-10" />
                    <div className="absolute inset-0 bg-indigo-500/20 blur-lg rounded-full group-hover:bg-indigo-500/40 transition-colors" />
                </div>
                <span className="font-black tracking-[0.3em] uppercase text-[10px] text-white">Saby <span className="text-zinc-500 font-light">Uni</span></span>
            </div>

            <nav className="flex-1 space-y-2">
                {navItems.map((item) => {
                    const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-5 py-3.5 rounded-[22px] text-xs font-bold transition-all duration-300 ${active
                                ? "bg-white/10 text-white border border-white/10 shadow-xl shadow-indigo-500/5 translate-x-1"
                                : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03] hover:translate-x-1"
                                }`}
                        >
                            <span className={`${active ? 'text-indigo-400' : 'text-zinc-600'} transition-colors group-hover:text-indigo-400`}>
                                {item.icon}
                            </span>
                            <span className="tracking-tight uppercase tracking-widest">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="pt-8 border-t border-white/5 space-y-6">
                <div className="flex items-center gap-3 px-2">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 border border-white/10 flex items-center justify-center text-sm font-black text-white shadow-lg">
                            {(profile?.full_name || profile?.username || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-[#0a0a0b] rounded-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate text-white">{profile?.full_name || profile?.username}</p>
                        <p className="text-[9px] text-indigo-400/70 uppercase tracking-widest font-black mt-0.5">{profile?.global_role === 'creator' ? 'Rector' : 'Alumno'}</p>
                    </div>
                </div>
                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 w-full px-5 py-2 text-zinc-600 hover:text-red-400 transition-all text-[10px] uppercase tracking-widest font-bold group"
                >
                    <LogOut className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                    <span>Salir</span>
                </button>
            </div>
        </aside>
    );
}
