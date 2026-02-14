import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/src/types/supabase'

/**
 * Supabase Admin Client
 * 
 * ⚠️ CRITICAL: This file MUST NOT be imported in client-side code ('use client').
 * Service Role Key bypasses Row Level Security (RLS) and should only be used
 * in server-side scripts (e.g., crawling, data migration, admin operations).
 * 
 * Usage:
 * - ✅ Server-side scripts (features/crawling/*)
 * - ✅ API routes (app/api/*)
 * - ❌ Client components ('use client')
 * - ❌ Server components that render to client
 */

let adminClientInstance: SupabaseClient<Database> | null = null

/**
 * Get or create Admin Supabase client with Service Role Key
 * Lazy initialization ensures environment variables are loaded before client creation
 * This client bypasses RLS and should only be used in secure server-side contexts
 */
export function getAdminClient(): SupabaseClient<Database> {
  if (adminClientInstance) {
    return adminClientInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL environment variable is not set')
  }

  if (!supabaseServiceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is not set')
  }

  adminClientInstance = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    // Disable session management for admin operations
    // Admin client doesn't need user sessions
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  return adminClientInstance
}

/**
 * Admin Supabase client (backward compatibility)
 * @deprecated Use getAdminClient() instead for better lazy initialization
 */
export const adminClient = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop) {
    return getAdminClient()[prop as keyof SupabaseClient<Database>]
  },
})
