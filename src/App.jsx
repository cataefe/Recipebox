import { Route, Routes } from 'react-router-dom'
import { useAuth } from './lib/auth'
import { isSupabaseEnabled } from './lib/supabase'
import { Screen, Spinner } from './components/ui'
import MisRecetas from './screens/MisRecetas'
import NuevaReceta from './screens/NuevaReceta'
import Detalle from './screens/Detalle'
import Cocina from './screens/Cocina'
import Listo from './screens/Listo'
import Login from './screens/Login'
import NotFound from './screens/NotFound'

export default function App() {
  const { session, loading } = useAuth()

  if (loading)
    return (
      <Screen>
        <Spinner />
      </Screen>
    )

  // Con Supabase configurado, la app requiere sesión.
  if (isSupabaseEnabled && !session) return <Login />

  return (
    <Routes>
      <Route path="/" element={<MisRecetas />} />
      <Route path="/nueva" element={<NuevaReceta />} />
      <Route path="/receta/:id" element={<Detalle />} />
      <Route path="/receta/:id/cocinar" element={<Cocina />} />
      <Route path="/receta/:id/listo" element={<Listo />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
