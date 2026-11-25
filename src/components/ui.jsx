import { Link } from 'react-router-dom'

/** Contenedor de pantalla: ancho de teléfono, centrado en escritorio. */
export function Screen({ children, className = '' }) {
  return (
    <div className={`relative mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-white text-ink ${className}`}>
      {children}
    </div>
  )
}

/** Botón circular de 48 px (volver, cerrar, eliminar...). */
export function RoundButton({ to, onClick, label, white = false, children }) {
  const cls = `grid size-12 flex-none place-items-center rounded-full text-ink ${white ? 'bg-white' : 'bg-soft'} cursor-pointer border-0`
  if (to)
    return (
      <Link to={to} aria-label={label} className={cls}>
        {children}
      </Link>
    )
  return (
    <button type="button" onClick={onClick} aria-label={label} className={cls}>
      {children}
    </button>
  )
}

/** Rombo decorativo blanco translúcido de las tarjetas pastel. */
export function Diamond({ className = '', size = 90, radius = 18, alpha = 0.32 }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute rotate-45 ${className}`}
      style={{ width: size, height: size, borderRadius: radius, background: `rgba(255,255,255,${alpha})` }}
    />
  )
}

/** Foto circular que sale de la tarjeta. */
export function Plate({ src, alt, className = '', size = 176 }) {
  if (!src) return null
  return (
    <img
      src={src}
      alt={alt}
      className={`absolute rounded-full object-cover shadow-[0_14px_24px_-14px_rgba(0,0,0,0.55)] ${className}`}
      style={{ width: size, height: size }}
    />
  )
}

export function Spinner() {
  return (
    <div className="grid flex-1 place-items-center" role="status" aria-label="Cargando">
      <span className="size-10 animate-spin rounded-full border-4 border-soft border-t-amarillo" />
    </div>
  )
}

export function Toggle({ on, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative h-8 w-[54px] flex-none cursor-pointer rounded-full border-0 p-0 ${on ? 'bg-ink' : 'bg-check'}`}
    >
      <span
        className={`absolute top-[3px] size-[26px] rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.3)] transition-all ${on ? 'left-[25px] bg-amarillo' : 'left-[3px] bg-white'}`}
      />
    </button>
  )
}
