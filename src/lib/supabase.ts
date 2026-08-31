import { createClient, type SupabaseClient } from '@supabase/supabase-js'

function isAnonKey(key: string) {
  try {
    const payload = key.split('.')[1]
    if (!payload) return true
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as {
      role?: string
    }
    return json.role !== 'service_role'
  } catch {
    return !key.includes('service_role')
  }
}

function createSupabase(): SupabaseClient | null {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim()
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

  if (!url || !anon || url.includes('SEU-PROJETO') || anon.includes('sua-anon-key')) {
    return null
  }

  if (!isAnonKey(anon)) {
    console.error('SemDP: nunca use a service_role no frontend. Use apenas a anon key.')
    return null
  }

  return createClient(url, anon)
}

export const supabase = createSupabase()
export const isSupabaseConfigured = supabase !== null
