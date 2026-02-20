import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { AulaContent } from "@/components/AulaContent";

export default async function AulaPage({ params }: { params: { aulaId: string } }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (!profile?.global_role) redirect("/onboarding");

    const { data: aula } = await supabase
        .from('aulas')
        .select('*, profesores_ia(*)')
        .eq('id', params.aulaId)
        .single();

    if (!aula) notFound();

    const { data: mensajes } = await supabase
        .from('mensajes')
        .select('*, profiles(full_name, username), profesores_ia(nombre, avatar_emoji)')
        .eq('aula_id', params.aulaId)
        .eq('tipo', 'foro')
        .order('created_at', { ascending: true })
        .limit(100);

    const { data: miExamen } = await supabase
        .from('examenes')
        .select('*')
        .eq('aula_id', params.aulaId)
        .eq('alumno_id', user.id)
        .single();

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white flex">
            <Sidebar profile={profile} />
            <main className="flex-1 ml-64">
                <AulaContent
                    aula={aula}
                    profile={profile}
                    userId={user.id}
                    mensajesIniciales={mensajes || []}
                    miExamenInicial={miExamen || null}
                />
            </main>
        </div>
    );
}
