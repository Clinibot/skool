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
        <div className="min-h-screen bg-[#0a0a0b] text-white flex">
            <Sidebar profile={profile} />
            <main className="flex-1 ml-64 p-12">
                <div className="mb-8">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-amber-400 mb-2">Universidad Saby</p>
                    <h1 className="text-3xl font-light tracking-wider uppercase">☕ Cafetería</h1>
                    <p className="text-zinc-500 mt-1">El espacio de encuentro de la comunidad</p>
                </div>
                <CafeteriaChat userId={user.id} />
            </main>
        </div>
    );
}
