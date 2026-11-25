import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Si faltan las variables de entorno, la app funciona en "modo local"
// (datos en el navegador, sin inicio de sesión).
export const supabase = url && anonKey ? createClient(url, anonKey) : null
export const isSupabaseEnabled = Boolean(supabase)

export const PHOTO_BUCKET = 'recipe-photos'
