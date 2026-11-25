import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CATEGORIES,
  CATEGORY_BG,
  SOURCES,
  guessStepUses,
  lines,
  parseIngredient,
  parseStepMinutes,
  plural,
  recipesApi,
} from '../lib/recipes'
import { RoundButton, Screen } from '../components/ui'
import { IconAlert, IconBack, IconCheck, IconPencil, IconPhoto, IconPlus } from '../components/Icons'

const DRAFT_KEY = 'recipebox:draft'
const EMPTY = {
  title: '',
  category: 'Fondos',
  minutes: '',
  ing: '',
  st: '',
  notes: '',
  source: 'Familia',
  sourceDetail: '',
}

function loadDraft() {
  try {
    return { ...EMPTY, ...JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}') }
  } catch {
    return EMPTY
  }
}

export default function NuevaReceta() {
  const navigate = useNavigate()
  const [f, setF] = useState(loadDraft)
  const [tried, setTried] = useState(false)
  const [photo, setPhoto] = useState(null) // File
  const [preview, setPreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [draftSaved, setDraftSaved] = useState(false)

  // Borrador guardado automáticamente
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(f))
        setDraftSaved(JSON.stringify(f) !== JSON.stringify(EMPTY))
      } catch {
        /* ignorar */
      }
    }, 400)
    return () => clearTimeout(t)
  }, [f])

  useEffect(() => {
    if (!photo) return setPreview('')
    const url = URL.createObjectURL(photo)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [photo])

  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }))
  const ok = f.title.trim() !== ''
  const err = tried && !ok
  const nIng = lines(f.ing).length
  const nSt = lines(f.st).length

  const save = async () => {
    setTried(true)
    if (!ok || saving) return
    setSaving(true)
    setError('')
    try {
      const ingredients = lines(f.ing).map(parseIngredient)
      const steps = lines(f.st).map((text) => ({
        text,
        minutes: parseStepMinutes(text),
        uses: guessStepUses(text, ingredients),
        mod: '',
      }))
      const stepMinutes = steps.reduce((a, s) => a + s.minutes, 0)
      const imageUrl = photo ? await recipesApi.uploadPhoto(photo) : ''
      const created = await recipesApi.create({
        title: f.title.trim(),
        category: f.category,
        minutes: Number(f.minutes) || stepMinutes || 0,
        source: f.source,
        sourceDetail: f.sourceDetail.trim(),
        notes: f.notes.trim(),
        imageUrl,
        heroImageUrl: '',
        ingredients,
        steps,
      })
      localStorage.removeItem(DRAFT_KEY)
      navigate(`/receta/${created.id}`, { replace: true })
    } catch (e) {
      setError(e.message || 'No se pudo guardar la receta.')
      setSaving(false)
    }
  }

  const field = 'box-border border-0 bg-soft font-medium text-ink'

  return (
    <Screen>
      <div className="flex flex-none items-center gap-3 px-5 pt-[18px] pb-2.5">
        <RoundButton to="/" label="Volver">
          <IconBack />
        </RoundButton>
        <h1 className="m-0 flex-1 text-[26px] font-extrabold tracking-[-0.01em]">Nueva Receta</h1>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="h-12 cursor-pointer rounded-full border-0 bg-amarillo px-5 text-base font-extrabold text-ink disabled:opacity-60"
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      {draftSaved && (
        <div className="mx-5 flex flex-none items-center gap-2 rounded-2xl bg-menta px-3.5 py-2.5 text-sm font-semibold">
          <span className="grid size-6 place-items-center rounded-full bg-white">
            <IconCheck />
          </span>
          Borrador guardado automáticamente
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <form
          className="flex flex-col gap-[22px] px-5 pt-5 pb-10"
          onSubmit={(e) => {
            e.preventDefault()
            save()
          }}
        >
          {error && <p className="m-0 rounded-2xl bg-error-bg p-4 text-sm font-semibold text-error">{error}</p>}

          <div className="flex flex-col gap-2">
            <label htmlFor="pa-t" className="text-[17px] font-bold">
              Título de la preparación *
            </label>
            <input
              id="pa-t"
              value={f.title}
              onChange={set('title')}
              placeholder="Ej: Porotos granados"
              aria-required="true"
              aria-invalid={err}
              className={`h-14 rounded-[18px] px-[18px] text-[17px] font-medium text-ink ${err ? 'border-2 border-solid border-error-border bg-error-bg' : 'border-0 bg-soft'}`}
            />
            {err && (
              <span className="flex items-center gap-1.5 text-sm font-bold text-error">
                <IconAlert />
                Ponle un nombre a la receta para guardarla.
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[17px] font-bold">Categoría</span>
            <div className="grid grid-cols-2 gap-2.5">
              {CATEGORIES.map((k) => {
                const on = f.category === k
                return (
                  <button
                    key={k}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setF((p) => ({ ...p, category: k }))}
                    className={`flex h-16 cursor-pointer items-center justify-between rounded-[22px] border-2 border-solid pr-3.5 pl-[18px] text-[17px] font-bold text-ink ${CATEGORY_BG[k]} ${on ? 'border-ink' : 'border-transparent'}`}
                  >
                    <span>{k}</span>
                    <span className={`grid size-[26px] place-items-center rounded-full ${on ? 'bg-ink text-white' : 'bg-white'}`}>
                      {on && <IconCheck />}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="pa-m" className="text-[17px] font-bold">
              Tiempo de preparación
            </label>
            <div className="flex items-center gap-3 text-base font-semibold text-muted-2">
              <input
                id="pa-m"
                type="number"
                inputMode="numeric"
                min="1"
                placeholder="45"
                value={f.minutes}
                onChange={set('minutes')}
                className={`h-14 w-[120px] rounded-[18px] px-[18px] text-[17px] ${field}`}
              />
              minutos
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label htmlFor="pa-ing" className="text-[17px] font-bold">
                Ingredientes
              </label>
              <span className="rounded-full bg-lima px-3 py-1 text-sm font-bold">
                {plural(nIng, 'ingrediente', 'ingredientes')}
              </span>
            </div>
            <textarea
              id="pa-ing"
              value={f.ing}
              onChange={set('ing')}
              placeholder={'8 choclos desgranados\n500 g de carne molida\n1 taza de leche'}
              className={`min-h-32 resize-y rounded-[22px] px-[18px] py-3.5 text-[17px] leading-normal ${field}`}
            />
            <span className="text-sm text-muted-2">Un ingrediente por línea. Puedes pegar una lista completa.</span>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label htmlFor="pa-st" className="text-[17px] font-bold">
                Pasos de preparación
              </label>
              <span className="rounded-full bg-lima px-3 py-1 text-sm font-bold">{plural(nSt, 'paso', 'pasos')}</span>
            </div>
            <textarea
              id="pa-st"
              value={f.st}
              onChange={set('st')}
              placeholder={'Sofríe la cebolla con el comino\nAgrega la carne y cocina 10 minutos'}
              className={`min-h-32 resize-y rounded-[22px] px-[18px] py-3.5 text-[17px] leading-normal ${field}`}
            />
            <span className="text-sm text-muted-2">
              Cada paso en una línea nueva. Si dices “10 minutos”, el paso tendrá temporizador.
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-sm font-bold text-muted-2">
            <span className="h-0.5 flex-1 rounded-sm bg-line-2" />
            Opcional
            <span className="h-0.5 flex-1 rounded-sm bg-line-2" />
          </div>

          <div className="flex flex-col gap-2 rounded-[26px] bg-lavanda p-[18px]">
            <label htmlFor="pa-no" className="flex items-center gap-2.5 text-[17px] font-bold">
              <span className="grid size-9 place-items-center rounded-full bg-white">
                <IconPencil size={16} w={2.4} />
              </span>
              Mis notas personales
            </label>
            <textarea
              id="pa-no"
              value={f.notes}
              onChange={set('notes')}
              placeholder="Sustituciones, secretos de familia, ajustes de porciones..."
              className="box-border min-h-[88px] resize-y rounded-[18px] border-0 bg-white px-4 py-3.5 text-base leading-normal font-medium text-ink"
            />
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="text-[17px] font-bold">¿De dónde viene?</span>
            <div className="flex flex-wrap gap-2">
              {SOURCES.map((k) => {
                const on = f.source === k
                return (
                  <button
                    key={k}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setF((p) => ({ ...p, source: on ? '' : k }))}
                    className={`h-12 cursor-pointer rounded-full border-0 px-5 text-base font-semibold ${on ? 'bg-ink text-white' : 'bg-soft text-ink'}`}
                  >
                    {k}
                  </button>
                )
              })}
            </div>
            <input
              aria-label="Detalle del origen"
              value={f.sourceDetail}
              onChange={set('sourceDetail')}
              placeholder="Ej: WhatsApp de mamá o link de Instagram"
              className={`h-14 rounded-[18px] px-[18px] text-base ${field}`}
            />
          </div>

          <label className="relative flex cursor-pointer items-center gap-3.5 overflow-hidden rounded-[26px] bg-crema p-[18px]">
            {preview ? (
              <img src={preview} alt="" className="size-14 flex-none rounded-full object-cover" />
            ) : (
              <span className="grid size-14 flex-none place-items-center rounded-full bg-white">
                <IconPhoto />
              </span>
            )}
            <span className="flex flex-1 flex-col gap-0.5">
              <b className="text-[17px]">Foto de portada</b>
              <span className="text-sm text-muted-2">{photo ? photo.name : 'Subir desde tu galería'}</span>
            </span>
            <span className="grid size-11 flex-none place-items-center rounded-full bg-white">
              <IconPlus size={20} />
            </span>
            <input
              type="file"
              accept="image/*"
              aria-label="Subir foto de portada"
              onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
              className="absolute size-px opacity-0"
            />
          </label>
        </form>
      </div>
    </Screen>
  )
}
