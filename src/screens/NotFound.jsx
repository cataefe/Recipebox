import { Link } from 'react-router-dom'
import { Screen } from '../components/ui'

export default function NotFound() {
  return (
    <Screen>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
        <h1 className="m-0 text-[28px] font-extrabold">No encontramos esta receta</h1>
        <p className="m-0 text-base font-medium text-muted-2">Puede que se haya eliminado.</p>
        <Link
          to="/"
          className="flex h-14 items-center rounded-full bg-amarillo px-6 text-lg font-extrabold text-ink no-underline"
        >
          Ir a Mis Recetas
        </Link>
      </div>
    </Screen>
  )
}
