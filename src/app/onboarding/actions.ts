"use server";

import { createPublicClient } from "@/utils/supabase/server";

export async function setUserRole(role: 'creator' | 'participant') {
    // Use public client so RPC resolves in public schema (SECURITY DEFINER)
    const supabase = await createPublicClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase.rpc('set_user_role', { uid: user.id, role });

    if (error) throw error;

    return { success: true };
}
