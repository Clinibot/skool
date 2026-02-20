"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function setUserRole(role: 'creator' | 'participant') {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase
        .from('profiles')
        .update({ global_role: role })
        .eq('id', user.id);

    if (error) throw error;

    redirect('/dashboard');
}
