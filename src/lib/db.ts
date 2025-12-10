import { createClient } from '@supabase/supabase-js'
import { createBrowserClient, createServerClient as createSSRServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Server-side client
export function createServerClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.'
    )
  }
  return createSSRServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookies().get(name)?.value
      },
      set(name: string, value: string, options: any) {
        cookies().set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        cookies().set({ name, value: '', ...options })
      },
    },
  })
}

// Client-side client
export function createClientClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.'
    )
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Admin client (for server-side operations with service role)
// This bypasses RLS and should be used carefully for admin operations
export function getSupabaseAdmin() {
  if (!supabaseUrl || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase service role key not configured. Please set SUPABASE_SERVICE_ROLE_KEY in .env.local')
  }
  return createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      db: {
        schema: 'public'
      }
    }
  )
}

