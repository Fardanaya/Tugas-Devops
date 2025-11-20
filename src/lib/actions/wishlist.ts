"use server";

import { supabase } from '@/lib/supabase';

export const createOrUpdate = async (model: any) => {
  try {
    const { data: result, error } = await supabase
      .from('wishlist')
      .upsert(model)
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Error creating/updating wishlist:', error);
    throw error;
  }
}

export const deleteWishlist = async (id: string) => {
  try {
    const { error } = await (supabase
      .from('wishlist') as any)
      .update({ is_deleted: true })
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting wishlist:', error);
    throw error;
  }
}
