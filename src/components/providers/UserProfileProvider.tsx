"use client";

import { createContext, useContext, useEffect, useState } from "react";
// import { User } from "@/lib/types/schemas/supabase";
import { IUser as User } from "@/lib/types/schemas/user";
import { supabaseClient } from "@/lib/supabase/client";
import { fetchInstagram } from "@/lib/fetch";

type UserProfileContextType = {
  userProfile: User | null;
  loading: boolean;
  instagramData: any | null;
  loadingInstagram: boolean;
  refetch: () => Promise<void>;
};

const UserProfileContext = createContext<UserProfileContextType>({
  userProfile: null,
  loading: true,
  instagramData: null,
  loadingInstagram: false,
  refetch: async () => {},
});

export const useUserProfile = () => {
  return useContext(UserProfileContext);
};

// Session storage keys
const SESSION_STORAGE_KEYS = {
  USER_PROFILE: "user_profile_data",
  INSTAGRAM_DATA: "instagram_data",
};

// Helper functions for session storage
const getStoredUserProfile = (): User | null => {
  if (typeof window === "undefined") return null;

  try {
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEYS.USER_PROFILE);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error reading from session storage:", error);
  }

  return null;
};

const setStoredUserProfile = (userProfile: User | null) => {
  if (typeof window === "undefined") return;

  try {
    if (userProfile) {
      sessionStorage.setItem(
        SESSION_STORAGE_KEYS.USER_PROFILE,
        JSON.stringify(userProfile)
      );
    } else {
      sessionStorage.removeItem(SESSION_STORAGE_KEYS.USER_PROFILE);
      // Also clear Instagram data when user profile is cleared
      sessionStorage.removeItem(SESSION_STORAGE_KEYS.INSTAGRAM_DATA);
    }
  } catch (error) {
    console.error("Error writing to session storage:", error);
  }
};

const getStoredInstagramData = (): any | null => {
  if (typeof window === "undefined") return null;

  try {
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEYS.INSTAGRAM_DATA);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error reading Instagram data from session storage:", error);
  }

  return null;
};

const setStoredInstagramData = (instagramData: any | null) => {
  if (typeof window === "undefined") return;

  try {
    if (instagramData) {
      sessionStorage.setItem(
        SESSION_STORAGE_KEYS.INSTAGRAM_DATA,
        JSON.stringify(instagramData)
      );
    } else {
      sessionStorage.removeItem(SESSION_STORAGE_KEYS.INSTAGRAM_DATA);
    }
  } catch (error) {
    console.error("Error writing Instagram data to session storage:", error);
  }
};

const UserProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [instagramData, setInstagramData] = useState<any | null>(null);
  const [loadingInstagram, setLoadingInstagram] = useState(false);

  const fetchUserProfile = async (userId: string, useCache: boolean = true) => {
    try {
      setLoading(true);

      // Try to get cached data first if useCache is true
      let cachedProfile: User | null = null;
      if (useCache) {
        cachedProfile = getStoredUserProfile();
        if (cachedProfile && cachedProfile.id === userId) {
          setUserProfile(cachedProfile);
          setLoading(false);
        }
      }

      const supabase = supabaseClient();
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        setUserProfile(null);
        setStoredUserProfile(null);
      } else {
        // Only update if data is different from cached data
        const currentProfile = cachedProfile || userProfile;
        const isDifferent =
          !currentProfile ||
          JSON.stringify(currentProfile) !== JSON.stringify(data);

        if (isDifferent) {
          setUserProfile(data);
          setStoredUserProfile(data);
        }
      }
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
      setUserProfile(null);
      setStoredUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    if (userProfile?.id) {
      await fetchUserProfile(userProfile.id);
    }
  };

  useEffect(() => {
    const supabase = supabaseClient();

    // Get initial session and fetch user profile
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.id) {
        fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user?.id) {
        fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (userProfile?.instagram) {
      try {
        setLoadingInstagram(true);

        // Try to get cached Instagram data first
        const cachedInstagramData = getStoredInstagramData();
        if (cachedInstagramData) {
          setInstagramData(cachedInstagramData);
          setLoadingInstagram(false);
        }

        // Fetch fresh Instagram data
        fetchInstagram(userProfile?.instagram).then((res) => {
          const newInstagramData = res.data;

          // Only update if data is different from cached data
          const currentInstagramData = cachedInstagramData || instagramData;
          const isDifferent =
            !currentInstagramData ||
            JSON.stringify(currentInstagramData) !==
              JSON.stringify(newInstagramData);

          if (isDifferent) {
            setInstagramData(newInstagramData);
            setStoredInstagramData(newInstagramData);
          }
        });
      } catch (error) {
        console.error("Error fetching Instagram data:", error);
      } finally {
        setLoadingInstagram(false);
      }
    } else {
      setInstagramData(null);
      setStoredInstagramData(null);
    }
  }, [userProfile]);

  return (
    <UserProfileContext.Provider
      value={{ userProfile, loading, instagramData, loadingInstagram, refetch }}
    >
      {children}
    </UserProfileContext.Provider>
  );
};

export default UserProfileProvider;
