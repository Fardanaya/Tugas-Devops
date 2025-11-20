interface RequestConfig {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: any;
    cache?: "force-cache" | "no-store";
    revalidate?: false | 0 | number;
    tags?: string[];
}

export const fetchServer = async (
    url: string,
    options: RequestConfig = {},
) => {
    try {
        const fetchOptions: RequestInit = {
            method: options.method || "GET",
            body: options.body ? JSON.stringify(options.body) : null,
        };

        if (fetchOptions.method === "GET") {
            fetchOptions.next = {
                revalidate: 3600,
                tags: options.tags
            };
        }

        const response = await fetch(url, fetchOptions);

        if (!response.ok) {
            const errorData = await response.json();
            return errorData;
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
};

// Fetcher function for SWR
export const fetcher = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) {
        const error = new Error('An error occurred while fetching the data.');
        throw error;
    }
    return response.json();
};

export const fetchInstagram = async (username: string, forceRefresh?: boolean) => {
    if (!username) return;

    try {
        const response = await fetch(
            `/api/tools/sosmed/instagram?username_or_id=${username}${forceRefresh ? '&refresh=true' : ''}`,
            {
                cache: forceRefresh ? 'no-cache' : 'force-cache',
                next: {
                    revalidate: 10800,
                    tags: [`instagram-client-${username.toLowerCase()}`]
                }
            }
        );
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch Instagram data:", error);
        throw error;
    }
};