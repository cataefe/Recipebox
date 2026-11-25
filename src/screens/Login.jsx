import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Diamond, Plate, Screen } from '../components/ui'

export default function Login() {
  const [mode, setMode] = useState('signin') // signin | signup
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null) // { type, text }

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setMsg(null)
    const { data, error } =
      mode === 'signin'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } })
    setBusy(false)
    if (error) return setMsg({ type: 'error', text: traducir(error.message) })
    if (mode === 'signup' && !data.session)
      setMsg({ type: 'ok', text: 'Te enviamos un correo para confirmar tu cuenta. Revisa tu bandeja.' })
  }

  const field =
    'box-border h-14 rounded-[18px] border-0 bg-soft px-[18px] text-[17px] font-medium text-ink outline-none focus:ring-2 focus:ring-ink'

  return (
    <Screen>
      <div className="flex-1 overflow-y-auto">
        <div className="relative mx-3 mt-3 box-border h-[300px] overflow-hidden rounded-[34px] bg-crema p-6">
          <Diamond className="top-12 left-[150px]" size={110} radius={22} alpha={0.4} />
          <Diamond className="top-8 right-8" size={70} radius={14} alpha={0.4} />
          <Plate src="/img/pastel-de-choclo.jpg" alt="" size={210} className="-right-16 -bottom-10" />
          <div className="relative mt-24 flex w-[180px] flex-col gap-2">
            <h1 className="m-0 text-[40px] leading-none font-extrabold tracking-[-0.02em]">RecipeBox</h1>
            <p className="m-0 text-[17px] font-semibold text-[#5B5420]">Tus recetas de siempre, con tus cambios.</p>
          </div>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4 px-5 pt-6 pb-10">
          <h2 className="m-0 text-2xl font-extrabold">{mode === 'signin' ? 'Inicia sesión' : 'Crea tu cuenta'}</h2>

          <div className="flex flex-col gap-2">
            <label htmlFor="lg-email" className="text-[17px] font-bold">
              Correo
            </label>
            <input
              id="lg-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={field}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="lg-pass" className="text-[17px] font-bold">
              Contraseña
            </label>
            <input
              id="lg-pass"
              type="password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={field}
            />
          </div>

          {msg && (
            <p
              role="status"
              className={`m-0 rounded-2xl p-4 text-sm font-semibold ${msg.type === 'error' ? 'bg-error-bg text-error' : 'bg-menta text-ink'}`}
            >
              {msg.text}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="h-[62px] cursor-pointer rounded-full border-0 bg-amarillo text-xl font-extrabold text-ink disabled:opacity-60"
          >
            {busy ? 'Un momento...' : mode === 'signin' ? 'Entrar' : 'Crear cuenta'}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin')
              setMsg(null)
            }}
            className="h-12 cursor-pointer border-0 bg-transparent text-base font-bold text-ink"
          >
            {mode === 'signin' ? '¿No tienes cuenta? Créala aquí' : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </form>
      </div>
    </Screen>
  )
}

function traducir(m) {
  if (/invalid login/i.test(m)) return 'Correo o contraseña incorrectos.'
  if (/already registered/i.test(m)) return 'Ese correo ya tiene una cuenta. Inicia sesión.'
  if (/email not confirmed/i.test(m)) return 'Confirma tu correo antes de entrar.'
  if (/at least 6/i.test(m)) return 'La contraseña debe tener al menos 6 caracteres.'
  return m
}
