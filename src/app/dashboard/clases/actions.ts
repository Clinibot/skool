import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.openai;

export async function updateAulaProfessor(aulaId: string, profesorId: string | null) {
    const supabase = await createClient();

    // Clear existing assignments for this aula
    const { error: deleteError } = await supabase
        .from('profesor_aula')
        .delete()
        .eq('aula_id', aulaId);

    if (deleteError) throw deleteError;

    if (profesorId) {
        const { error: insertError } = await supabase
            .from('profesor_aula')
            .insert({ aula_id: aulaId, profesor_id: profesorId });
        if (insertError) throw insertError;
    }

    revalidatePath(`/dashboard/clases/${aulaId}`);
    return { success: true };
}

export async function updateAula(aulaId: string, data: any) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('aulas')
        .update(data)
        .eq('id', aulaId);

    if (error) throw error;

    revalidatePath(`/dashboard/clases/${aulaId}`);
    revalidatePath(`/dashboard`);
    return { success: true };
}

export async function sendForoMensaje(aulaId: string, content: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // 1. Insert user message
    const { data: userMsg, error: userError } = await supabase.from('mensajes').insert({
        aula_id: aulaId,
        tipo: 'foro',
        autor_id: user.id,
        contenido: content.trim()
    }).select().single();

    if (userError) throw userError;

    // 2. Check for assigned AI Professor
    const { data: profAssignment } = await supabase
        .from('profesor_aula')
        .select('*, profesores_ia(*)')
        .eq('aula_id', aulaId)
        .single();

    if (profAssignment?.profesores_ia) {
        const prof = profAssignment.profesores_ia;
        const { data: aula } = await supabase.from('aulas').select('*').eq('id', aulaId).single();

        // 3. Generate AI Response (RAG)
        if (OPENAI_API_KEY && aula) {
            try {
                const systemPrompt = `
                Eres ${prof.nombre}, un experto en ${prof.materia || 'la materia'}. 
                Tu personalidad es: ${prof.personalidad}.
                Estás asistiendo a un alumno en el aula virtual "Saby University".
                
                CONTEXTO DE LA CLASE:
                Nombre: ${aula.nombre}
                Descripción: ${aula.descripcion}
                Esquema/Contenido: ${aula.esquema || 'No hay esquema disponible.'}
                
                INSTRUCCIONES:
                - Responde de forma concisa pero útil.
                - Usa el contexto de la clase para dar respuestas precisas.
                - Si no sabes algo basado en el contexto, usa tu conocimiento general pero mantente fiel a tu personalidad.
                - Habla en español de forma académica pero cercana.
                `;

                const response = await fetch("https://api.openai.com/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${OPENAI_API_KEY}`,
                    },
                    body: JSON.stringify({
                        model: prof.modelo || "gpt-4o-mini",
                        messages: [
                            { role: "system", content: systemPrompt },
                            { role: "user", content: content }
                        ],
                    }),
                });

                if (response.ok) {
                    const aiData = await response.json();
                    const aiContent = aiData.choices[0].message.content;

                    // 4. Insert AI message
                    await supabase.from('mensajes').insert({
                        aula_id: aulaId,
                        tipo: 'foro',
                        profesor_ia_id: prof.id,
                        contenido: aiContent
                    });
                }
            } catch (err) {
                console.error("AI Professor Error:", err);
            }
        }
    }

    return { success: true };
}
