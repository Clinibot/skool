import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

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

    // Fetch communities where user is a member or owner
    const { data: memberships } = await supabase
        .from('memberships')
        .select('*, communities(*)')
        .eq('user_id', user.id);

    const communities = memberships?.map(m => m.communities) || [];

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white flex">
            <Sidebar profile={profile} />

            <main className="flex-1 ml-64 p-12">
                <header className="mb-12 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-light tracking-wider uppercase">Overview</h1>
                        <p className="text-zinc-500">Welcome back, {profile.full_name || profile.username}.</p>
                    </div>
                    <div className="flex gap-4">
                        <button className="px-6 py-2 bg-white text-black rounded-xl font-bold text-sm tracking-tight hover:bg-zinc-200 transition-all shadow-xl shadow-white/5">
                            New Community
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {communities.length > 0 ? (
                        communities.map((community: any) => (
                            <div
                                key={community.id}
                                className="h-64 rounded-[32px] border border-white/5 bg-white/[0.02] backdrop-blur-3xl p-8 group hover:border-indigo-500/30 transition-all cursor-pointer relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[40px] -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/20 transition-colors" />
                                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-6 font-bold uppercase text-[10px]">
                                    {community.slug.substring(0, 3)}
                                </div>
                                <h3 className="text-xl font-bold mb-2 uppercase tracking-tight">{community.name}</h3>
                                <p className="text-zinc-500 text-sm leading-relaxed line-clamp-2">
                                    {community.description || "The future of community interactions starts here."}
                                </p>

                                <div className="absolute bottom-8 left-8 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500">Active</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="h-64 rounded-[32px] border border-white/5 bg-white/[0.02] backdrop-blur-3xl p-8 group hover:border-indigo-500/30 transition-all">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-600 mb-6 font-bold uppercase text-[10px]">
                                Empty
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-zinc-400">No communities yet</h3>
                            <p className="text-zinc-500 text-sm leading-relaxed mb-6 font-light">Start building your tribe today and lead the conversation with premium tools.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
