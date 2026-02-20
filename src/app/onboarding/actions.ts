"use server";

import { createClient } from "@/utils/supabase/server";

export async function setUserRole(role: 'creator' | 'participant') {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Use the public schema RPC (SECURITY DEFINER) — avoids PostgREST schema issues
    const { error } = await supabase.rpc('set_user_role', { uid: user.id, role });

    if (error) throw error;

    return { success: true };
}
