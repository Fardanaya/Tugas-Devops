"use client";

import { supabaseClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { IUser, defaultUser } from "@/lib/types/schemas/user";
import { usePaginatedUsers as useUniversalPaginatedUsers } from "./pagination";

export function useUser() {
    return useQuery({
        queryKey: ["user"],
        queryFn: async () => {
            const supabase = supabaseClient();
            const { data } = await supabase.auth.getSession();

            if (data.session?.user) {
                // Fetch user information from public.users table
                const { data: user } = await supabase
                    .from("users")
                    .select("*")
                    .eq("id", data.session.user.id)
                    .single();

                return user ? Object.assign({}, defaultUser, user) as IUser : defaultUser;
            }
            return defaultUser;
        },
    });
}

export function useUserById(id?: string) {
    return useQuery({
        queryKey: ["user", id],
        queryFn: async () => {
            if (!id) return null;

            const supabase = supabaseClient();
            const { data: user } = await supabase
                .from("users")
                .select("*")
                .eq("id", id)
                .single();

            return user ? Object.assign({}, defaultUser, user) as IUser : null;
        },
        enabled: !!id,
    });
}

export function useAllUsers() {
    return useQuery({
        queryKey: ["users"],
        queryFn: async () => {
            console.log("Testing simple users query...");
            const supabase = supabaseClient();

            // First test basic connection
            const { data: session, error: sessionError } = await supabase.auth.getSession();
            console.log("Session test:", sessionError ? sessionError : "OK");

            if (sessionError) {
                throw sessionError;
            }

            // Test simple users query
            console.log("Executing users query...");
            const { data: users, error: usersError } = await supabase
                .from("users")
                .select("*")
                .limit(5); // Limit to 5 for testing

            console.log("Users query result:", { users, error: usersError });

            if (usersError) {
                console.error("Users query failed:", usersError);
                throw usersError;
            }

            return users as IUser[];
        },
    });
}

// Re-export the universal paginated users hook with proper typing
export function usePaginatedUsers(options: { page?: number; pageSize?: number; searchTerm?: string } = {}) {
    return useUniversalPaginatedUsers<IUser>(options);
}
