'use server'

import { auth } from "@clerk/nextjs/server"
import { createSupabaseClient } from "../supabase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const createCompanion = async (formData: CreateCompanion) => {
    const {userId: author} = await auth();
    const supabase = createSupabaseClient();

    const {data, error} = await supabase
    .from( 'companions' ).insert({... formData, author})
    .select();

    if(error || !data) throw new Error(error?.message || 'Failed to create a companion');

    return data[0];
}

export const getAllCompanions = async ({ limit=10, page =1, subject, topic}: GetAllCompanions) => {
const supabase = createSupabaseClient();

let query = supabase.from('companions').select();

if(subject && topic) {
 query = query
      .ilike('subject', `%${subject}%`)
      .or(`topic.ilike.*${topic}*,name.ilike.*${topic}*`);
    } else if (subject) {
        query = query.ilike('subject', `%${subject}%`)
    } else if (topic) {
        query = query.or(`topic.ilike.*${topic}*,name.ilike.*${topic}*`)
    }

query = query.range((page - 1) * limit, page * limit -1)

const {data:companions,error} = await query;

if (error) throw new Error(error.message);

return companions;

}

export const getCompanion = async (userId: string) => {
    const supabase = createSupabaseClient();

    // 1. Obtener las companions creadas por el usuario
    const { data: createdCompanions, error: createdError } = await supabase
        .from('companions')
        .select('*')
        .eq('author', userId);

    if (createdError) throw new Error(createdError.message);

    // 2. Obtener las companions guardadas mediante Bookmark
    const { data: savedData, error: savedError } = await supabase
        .from('user_saved_companions')
        .select(`companions:companion_id (*)`)
        .eq('user_id', userId);

    if (savedError) throw new Error(savedError.message);

    const savedCompanions = savedData.map(({ companions }) => companions);

    // 3. Fusionar ambas listas eliminando posibles duplicados por ID
    const combined = [...createdCompanions, ...savedCompanions];
    const uniqueLibrary = Array.from(
        new Map(combined.map(companion => [companion.id, companion])).values()
    );

    return uniqueLibrary;
}

// Guardar o Quitar (Toggle Bookmark)
export const toggleSaveCompanion = async (companionId: string) => {
    const { userId } = await auth();
  if (!userId) redirect("/sign-in");

    const supabase = createSupabaseClient();

    const { data: existing } = await supabase
        .from('user_saved_companions')
        .select('id')
        .eq('user_id', userId)
        .eq('companion_id', companionId)
        .maybeSingle();

    if (existing) {
        await supabase
            .from('user_saved_companions')
            .delete()
            .eq('id', existing.id);
    } else {
        await supabase
            .from('user_saved_companions')
            .insert({ user_id: userId, companion_id: companionId });
    }

    // Purga la caché de la biblioteca para que aparezca/desaparezca el companion de inmediato
    revalidatePath('/library'); 
}

// Saber si la companion actual está guardada por el usuario (para activar/desactivar el icono)
export const isCompanionSaved = async (companionId: string) => {
    const { userId } = await auth();
    if (!userId) return false;

    const supabase = createSupabaseClient();

    const { data } = await supabase
        .from('user_saved_companions')
        .select('id')
        .eq('user_id', userId)
        .eq('companion_id', companionId)
        .maybeSingle();

    return !!data;
}


export const addToSessionHistory = async (companionId: string) => {
    const {userId} = await auth();
    const supabase = createSupabaseClient();
    const { data, error} = await supabase.from('session_history')
    .insert({
        companion_id: companionId,
        user_id: userId,
    })

    if (error) throw new Error(error.message);
    
    return data;

}

export const getRecentSessions = async (limit = 10) => {
    const supabase = createSupabaseClient();
    const {data,error} = await supabase
    .from('session_history')
    .select(`companions:companion_id (*)`)
    .order('created_at', {ascending:false})
    .limit(limit)

    if(error) throw new Error(error.message);

    return data.map(({companions}) => companions);
}

export const getUserSessions = async (userId: string, limit = 10) => {
    const supabase = createSupabaseClient();
    const {data,error} = await supabase
    .from('session_history')
    .select(`companions:companion_id (*)`)
    .eq('user_id', userId)
    .order('created_at', {ascending:false})
    .limit(limit)

    if(error) throw new Error(error.message);

    return data.map(({companions}) => companions);
}

export const getUserCompanions = async (userId: string) => {
    const supabase = createSupabaseClient();
    const {data,error} = await supabase
    .from('companions')
    .select()
    .eq('author', userId)

    if(error) throw new Error(error.message);

    return data;
}

export const newCompanionPermissions = async () => {
    const { userId, has } = await auth();
    const supabase = createSupabaseClient();

    let limit = 0;

    if(has({plan: 'pro'})) {
        return true;
    } else if (has({feature: "5_companion_limit"})) {
        limit = 5;
    } else if (has({feature: "10_companion_limit"})) {
        limit = 10;
    }

    const { data, error } = await supabase
    .from('companions')
    .select('id', {count: 'exact'})
    .eq('author', userId)

    if(error) throw new Error(error.message);

    const companionCount = data?.length;

    if(companionCount >= limit) {
        return false
    } else {
        return true;
    }

}

