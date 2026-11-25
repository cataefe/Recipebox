// Capa de datos: usa Supabase si está configurado; si no, localStorage.
import { supabase, isSupabaseEnabled, PHOTO_BUCKET } from './supabase'
import { SEED_RECIPES } from './seed'

export const CATEGORIES = ['Fondos', 'Entradas', 'Postres', 'Ensaladas']
export const SOURCES = ['Familia', 'Internet', 'Propia']

export const CATEGORY_BG = {
  Fondos: 'bg-lima',
  Entradas: 'bg-durazno',
  Postres: 'bg-lavanda',
  Ensaladas: 'bg-menta',
}

// ---------- Mapeo fila de BD <-> objeto de la app ----------

const fromRow = (r) => ({
  id: r.id,
  title: r.title,
  category: r.category,
  minutes: r.minutes,
  source: r.source ?? '',
  sourceDetail: r.source_detail ?? '',
  notes: r.notes ?? '',
  imageUrl: r.image_url ?? '',
  heroImageUrl: r.hero_image_url ?? '',
  ingredients: r.ingredients ?? [],
  steps: r.steps ?? [],
  lastCookedAt: r.last_cooked_at,
  createdAt: r.created_at,
})

const toRow = (r) => {
  const row = {
    title: r.title,
    category: r.category,
    minutes: r.minutes,
    source: r.source,
    source_detail: r.sourceDetail,
    notes: r.notes,
    image_url: r.imageUrl,
    hero_image_url: r.heroImageUrl,
    ingredients: r.ingredients,
    steps: r.steps,
    last_cooked_at: r.lastCookedAt,
  }
  Object.keys(row).forEach((k) => row[k] === undefined && delete row[k])
  return row
}

// ---------- Backend local (localStorage) ----------

const LS_KEY = 'recipebox:recipes'

const uid = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`

function localLoad() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* sin almacenamiento disponible */
  }
  const seeded = SEED_RECIPES.map((r, i) => ({
    ...r,
    id: uid(),
    createdAt: new Date(Date.now() - i * 1000).toISOString(),
  }))
  localSave(seeded)
  return seeded
}

function localSave(list) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(list))
  } catch {
    /* lleno o bloqueado */
  }
}

const local = {
  async list() {
    return localLoad().sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
  },
  async get(id) {
    return localLoad().find((r) => r.id === id) ?? null
  },
  async create(recipe) {
    const list = localLoad()
    const created = { ...recipe, id: uid(), createdAt: new Date().toISOString(), lastCookedAt: null }
    localSave([created, ...list])
    return created
  },
  async update(id, patch) {
    const list = localLoad()
    const i = list.findIndex((r) => r.id === id)
    if (i < 0) throw new Error('Receta no encontrada')
    list[i] = { ...list[i], ...patch }
    localSave(list)
    return list[i]
  },
  async remove(id) {
    localSave(localLoad().filter((r) => r.id !== id))
  },
  async uploadPhoto(file) {
    // En modo local la foto se guarda reducida como data URL.
    return resizeToDataUrl(file, 900)
  },
  async seed() {
    localStorage.removeItem(LS_KEY)
    localLoad()
  },
}

// ---------- Backend Supabase ----------

const remote = {
  async list() {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data.map(fromRow)
  },
  async get(id) {
    const { data, error } = await supabase.from('recipes').select('*').eq('id', id).maybeSingle()
    if (error) throw error
    return data ? fromRow(data) : null
  },
  async create(recipe) {
    const { data: auth } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('recipes')
      .insert({ ...toRow(recipe), user_id: auth.user.id })
      .select()
      .single()
    if (error) throw error
    return fromRow(data)
  },
  async update(id, patch) {
    const { data, error } = await supabase
      .from('recipes')
      .update(toRow(patch))
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return fromRow(data)
  },
  async remove(id) {
    const { error } = await supabase.from('recipes').delete().eq('id', id)
    if (error) throw error
  },
  async uploadPhoto(file) {
    const { data: auth } = await supabase.auth.getUser()
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
    const path = `${auth.user.id}/${uid()}.${ext}`
    const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, file, {
      cacheControl: '31536000',
      contentType: file.type,
    })
    if (error) throw error
    return supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl
  },
  async seed() {
    const { data: auth } = await supabase.auth.getUser()
    const rows = SEED_RECIPES.map((r) => ({ ...toRow(r), user_id: auth.user.id }))
    const { error } = await supabase.from('recipes').insert(rows)
    if (error) throw error
  },
}

export const recipesApi = isSupabaseEnabled ? remote : local

// ---------- Utilidades ----------

export const normalize = (s) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

export const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`

const UNIT =
  '(?:kg|g|gr|ml|cc|l|litros?|tazas?|cdas?\\.?|cdtas?\\.?|cucharadas?|cucharaditas?|u\\.?|unidades?|dientes?|manojos?|latas?|pizcas?|sobres?)'
const QTY_RE = new RegExp(`^((?:\\d+[\\d.,/]*|[½¼¾])(?:\\s*${UNIT})?)\\s+(?:de\\s+)?(.+)$`, 'i')

/** "500 g de carne molida" -> { qty: "500 g", name: "Carne molida" } */
export function parseIngredient(line) {
  const t = line.trim()
  const m = t.match(QTY_RE)
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)
  if (m) return { qty: m[1], name: cap(m[2]), mod: '' }
  return { qty: '', name: cap(t), mod: '' }
}

/** Detecta "15 minutos" en el texto de un paso, para el temporizador. */
export function parseStepMinutes(text) {
  const m = text.match(/(\d+)\s*(?:min|minutos?)\b/i)
  if (m) return Number(m[1])
  const h = text.match(/(\d+)\s*(?:h|horas?)\b/i)
  return h ? Number(h[1]) * 60 : 0
}

/** Ingredientes cuyo nombre aparece en el texto del paso. */
export function guessStepUses(text, ingredients) {
  const t = normalize(text)
  return ingredients
    .map((ing, i) => {
      const words = normalize(ing.name)
        .split(/\s+/)
        .filter((w) => w.length > 3)
      const root = (w) => w.replace(/(es|s)$/, '')
      return words.some((w) => t.includes(root(w))) ? i : -1
    })
    .filter((i) => i >= 0)
}

export const lines = (t) =>
  String(t ?? '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

function resizeToDataUrl(file, max) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height))
      const c = document.createElement('canvas')
      c.width = Math.round(img.width * scale)
      c.height = Math.round(img.height * scale)
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
      URL.revokeObjectURL(url)
      resolve(c.toDataURL('image/jpeg', 0.82))
    }
    img.onerror = reject
    img.src = url
  })
}
