import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CATEGORY_BG, plural, recipesApi } from '../lib/recipes'
import { useHandsFree, useRecipe } from '../lib/useRecipe'
import { Diamond, Plate, RoundButton, Screen, Spinner, Toggle } from '../components/ui'
import { ClockBadge, IconBack, IconCheck, IconHand, IconPencil, IconPhoto, IconPlay, IconTrash } from '../components/Icons'
import NotFound from './NotFound'

export default function Detalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { recipe: r, loading, update } = useRecipe(id)
  const [uploading, setUploading] = useState(false)
  const [checked, setChecked] = useState({})
  const [hands, setHands] = useHandsFree()
  const [deleting, setDeleting] = useState(false)

  if (loading)
    return (
      <Screen>
        <Spinner />
      </Screen>
    )
  if (!r) return <NotFound />

  const done = r.ingredients.filter((_, i) => checked[i]).length
  const source = [r.source, r.sourceDetail].filter(Boolean).join(' · ')

  const photo = r.heroImageUrl || r.imageUrl

  const changePhoto = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    try {
      const url = await recipesApi.uploadPhoto(file)
      await update({ imageUrl: url, heroImageUrl: '' })
    } catch (err) {
      alert(err.message || 'No se pudo guardar la foto.')
    } finally {
      setUploading(false)
    }
  }

  const remove = async () => {
    if (!window.confirm(`¿Eliminar “${r.title}”? Esta acción no se puede deshacer.`)) return
    setDeleting(true)
    try {
      await recipesApi.remove(r.id)
      navigate('/', { replace: true })
    } catch (e) {
      alert(e.message)
      setDeleting(false)
    }
  }

  return (
    <Screen>
      <div className="flex-1 overflow-y-auto">
        <div
          className={`relative mx-3 mt-3 box-border h-[330px] overflow-hidden rounded-[34px] p-[18px] ${CATEGORY_BG[r.category] ?? 'bg-soft'}`}
        >
          <Diamond className="top-[60px] left-[150px]" size={110} radius={22} alpha={0.35} />
          <Diamond className="top-10 right-[30px]" size={70} radius={14} alpha={0.35} />
          {photo ? (
            <Plate
              src={photo}
              alt={r.title}
              size={230}
              className="-right-[76px] -bottom-12 shadow-[0_18px_30px_-16px_rgba(0,0,0,0.55)]"
            />
          ) : (
            <label className="absolute -right-[76px] -bottom-12 flex size-[230px] cursor-pointer flex-col items-start justify-center gap-2 rounded-full bg-white/55 pl-9 text-ink">
              <span className="grid size-12 place-items-center rounded-full bg-white">
                <IconPhoto />
              </span>
              <span className="text-base font-bold">{uploading ? 'Subiendo...' : 'Agregar foto'}</span>
              <input type="file" accept="image/*" onChange={changePhoto} disabled={uploading} className="absolute size-px opacity-0" />
            </label>
          )}
          <div className="relative flex justify-between">
            <RoundButton to="/" label="Volver a Mis Recetas" white>
              <IconBack />
            </RoundButton>
            <div className="flex gap-2">
              {photo && (
                <label
                  aria-label={uploading ? 'Subiendo foto' : 'Cambiar foto'}
                  className="relative grid size-12 cursor-pointer place-items-center rounded-full bg-white text-ink"
                >
                  {uploading ? <span className="size-5 animate-spin rounded-full border-[3px] border-soft border-t-ink" /> : <IconPhoto size={20} />}
                  <input type="file" accept="image/*" onChange={changePhoto} disabled={uploading} className="absolute size-px opacity-0" />
                </label>
              )}
              <RoundButton onClick={remove} label="Eliminar receta" white>
                <IconTrash />
              </RoundButton>
            </div>
          </div>
          <div className="relative mt-[26px] flex w-[190px] flex-col gap-3">
            <h1 className="m-0 text-[32px] leading-[1.05] font-extrabold tracking-[-0.02em]">{r.title}</h1>
            <div className="flex flex-wrap gap-1.5">
              <span className="inline-flex h-[34px] items-center gap-1.5 rounded-full bg-white px-3 text-base font-semibold">
                <ClockBadge />
                {r.minutes} min
              </span>
              <span className="inline-flex h-[34px] items-center rounded-full bg-white/65 px-3 text-[15px] font-semibold">
                {r.category}
              </span>
            </div>
            {source && <span className="text-[15px] font-semibold text-[#3E4A23]">De: {source}</span>}
            <span className="text-[15px] font-semibold text-[#3E4A23]">
              {plural(r.ingredients.length, 'ingrediente', 'ingredientes')} · {plural(r.steps.length, 'paso', 'pasos')}
            </span>
          </div>
        </div>

        {r.notes && (
          <section className="relative mx-3 mt-3 flex items-start gap-3.5 overflow-hidden rounded-[30px] bg-lavanda px-5 py-[18px]">
            <span className="grid size-12 flex-none place-items-center rounded-full bg-white">
              <IconPencil size={20} extra />
            </span>
            <div className="flex flex-col gap-1">
              <h2 className="m-0 text-xl font-extrabold">Mis cambios</h2>
              <p className="m-0 text-[17px] leading-[1.45] font-medium whitespace-pre-line">{r.notes}</p>
            </div>
          </section>
        )}

        {r.ingredients.length > 0 && (
          <section className="mx-3 mt-3 rounded-[30px] bg-soft-2 px-5 py-[18px]">
            <div className="mb-1.5 flex items-baseline justify-between">
              <h2 className="m-0 text-[22px] font-extrabold">Ingredientes</h2>
              <span className="text-[15px] font-semibold text-muted-2">
                {done} de {r.ingredients.length} listos
              </span>
            </div>
            {r.ingredients.map((it, i) => {
              const on = !!checked[i]
              return (
                <button
                  key={i}
                  type="button"
                  role="checkbox"
                  aria-checked={on}
                  onClick={() => setChecked((c) => ({ ...c, [i]: !c[i] }))}
                  className={`flex min-h-[52px] w-full cursor-pointer items-start gap-3 border-0 bg-transparent py-3 text-left text-ink ${i === 0 ? '' : 'border-t border-solid border-line'}`}
                >
                  <span
                    className={`mt-px grid size-[26px] flex-none place-items-center rounded-full ${on ? 'bg-ink text-white' : 'bg-white shadow-[inset_0_0_0_2px_#C9C9D3]'}`}
                  >
                    {on && <IconCheck w={3.2} />}
                  </span>
                  <span className="flex flex-1 flex-col gap-1.5 text-[17px] leading-[1.35]">
                    <span className={on ? 'text-muted line-through' : 'font-semibold text-ink'}>{it.name}</span>
                    {it.mod && (
                      <span className="inline-flex items-center gap-[5px] self-start rounded-full bg-durazno px-2.5 py-1 text-[13px] font-bold">
                        <IconPencil size={12} w={2.4} />
                        Mi versión: {it.mod}
                      </span>
                    )}
                  </span>
                  {it.qty && (
                    <span className="flex-none pt-0.5 text-[15px] font-semibold whitespace-nowrap text-muted-2">{it.qty}</span>
                  )}
                </button>
              )
            })}
            <button
              type="button"
              onClick={() => setChecked({})}
              className="mt-1 h-11 cursor-pointer rounded-full border-0 bg-white px-[18px] text-[15px] font-bold text-ink"
            >
              Desmarcar todo
            </button>
          </section>
        )}

        {r.steps.length > 0 && (
          <section className="mx-3 mt-3 mb-6 rounded-[30px] bg-soft-2 px-5 py-[18px]">
            <h2 className="m-0 mb-1.5 text-[22px] font-extrabold">Preparación</h2>
            {r.steps.map((s, i) => (
              <div key={i} className={`flex gap-3.5 py-3.5 ${i === 0 ? '' : 'border-t border-solid border-line'}`}>
                <span className="grid size-9 flex-none place-items-center rounded-full bg-ink text-base font-extrabold text-white">
                  {i + 1}
                </span>
                <p className="m-0 mt-1.5 text-[17px] leading-normal font-medium">{s.text}</p>
              </div>
            ))}
          </section>
        )}
      </div>

      <div className="pb-safe flex flex-none flex-col gap-1.5 bg-white px-4 pt-3 shadow-[0_-10px_24px_-18px_rgba(0,0,0,0.35)]">
        {r.steps.length > 0 ? (
          <Link
            to={`/receta/${r.id}/cocinar`}
            className="flex h-[62px] items-center justify-center gap-2.5 rounded-full bg-amarillo text-xl font-extrabold text-ink no-underline"
          >
            <IconPlay />
            Empezar a cocinar
          </Link>
        ) : (
          <p className="m-0 py-3 text-center text-base font-semibold text-muted-2">Agrega pasos para usar el Modo Cocina.</p>
        )}
        <div className="flex min-h-[52px] items-center gap-3 px-1 text-base font-bold">
          <span className="grid size-9 place-items-center rounded-full bg-menta">
            <IconHand />
          </span>
          <span className="flex-1">Control por gestos (Manos libres)</span>
          <Toggle on={hands} onChange={setHands} label="Control por gestos (Manos libres)" />
        </div>
      </div>
      {deleting && <div className="absolute inset-0 bg-white/60" aria-hidden="true" />}
    </Screen>
  )
}
