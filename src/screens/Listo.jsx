import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { plural } from '../lib/recipes'
import { useRecipe } from '../lib/useRecipe'
import { Diamond, Plate, RoundButton, Screen, Spinner } from '../components/ui'
import { IconArrowRight, IconCheck, IconClose, IconPencil, IconTimer } from '../components/Icons'
import NotFound from './NotFound'

export default function Listo() {
  const { id } = useParams()
  const { recipe: r, loading, update } = useRecipe(id)
  const [note, setNote] = useState(null)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const marked = useRef(false)

  // Registra que se cocinó (alimenta "Lo último que cocinaste").
  useEffect(() => {
    if (r && !marked.current) {
      marked.current = true
      update({ lastCookedAt: new Date().toISOString() }).catch(() => {})
    }
  }, [r, update])

  if (loading)
    return (
      <Screen>
        <Spinner />
      </Screen>
    )
  if (!r) return <NotFound />

  const value = note ?? r.notes ?? ''
  const changes = r.ingredients.filter((i) => i.mod).length

  const saveNote = async () => {
    setSaving(true)
    try {
      await update({ notes: value.trim() })
      setSaved(true)
    } catch (e) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Screen>
      <div className="flex flex-none items-center gap-3 px-4 pt-[18px]">
        <RoundButton to={`/receta/${id}`} label="Cerrar">
          <IconClose />
        </RoundButton>
        <span className="flex-1 text-[17px] font-extrabold">{r.title}</span>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 pt-3.5 pb-3">
        <div className="relative box-border flex min-h-[250px] flex-none flex-col justify-end gap-2 overflow-hidden rounded-[34px] bg-crema px-[22px] py-6">
          <Diamond className="top-2.5 left-[140px]" size={100} radius={20} alpha={0.4} />
          <Plate src={r.imageUrl} alt={`${r.title} terminado`} size={190} className="-top-[30px] -right-10" />
          <span className="relative grid size-14 place-items-center rounded-full bg-ink text-amarillo">
            <IconCheck size={28} w={3} />
          </span>
          <h1 className="relative m-0 mt-1.5 text-[34px] leading-[1.05] font-extrabold tracking-[-0.02em]">
            ¡Listo!
            <br />
            Buen provecho
          </h1>
          <p className="relative m-0 text-base font-semibold text-[#5B5420]">
            Terminaste {r.steps.length === 1 ? 'el paso' : `los ${r.steps.length} pasos`}.
          </p>
        </div>

        <div className="grid flex-none grid-cols-2 gap-3">
          <div className="flex flex-col gap-2.5 rounded-[26px] bg-menta p-4">
            <span className="grid size-10 place-items-center rounded-full bg-white">
              <IconTimer size={20} />
            </span>
            <span className="flex flex-col">
              <b className="text-[26px] font-extrabold">{r.minutes} min</b>
              <span className="text-[15px] font-semibold text-[#2F4A36]">Tiempo total</span>
            </span>
          </div>
          <div className="flex flex-col gap-2.5 rounded-[26px] bg-durazno p-4">
            <span className="grid size-10 place-items-center rounded-full bg-white">
              <IconPencil size={20} />
            </span>
            <span className="flex flex-col">
              <b className="text-[26px] font-extrabold">{plural(changes, 'cambio', 'cambios')}</b>
              <span className="text-[15px] font-semibold text-[#5C4022]">Tu versión</span>
            </span>
          </div>
        </div>

        <div className="flex flex-none flex-col gap-3 rounded-[30px] bg-lavanda p-[18px]">
          <label htmlFor="pa-fn" className="flex items-center gap-2.5 text-xl font-extrabold">
            <span className="grid size-10 place-items-center rounded-full bg-white">
              <IconPencil w={2.4} extra />
            </span>
            Mis cambios
          </label>
          <p className="m-0 text-[15px] font-semibold text-[#3B3566]">
            ¿Cambiaste algo? Anótalo al tiro para la próxima vez.
          </p>
          <textarea
            id="pa-fn"
            value={value}
            onChange={(e) => {
              setNote(e.target.value)
              setSaved(false)
            }}
            className="box-border min-h-[92px] resize-y rounded-[20px] border-0 bg-white px-4 py-3.5 text-[17px] leading-[1.45] font-medium text-ink"
          />
          <button
            type="button"
            onClick={saveNote}
            disabled={saving}
            className="h-[54px] cursor-pointer rounded-full border-0 bg-ink text-[17px] font-extrabold text-white disabled:opacity-60"
          >
            {saving ? 'Guardando...' : saved ? 'Guardado en tus cambios' : 'Guardar en mis cambios'}
          </button>
        </div>
      </div>

      <div className="pb-safe flex flex-none flex-col gap-1 px-4 pt-2">
        <Link
          to={`/receta/${id}`}
          className="flex h-16 items-center justify-center rounded-full bg-amarillo text-xl font-extrabold text-ink no-underline"
        >
          Volver a la receta
        </Link>
        <Link to="/" className="flex h-12 items-center justify-center gap-1.5 text-base font-bold text-ink no-underline">
          Ir a Mis Recetas
          <IconArrowRight size={16} w={2.4} />
        </Link>
      </div>
    </Screen>
  )
}
