import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CATEGORIES, CATEGORY_BG, normalize, plural, recipesApi } from '../lib/recipes'
import { isSupabaseEnabled } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { Diamond, Plate, Screen, Spinner } from '../components/ui'
import {
  ClockBadge,
  IconArrowUpRight,
  IconCutlery,
  IconLogout,
  IconPencil,
  IconPlus,
  IconSearch,
} from '../components/Icons'

export default function MisRecetas() {
  const { signOut } = useAuth()
  const [recipes, setRecipes] = useState(null)
  const [error, setError] = useState(null)
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('Todas')
  const [seeding, setSeeding] = useState(false)

  const load = () =>
    recipesApi
      .list()
      .then(setRecipes)
      .catch((e) => setError(e.message))

  useEffect(() => {
    load()
  }, [])

  const lastCooked = useMemo(() => {
    if (!recipes) return null
    return (
      recipes
        .filter((r) => r.lastCookedAt)
        .sort((a, b) => b.lastCookedAt.localeCompare(a.lastCookedAt))[0] ?? null
    )
  }, [recipes])

  const list = useMemo(() => {
    if (!recipes) return []
    const nq = normalize(q.trim())
    return recipes.filter((r) => {
      if (cat !== 'Todas' && r.category !== cat) return false
      if (!nq) return true
      const hay = normalize(r.title + ' ' + r.ingredients.map((i) => i.name).join(' '))
      return hay.includes(nq)
    })
  }, [recipes, q, cat])

  const seed = async () => {
    setSeeding(true)
    try {
      await recipesApi.seed()
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setSeeding(false)
    }
  }

  return (
    <Screen>
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-start justify-between px-5 pt-7">
          <h1 className="m-0 text-[36px] leading-[1.05] font-extrabold tracking-[-0.02em]">Mis Recetas</h1>
          {isSupabaseEnabled && (
            <button
              type="button"
              onClick={signOut}
              aria-label="Cerrar sesión"
              className="grid size-12 cursor-pointer place-items-center rounded-full border-0 bg-soft text-ink"
            >
              <IconLogout />
            </button>
          )}
        </div>

        {lastCooked && (
          <div className="relative mx-5 mt-[18px] box-border min-h-[168px] overflow-hidden rounded-[28px] bg-crema p-5">
            <Plate
              src={lastCooked.imageUrl}
              alt={lastCooked.title}
              size={150}
              className="top-[18px] -right-7"
            />
            <div className="relative flex w-[200px] flex-col gap-1.5">
              <span className="text-sm font-semibold text-[#5B5420]">Lo último que cocinaste</span>
              <h2 className="m-0 text-2xl leading-[1.1] font-extrabold">{lastCooked.title}</h2>
              <Link
                to={`/receta/${lastCooked.id}/cocinar`}
                className="mt-2.5 flex h-12 items-center self-start rounded-full bg-amarillo px-[22px] text-base font-bold text-ink no-underline"
              >
                Cocinar de nuevo
              </Link>
            </div>
          </div>
        )}

        <div className="mx-5 mt-4 flex h-[54px] items-center gap-2.5 rounded-full bg-soft px-[18px] text-muted">
          <IconSearch />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por título o ingrediente..."
            aria-label="Buscar por título o ingrediente"
            className="h-full flex-1 border-0 bg-transparent text-base font-medium text-ink outline-none"
          />
        </div>

        <div
          className="no-scrollbar flex gap-2.5 overflow-x-auto px-5 pt-3.5 pb-1"
          role="toolbar"
          aria-label="Filtrar por tipo de plato"
        >
          {['Todas', ...CATEGORIES].map((k) => {
            const on = cat === k
            return (
              <button
                key={k}
                type="button"
                onClick={() => setCat(k)}
                aria-pressed={on}
                className={`h-12 flex-none cursor-pointer rounded-full border-0 px-5 text-base font-semibold ${on ? 'bg-ink text-white' : 'bg-soft text-ink'}`}
              >
                {k}
              </button>
            )
          })}
        </div>

        <div className="flex items-baseline justify-between px-5 pt-[18px]">
          <h2 className="m-0 text-2xl font-bold">Tus recetas</h2>
          {recipes && <span className="text-base font-medium text-muted">{plural(list.length, 'receta', 'recetas')}</span>}
        </div>

        {error && (
          <p className="mx-5 mt-4 rounded-2xl bg-error-bg p-4 text-sm font-semibold text-error">{error}</p>
        )}

        {!recipes && !error ? (
          <div className="flex py-16">
            <Spinner />
          </div>
        ) : (
          <div className="flex flex-col gap-3.5 px-5 pt-3.5 pb-[116px]">
            {list.map((r) => (
              <RecipeCard key={r.id} recipe={r} />
            ))}

            {recipes && recipes.length === 0 && (
              <div className="rounded-[28px] bg-soft px-3 py-8 text-center">
                <p className="m-0 mb-3 text-base text-muted-2">
                  <strong className="text-lg text-ink">Aún no tienes recetas</strong>
                  <br />
                  Crea la primera o carga las de ejemplo.
                </p>
                <button
                  type="button"
                  onClick={seed}
                  disabled={seeding}
                  className="h-12 cursor-pointer rounded-full border-0 bg-white px-5 text-base font-bold text-ink disabled:opacity-50"
                >
                  {seeding ? 'Cargando...' : 'Cargar recetas de ejemplo'}
                </button>
              </div>
            )}

            {recipes && recipes.length > 0 && list.length === 0 && (
              <div className="rounded-[28px] bg-soft px-3 py-[30px] text-center">
                <p className="m-0 mb-3 text-base text-muted-2">
                  <strong className="text-lg text-ink">Sin resultados</strong>
                  <br />
                  Prueba con otro ingrediente o cambia la categoría.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setQ('')
                    setCat('Todas')
                  }}
                  className="h-12 cursor-pointer rounded-full border-0 bg-white px-5 text-base font-bold text-ink"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <Link
        to="/nueva"
        aria-label="Crear receta"
        className="absolute right-5 bottom-6 flex h-[60px] items-center gap-2 rounded-full bg-amarillo pr-[26px] pl-5 text-[19px] font-extrabold text-ink no-underline shadow-[0_14px_26px_-12px_rgba(120,100,0,0.6)]"
      >
        <IconPlus />
        Crear
      </Link>
    </Screen>
  )
}

function RecipeCard({ recipe: r }) {
  const hasVersion = r.ingredients.some((i) => i.mod) || r.steps.some((s) => s.mod)
  return (
    <Link
      to={`/receta/${r.id}`}
      className={`relative box-border block h-[206px] overflow-hidden rounded-[30px] p-[18px] text-ink no-underline ${CATEGORY_BG[r.category] ?? 'bg-soft'}`}
    >
      <Diamond className="top-[26px] right-[70px]" />
      <Diamond className="right-[-10px] bottom-[70px]" size={70} radius={14} />
      <Plate src={r.imageUrl} alt={r.title} className="-right-9 -bottom-11" />
      <span className="absolute top-[18px] left-[18px] grid size-11 place-items-center rounded-full bg-white">
        {hasVersion ? (
          <span role="img" aria-label="Mi versión">
            <IconPencil />
          </span>
        ) : (
          <IconCutlery />
        )}
      </span>
      <span className="absolute top-[18px] right-[18px] grid size-11 place-items-center rounded-full bg-white">
        <IconArrowUpRight />
      </span>
      <span className="relative mt-[58px] flex w-[190px] flex-col gap-3">
        <span className="text-[23px] leading-[1.15] font-bold">{r.title}</span>
        <span className="flex flex-wrap gap-1.5">
          <span className="inline-flex h-[34px] items-center gap-1.5 rounded-full bg-white px-3 text-base font-semibold">
            <ClockBadge />
            {r.minutes} min
          </span>
          <span className="inline-flex h-[34px] items-center rounded-full bg-white/60 px-3 text-[15px] font-semibold">
            {r.category}
          </span>
        </span>
      </span>
    </Link>
  )
}
