import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Zap, Layout, GraduationCap, Users, Settings, LogOut } from "lucide-react";

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (!profile?.global_role) {
        redirect("/onboarding");
    }

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/5 bg-[#0a0a0b]/80 backdrop-blur-xl flex flex-col p-6 fixed h-full">
                <div className="flex items-center gap-2 mb-12">
                    <Zap className="w-6 h-6 text-indigo-500 fill-indigo-500" />
                    <span className="font-bold tracking-tight uppercase text-xs tracking-[0.2em]">Clinibot Skool</span>
                </div>

                <nav className="flex-1 space-y-2">
                    <NavItem icon={<Layout className="w-5 h-5" />} label="Communities" active />
                    <NavItem icon={<GraduationCap className="w-5 h-5" />} label="Classroom" />
                    <NavItem icon={<Users className="w-5 h-5" />} label="Members" />
                    <NavItem icon={<Settings className="w-5 h-5" />} label="Settings" />
                </nav>

                <div className="pt-6 border-t border-white/5">
                    <div className="flex items-center gap-3 px-3 py-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{profile.full_name || profile.username}</p>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{profile.global_role}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-12">
                <header className="mb-12 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-light tracking-wider uppercase">Overview</h1>
                        <p className="text-zinc-500">Welcome back to your premium space.</p>
                    </div>
                    <div className="flex gap-4">
                        <button className="px-6 py-2 bg-white text-black rounded-xl font-bold text-sm tracking-tight hover:bg-zinc-200 transition-all">
                            New Community
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="h-64 rounded-[32px] border border-white/5 bg-white/[0.02] backdrop-blur-3xl p-8 group hover:border-indigo-500/30 transition-all">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-6 font-bold uppercase text-[10px]">
                            Act
                        </div>
                        <h3 className="text-xl font-bold mb-2">No communities yet</h3>
                        <p className="text-zinc-500 text-sm leading-relaxed mb-6">Start building your tribe today and lead the conversation with premium tools.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}

function NavItem({ icon, label, active = false }: any) {
    return (
        <a href="#" className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${active ? 'bg-white/5 text-white border border-white/10' : 'text-zinc-500 hover:text-white'}`}>
            {icon}
            <span className="tracking-tight">{label}</span>
        </a>
    );
}
