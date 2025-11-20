import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createOrUpdate, deleteWishlist } from "@/lib/actions/wishlist";
import { supabase } from "@/lib/supabase";

// Get wishlist by user
export const getWishlistByUser = async (userId: string) => {
    const { data, error } = await supabase
        .from("wishlist")
        .select(`
      *,
      catalog: catalog_id (*, character:character_id (*, series:series_id (*))),
      user:user_id (*)
    `)
        .eq("user_id", userId);

    if (error) throw error;
    return data;
};

// Get wishlist by catalog
export const getWishlistByCatalog = async (catalogId: string) => {
    const { data, error } = await supabase
        .from("wishlist")
        .select(`
      *,
      catalog: catalog_id (*, character:character_id (*, series:series_id (*))),
      user:user_id (*)
    `)
        .eq("catalog_id", catalogId);

    if (error) throw error;
    return data;
};

// Check if item is in wishlist
export const checkWishlistItem = async (userId: string, catalogId: string) => {
    const { data, error } = await supabase
        .from("wishlist")
        .select("*")
        .eq("user_id", userId)
        .eq("catalog_id", catalogId)
        .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
};

// React Query hooks
export const useWishlistByUser = (userId?: string) => {
    return useQuery({
        queryKey: ["wishlist", "user", userId],
        queryFn: () => getWishlistByUser(userId!),
        enabled: !!userId,
    });
};

export const useWishlistByCatalog = (catalogId?: string) => {
    return useQuery({
        queryKey: ["wishlist", "catalog", catalogId],
        queryFn: () => getWishlistByCatalog(catalogId!),
        enabled: !!catalogId,
    });
};

export const useCheckWishlistItem = (userId?: string, catalogId?: string) => {
    return useQuery({
        queryKey: ["wishlist", "check", userId, catalogId],
        queryFn: () => checkWishlistItem(userId!, catalogId!),
        enabled: !!userId && !!catalogId,
    });
};

export const useCreateWishlist = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createOrUpdate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["wishlist"] });
        },
    });
};

export const useDeleteWishlist = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteWishlist,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["wishlist"] });
        },
    });
};
