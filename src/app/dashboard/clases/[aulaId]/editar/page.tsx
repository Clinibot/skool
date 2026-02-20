import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { EditAulaForm } from "@/components/EditAulaForm";

export default async function EditarAulaPage({ params }: { params: Promise<{ aulaId: string }> }) {
    const { aulaId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    // Fetch profile
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (!profile?.global_role) redirect("/onboarding");
    if (profile.global_role !== 'creator') redirect("/dashboard");

    // Fetch aula details
    const { data: aula } = await supabase.from('aulas').select('*').eq('id', aulaId).single();
    if (!aula) redirect("/dashboard/clases");

    // Fetch assigned professor (if any)
    const { data: assignedProf } = await supabase
        .from('profesor_aula')
        .select('profesor_id')
        .eq('aula_id', aulaId)
        .single();

    // Fetch all available professors for the community
    const { data: communityMemberships } = await supabase
        .from('memberships').select('community_id').eq('user_id', user.id);
    const communityIds = communityMemberships?.map(m => m.community_id) || [];

    let profesores: any[] = [];
    if (communityIds.length > 0) {
        const { data } = await supabase.from('profesores_ia').select('*').in('community_id', communityIds);
        profesores = data || [];
    }

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white flex">
            <Sidebar profile={profile} />
            <main className="flex-1 ml-64 p-12 relative h-screen overflow-y-auto scrollbar-hide">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/5 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10 max-w-5xl mx-auto">
                    <EditAulaForm
                        aula={aula}
                        profesores={profesores}
                        assignedProfesorId={assignedProf?.profesor_id || null}
                    />
                </div>
            </main>
        </div>
    );
}
