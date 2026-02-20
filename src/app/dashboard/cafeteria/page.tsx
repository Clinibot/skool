import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { CafeteriaChat } from "@/components/CafeteriaChat";

export default async function CafeteriaPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (!profile?.global_role) redirect("/onboarding");

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white flex overflow-hidden">
            <Sidebar profile={profile} />
            <main className="flex-1 ml-64 p-12 relative flex flex-col h-screen">
                {/* Warm decorative gradients */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-600/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-600/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10 mb-8">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="h-[1px] w-8 bg-amber-500/50" />
                        <p className="text-[10px] uppercase tracking-[0.4em] text-amber-500 font-bold">Campus Social</p>
                    </div>
                    <h1 className="text-4xl font-extralight tracking-tight uppercase">
                        La <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-orange-400">Cafetería</span>
                    </h1>
                    <p className="text-zinc-500 mt-2 text-sm font-light">Charla, debate y conecta con otros alumnos en un ambiente relajado</p>
                </div>

                <div className="relative z-10 flex-1 min-h-0">
                    <CafeteriaChat userId={user.id} />
                </div>
            </main>
        </div>
    );
}
