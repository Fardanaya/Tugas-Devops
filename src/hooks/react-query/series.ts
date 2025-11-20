"use client";

import { supabaseClient } from "@/lib/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ISeries, defaultSeries } from "@/lib/types/schemas/series";
import { usePaginatedQuery } from "./pagination";
import { createOrUpdate as createOrUpdateSeriesAction, deleteSeries as deleteSeriesAction } from "../../lib/actions/series";
import { displayToast } from "@/lib/utils";

export function useSeries(filters?: Record<string, any>) {
    return useQuery({
        queryKey: ["series", filters],
        queryFn: async () => {
            const supabase = supabaseClient();

            let query = supabase
                .from("series")
                .select("*")
                .eq('is_deleted', false);

            // Apply filters if provided
            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== null && value !== '') {
                        if (key === 'search') {
                            query = query.ilike('name', `%${value}%`);
                        } else if (key === 'category') {
                            query = query.eq('category', value);
                        }
                    }
                });
            }

            const { data: series } = await query.order('name', { ascending: true });

            return series as ISeries[];
        },
    });
}

export function useSeriesById(id?: string) {
    return useQuery({
        queryKey: ["series", id],
        queryFn: async () => {
            if (!id) return null;

            const supabase = supabaseClient();
            const { data: series } = await supabase
                .from("series")
                .select("*")
                .eq("id", id)
                .eq('is_deleted', false)
                .single();

            return series ? Object.assign({}, defaultSeries, series) as ISeries : null;
        },
        enabled: !!id,
    });
}

export function useAllSeries() {
    return useQuery({
        queryKey: ["series", "all"],
        queryFn: async () => {
            const supabase = supabaseClient();
            const { data: series } = await supabase
                .from("series")
                .select("*")
                .eq('is_deleted', false)
                .order('name', { ascending: true });

            return series as ISeries[];
        },
    });
}

export function usePaginatedSeries(options: { page?: number; pageSize?: number; searchTerm?: string } = {}) {
    return usePaginatedQuery<ISeries>("series", {
        searchFields: ["name"],
        orderBy: "name",
        orderDirection: "asc",
        additionalFilters: { is_deleted: false },
        ...options
    });
}

export function useCreateOrUpdateSeries() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createOrUpdateSeriesAction,
        onSuccess: (result, variables) => {
            // Invalidate and refetch series queries to update the UI
            queryClient.invalidateQueries({ queryKey: ["series"] });

            const isUpdate = variables?.id !== undefined && variables?.id !== null;
            displayToast({
                type: "success",
                title: "Success",
                description: `Series ${isUpdate ? "updated" : "created"} successfully`
            });
        },
    });
}

export function useDeleteSeries() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteSeriesAction,
        onSuccess: () => {
            // Invalidate and refetch series queries to update the UI
            queryClient.invalidateQueries({ queryKey: ["series"] });
            displayToast({ type: "warning", title: "Success", description: "Series deleted successfully" });
        },
    });
}
