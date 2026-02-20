"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createCommunity(formData: { name: string, slug: string, description?: string }) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // 1. Create the community
    const { data: community, error: communityError } = await supabase
        .from('communities')
        .insert({
            name: formData.name,
            slug: formData.slug,
            description: formData.description,
            owner_id: user.id
        })
        .select()
        .single();

    if (communityError) throw communityError;

    // 2. Add creator as the first member (owner role)
    const { error: memberError } = await supabase
        .from('memberships')
        .insert({
            user_id: user.id,
            community_id: community.id,
            role: 'owner'
        });

    if (memberError) throw memberError;

    revalidatePath('/dashboard');
    return { success: true, community };
}

export async function setUserRole(role: 'creator' | 'participant') {
    const supabase = await createClient(); // Use createClient for consistent schema if needed, but the RPC is in public

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase.rpc('set_user_role', { uid: user.id, role });

    if (error) throw error;

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/ajustes');
    return { success: true };
}

export async function sendDirectMessage(receiverId: string, content: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase.from('direct_messages').insert({
        sender_id: user.id,
        receiver_id: receiverId,
        content: content
    });

    if (error) throw error;
    return { success: true };
}
