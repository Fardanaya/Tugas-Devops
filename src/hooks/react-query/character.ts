"use client";

import { supabaseClient } from "@/lib/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ICharacter, defaultCharacter } from "@/lib/types/schemas/character";
import { usePaginatedQuery } from "./pagination";
import { createOrUpdate as createOrUpdateCharacterAction, deleteCharacter as deleteCharacterAction } from "../../lib/actions/character";

export function useCharacter(filters?: Record<string, any>) {
    return useQuery({
        queryKey: ["characters", filters],
        queryFn: async () => {
            const supabase = supabaseClient();

            let query = supabase
                .from("characters")
                .select("*, series:series(*)")
                .eq('is_deleted', false);

            // Apply filters if provided
            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== null && value !== '') {
                        if (key === 'search') {
                            query = query.ilike('name', `%${value}%`);
                        } else if (key === 'series_id') {
                            query = query.eq('series_id', value);
                        }
                    }
                });
            }

            const { data: characters } = await query.order('name', { ascending: true });

            return characters as ICharacter[];
        },
    });
}

export function useCharacterById(id?: string) {
    return useQuery({
        queryKey: ["characters", id],
        queryFn: async () => {
            if (!id) return null;

            const supabase = supabaseClient();
            const { data: character } = await supabase
                .from("characters")
                .select("*, series:series(*)")
                .eq("id", id)
                .eq('is_deleted', false)
                .single();

            return character ? Object.assign({}, defaultCharacter, character) as ICharacter : null;
        },
        enabled: !!id,
    });
}

export function useAllCharacters() {
    return useQuery({
        queryKey: ["characters", "all"],
        queryFn: async () => {
            const supabase = supabaseClient();
            const { data: characters } = await supabase
                .from("characters")
                .select("*, series:series(*)")
                .eq('is_deleted', false)
                .order('name', { ascending: true });

            return characters as ICharacter[];
        },
    });
}

export function useCreateOrUpdateCharacters() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createOrUpdateCharacterAction,
        onSuccess: () => {
            // Invalidate and refetch characters queries to update the UI
            queryClient.invalidateQueries({ queryKey: ["characters"] });
        },
    });
}

export function usePaginatedCharacters(options: { page?: number; pageSize?: number; searchTerm?: string } = {}) {
    return usePaginatedQuery<ICharacter>("characters", {
        searchFields: ["name"],
        orderBy: "created_at",
        orderDirection: "desc",
        additionalFilters: { is_deleted: false },
        select: "*, series:series(*)",
        ...options
    });
}

export function useDeleteCharacter() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteCharacterAction,
        onSuccess: () => {
            // Invalidate and refetch characters queries to update the UI
            queryClient.invalidateQueries({ queryKey: ["characters"] });
        },
    });
}
