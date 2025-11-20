import { createClient } from '@supabase/supabase-js'
import { Database } from '@/lib/types/supabase'

// Test-specific Supabase client that doesn't rely on Next.js APIs
// Uses service role key to bypass RLS policies for testing
export function createTestSupabaseClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase environment variables not configured for integration tests. Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
    }

    return createClient<Database>(supabaseUrl, supabaseServiceKey, {
        auth: {
            persistSession: false, // Don't persist sessions in tests
            autoRefreshToken: false, // Don't auto-refresh tokens in tests
        }
    })
}

// Test database operations helper
export class TestDatabaseHelper {
    private supabase = createTestSupabaseClient()

    async cleanupTestBrands() {
        // Clean up any test brands that might be left over
        const { error } = await this.supabase
            .from('brands')
            .delete()
            .like('name', 'Test Brand %')

        if (error) {
            console.warn('Failed to cleanup test brands:', error)
        }
    }

    async getBrandCount() {
        const { count, error } = await this.supabase
            .from('brands')
            .select('*', { count: 'exact', head: true })

        if (error) {
            throw error
        }

        return count || 0
    }
}
