import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CATEGORY_BG } from '../lib/recipes'
import { useHandsFree, useRecipe } from '../lib/useRecipe'
import { Diamond, RoundButton, Screen, Spinner } from '../components/ui'
import { IconArrowRight, IconBack, IconCheck, IconClose, IconPencil, IconTimer } from '../components/Icons'
import NotFound from './NotFound'

const SIZES = [26, 30, 36]
const fmt = (ms) => {
  const x = Math.ceil(ms / 1000)
  return `${Math.floor(x / 60)}:${String(x % 60).padStart(2, '0')}`
}

/** Mantiene la pantalla encendida mientras se cocina (Screen Wake Lock API). */
function useWakeLock() {
  const [active, setActive] = useState(false)
  useEffect(() => {
    if (!('wakeLock' in navigator)) return
    let lock = null
    let cancelled = false
    const request = async () => {
      try {
        lock = await navigator.wakeLock.request('screen')
        if (cancelled) return lock.release()
        setActive(true)
        lock.addEventListener('release', () => setActive(false))
      } catch {
        setActive(false)
      }
    }
    const onVisible = () => document.visibilityState === 'visible' && request()
    request()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisible)
      lock?.release()
    }
  }, [])
  return active
}

function beep() {
  try {
    navigator.vibrate?.([300, 150, 300, 150, 300])
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    ;[0, 0.35, 0.7].forEach((t) => {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.frequency.value = 880
      g.gain.setValueAtTime(0.25, ctx.currentTime + t)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.3)
      o.connect(g).connect(ctx.destination)
      o.start(ctx.currentTime + t)
      o.stop(ctx.currentTime + t + 0.3)
    })
  } catch {
    /* sin audio */
  }
}

export default function Cocina() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { recipe: r, loading } = useRecipe(id)
  const [hands] = useHandsFree()
  const screenOn = useWakeLock()
  const [step, setStep] = useState(1)
  const [size, setSize] = useState(0)
  const [sheet, setSheet] = useState(false)
  const [timer, setTimer] = useState(null) // { step, end }
  const [now, setNow] = useState(Date.now())
  const rang = useRef(false)
  const touch = useRef(null)

  const total = r?.steps.length ?? 0
  const go = (n) => setStep(Math.min(total, Math.max(1, n)))
  const finish = () => navigate(`/receta/${id}/listo`)

  useEffect(() => {
    if (!timer) return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [timer])

  useEffect(() => {
    if (timer && now >= timer.end && !rang.current) {
      rang.current = true
      beep()
    }
  }, [now, timer])

  // Teclado en escritorio: flechas para avanzar o retroceder.
  useEffect(() => {
    const onKey = (e) => {
      if (sheet || e.target.closest?.('input, textarea')) return
      if (e.key === 'ArrowRight') step < total ? go(step + 1) : finish()
      if (e.key === 'ArrowLeft') go(step - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (loading)
    return (
      <Screen>
        <Spinner />
      </Screen>
    )
  if (!r || total === 0) return <NotFound />

  const st = r.steps[step - 1]
  const left = timer ? Math.max(0, timer.end - now) : 0
  const mine = timer && timer.step === step
  const isLast = step === total
  const uses = (st.uses ?? []).map((i) => r.ingredients[i]).filter(Boolean)

  const toggleTimer = () => {
    rang.current = false
    setNow(Date.now())
    setTimer(mine ? null : { step, end: Date.now() + st.minutes * 60000 })
  }

  // Manos libres: desliza a la izquierda para avanzar, a la derecha para volver.
  const onTouchStart = (e) => {
    if (!hands) return
    const t = e.touches[0]
    touch.current = { x: t.clientX, y: t.clientY }
  }
  const onTouchEnd = (e) => {
    if (!hands || !touch.current || sheet) return
    const t = e.changedTouches[0]
    const dx = t.clientX - touch.current.x
    const dy = t.clientY - touch.current.y
    touch.current = null
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return
    if (dx < 0) isLast ? finish() : go(step + 1)
    else go(step - 1)
  }

  return (
    <Screen>
      <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} className="flex min-h-0 flex-1 flex-col">
        <div className="flex flex-none items-center gap-3 px-4 pt-[18px]">
          <RoundButton to={`/receta/${id}`} label="Salir del modo cocina">
            <IconClose />
          </RoundButton>
          <div className="flex flex-1 flex-col gap-1.5">
            <span className="text-[17px] font-extrabold">
              Paso {step} <span className="font-semibold text-muted">de {total}</span>
            </span>
            <div className="flex gap-1" aria-hidden="true">
              {r.steps.map((_, i) => (
                <span key={i} className={`h-2 flex-1 rounded ${i < step ? 'bg-ink' : 'bg-line'}`} />
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSize((s) => (s + 1) % SIZES.length)}
            aria-label="Cambiar tamaño de letra"
            className="size-12 flex-none cursor-pointer rounded-full border-0 bg-soft text-lg font-extrabold text-ink"
          >
            Aa
          </button>
        </div>

        <div className="flex flex-none items-center gap-3.5 px-5 pt-3 text-sm font-semibold text-muted-2">
          {hands && (
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-ok" />
              Manos libres activo
            </span>
          )}
          {screenOn && <span>Pantalla encendida</span>}
          {timer && !mine && (
            <span className="ml-auto rounded-full bg-ink px-3 py-1 font-bold text-white tabular-nums">{fmt(left)}</span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 pt-4 pb-3">
          <div
            className={`relative box-border flex min-h-[230px] items-center overflow-hidden rounded-[34px] px-[22px] py-[26px] ${CATEGORY_BG[r.category] ?? 'bg-lima'}`}
          >
            <Diamond className="-top-5 -right-5" size={120} radius={24} alpha={0.35} />
            <Diamond className="right-[60px] -bottom-10" size={90} radius={18} alpha={0.35} />
            <p
              className="relative m-0 leading-[1.28] font-bold tracking-[-0.01em]"
              style={{ fontSize: SIZES[size] }}
              aria-live="polite"
            >
              {st.text}
            </p>
          </div>

          {st.mod && (
            <div className="flex items-center gap-3 rounded-[26px] bg-durazno px-4 py-3.5 text-lg leading-[1.3] font-bold">
              <span className="grid size-10 flex-none place-items-center rounded-full bg-white">
                <IconPencil w={2.4} />
              </span>
              <span>Tu versión: {st.mod}</span>
            </div>
          )}

          {st.minutes > 0 && (
            <button
              type="button"
              onClick={toggleTimer}
              className={`flex cursor-pointer items-center gap-3 rounded-[26px] border-0 py-3.5 pr-3.5 pl-4 text-left text-ink ${mine ? 'bg-lavanda-2' : 'bg-lavanda'}`}
            >
              <span className="grid size-12 flex-none place-items-center rounded-full bg-white">
                <IconTimer />
              </span>
              <span className="flex flex-1 flex-col items-start">
                <span className="text-sm font-semibold">
                  {mine ? (left > 0 ? 'Temporizador en curso' : '¡Tiempo cumplido!') : 'Temporizador'}
                </span>
                <span className="text-[28px] leading-[1.1] font-extrabold tabular-nums">
                  {mine ? fmt(left) : `${st.minutes}:00`}
                </span>
              </span>
              <span className="flex h-11 flex-none items-center rounded-full bg-white px-[18px] text-base font-extrabold">
                {mine ? 'Detener' : 'Iniciar'}
              </span>
            </button>
          )}

          <div className="flex flex-col gap-2.5 rounded-[26px] bg-soft-2 px-[18px] py-4">
            <div className="flex items-center justify-between">
              <span className="text-base font-extrabold">Usas en este paso</span>
              <button
                type="button"
                onClick={() => setSheet(true)}
                className="h-10 cursor-pointer rounded-full border-0 bg-white px-3.5 text-sm font-bold text-ink"
              >
                Ver todos
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {uses.map((u, i) => (
                <span
                  key={i}
                  className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full bg-white px-3.5 text-base font-bold"
                >
                  {u.name}
                  {u.qty && <span className="font-semibold text-muted">{u.qty}</span>}
                </span>
              ))}
              {uses.length === 0 && (
                <span className="text-base font-medium text-muted-2">Nada nuevo, sigue con lo que tienes.</span>
              )}
            </div>
          </div>
        </div>

        <div className="pb-safe flex flex-none flex-col gap-2.5 px-4 pt-2">
          {!isLast && (
            <span className="truncate px-1 text-[15px] font-semibold text-muted-2">
              Luego: {r.steps[step].text}
            </span>
          )}
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => go(step - 1)}
              disabled={step === 1}
              aria-label="Paso anterior"
              className="grid size-[72px] flex-none cursor-pointer place-items-center rounded-full border-0 bg-ink text-white disabled:cursor-default disabled:opacity-30"
            >
              <IconBack size={26} />
            </button>
            {isLast ? (
              <Link
                to={`/receta/${id}/listo`}
                className="flex h-[72px] flex-1 items-center justify-center gap-2.5 rounded-full bg-amarillo text-[21px] font-extrabold text-ink no-underline"
              >
                Terminar
                <IconCheck size={22} w={2.6} />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => go(step + 1)}
                className="flex h-[72px] flex-1 cursor-pointer items-center justify-center gap-2.5 rounded-full border-0 bg-amarillo text-[21px] font-extrabold text-ink"
              >
                Siguiente paso
                <IconArrowRight />
              </button>
            )}
          </div>
        </div>
      </div>

      {sheet && (
        <div className="absolute inset-0 flex items-end bg-ink/45" onClick={() => setSheet(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Ingredientes"
            onClick={(e) => e.stopPropagation()}
            className="pb-safe box-border flex max-h-[76%] w-full flex-col overflow-y-auto rounded-t-[34px] bg-white px-5 pt-6"
          >
            <h3 className="m-0 mb-2 text-2xl font-extrabold">Ingredientes</h3>
            {r.ingredients.map((it, i) => (
              <div
                key={i}
                className={`flex items-start gap-2.5 py-3 text-lg leading-[1.35] ${i === 0 ? '' : 'border-t border-solid border-line'}`}
              >
                <span className="flex flex-1 flex-col gap-1">
                  <span className={(st.uses ?? []).includes(i) ? 'font-extrabold' : 'font-medium'}>{it.name}</span>
                  {it.mod && (
                    <span className="self-start rounded-full bg-durazno px-2.5 py-[3px] text-sm font-bold">
                      Mi versión: {it.mod}
                    </span>
                  )}
                </span>
                <span className="flex-none text-base font-semibold whitespace-nowrap text-muted-2">{it.qty}</span>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setSheet(false)}
              autoFocus
              className="mt-2.5 h-[60px] flex-none cursor-pointer rounded-full border-0 bg-ink text-lg font-extrabold text-white"
            >
              Volver al paso
            </button>
          </div>
        </div>
      )}
    </Screen>
  )
}
