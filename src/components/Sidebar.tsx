"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, Layout, GraduationCap, Users, Settings, LogOut } from "lucide-react";
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

    const navItems = [
        { icon: <Layout className="w-5 h-5" />, label: "Communities", href: "/dashboard" },
        { icon: <GraduationCap className="w-5 h-5" />, label: "Classroom", href: "/dashboard/classroom" },
        { icon: <Users className="w-5 h-5" />, label: "Members", href: "/dashboard/members" },
        { icon: <Settings className="w-5 h-5" />, label: "Settings", href: "/dashboard/settings" },
    ];

    return (
        <aside className="w-64 border-r border-white/5 bg-[#0a0a0b]/80 backdrop-blur-xl flex flex-col p-6 fixed h-full z-50">
            <div className="flex items-center gap-2 mb-12">
                <Zap className="w-6 h-6 text-indigo-500 fill-indigo-500" />
                <span className="font-bold tracking-tight uppercase text-xs tracking-[0.2em] text-white">Saby</span>
            </div>

            <nav className="flex-1 space-y-2">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${pathname === item.href
                            ? "bg-white/5 text-white border border-white/10 shadow-lg shadow-white/5"
                            : "text-zinc-500 hover:text-zinc-300"
                            }`}
                    >
                        {item.icon}
                        <span className="tracking-tight">{item.label}</span>
                    </Link>
                ))}
            </nav>

            <div className="pt-6 border-t border-white/5 space-y-4">
                <div className="flex items-center gap-3 px-3 py-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 border border-white/10" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-white">{profile?.full_name || profile?.username}</p>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{profile?.global_role}</p>
                    </div>
                </div>
                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 w-full px-4 py-2 text-zinc-500 hover:text-red-400 transition-colors text-sm"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}
