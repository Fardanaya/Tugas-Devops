"use server";

import { createClient } from '@/lib/supabase/server';

export const createOrUpdate = async (model: any) => {
  try {
    const supabase = await createClient();
    const { data: result, error } = await supabase
      .from('characters')
      .upsert(model)
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Error creating/updating character:', error);
    throw error;
  }
}

export const deleteCharacter = async (id: string) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('characters')
      .update({ is_deleted: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error deleting character:', error);
    throw error;
  }
}
