"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function setUserRole(role: 'creator' | 'participant') {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase
        .from('profiles')
        .update({ global_role: role })
        .eq('id', user.id);

    if (error) throw error;

    revalidatePath('/onboarding');
    return { success: true };
}
