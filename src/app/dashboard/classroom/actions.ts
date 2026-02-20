"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitQuizResult(quizId: string, score: number) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase
        .from('quiz_results')
        .insert({
            quiz_id: quizId,
            user_id: user.id,
            score: score
        });

    if (error) throw error;

    revalidatePath('/dashboard/classroom');
    return { success: true };
}
