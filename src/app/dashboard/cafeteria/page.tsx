import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { CafeteriaChat } from "@/components/CafeteriaChat";
import { CommunityFeed } from "@/components/CommunityFeed";
import { Coffee, MessageSquare, Layout } from "lucide-react";

export default async function CafeteriaPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (!profile?.global_role) redirect("/onboarding");

    // Fetch the first community the user belongs to
    const { data: memberships } = await supabase
        .from('memberships')
        .select('community_id, communities(*)')
        .eq('user_id', user.id);

    const community = memberships?.[0]?.communities as any;
    const resolvedSearchParams = await searchParams;
    const currentTab = resolvedSearchParams.tab || 'feed';

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white flex overflow-hidden">
            <Sidebar profile={profile} />
            <main className="flex-1 ml-64 p-12 relative flex flex-col h-screen overflow-y-auto scrollbar-hide">
                {/* Warm decorative gradients */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-600/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-600/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10 mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                            <Coffee className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.4em] text-amber-500 font-black">Campus Social</p>
                            <h1 className="text-3xl font-black tracking-tight uppercase mt-1">
                                La <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-orange-400">Cafetería</span>
                            </h1>
                        </div>
                    </div>

                    {/* Skool-style Tabs */}
                    <div className="flex items-center gap-8 mt-8 border-b border-white/5">
                        <a href="?tab=feed"
                            className={`flex items-center gap-2 pb-4 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${currentTab === 'feed' ? 'text-white border-amber-500' : 'text-zinc-600 border-transparent hover:text-zinc-400'}`}>
                            <Layout className="w-3.5 h-3.5" />
                            Muro de la Uni
                        </a>
                        <a href="?tab=chat"
                            className={`flex items-center gap-2 pb-4 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${currentTab === 'chat' ? 'text-white border-amber-500' : 'text-zinc-600 border-transparent hover:text-zinc-400'}`}>
                            <MessageSquare className="w-3.5 h-3.5" />
                            Chat en Vivo (Café)
                        </a>
                    </div>
                </div>

                <div className="relative z-10 flex-1 flex flex-col min-h-0 pb-12">
                    {currentTab === 'feed' ? (
                        community ? (
                            <CommunityFeed communityId={community.id} profile={profile} />
                        ) : (
                            <div className="py-20 text-center bg-white/[0.01] border border-white/5 border-dashed rounded-[40px]">
                                <Layout className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                                <p className="text-zinc-600 text-xs font-light tracking-widest uppercase">No se encontró una comunidad activa para este perfil</p>
                            </div>
                        )
                    ) : (
                        <div className="flex-1 min-h-0">
                            <div className="max-w-4xl mx-auto h-full flex flex-col">
                                <CafeteriaChat userId={user.id} />
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
