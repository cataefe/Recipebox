import { useCallback, useEffect, useState } from 'react'
import { recipesApi } from './recipes'

export function useRecipe(id) {
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let alive = true
    setLoading(true)
    recipesApi
      .get(id)
      .then((r) => alive && setRecipe(r))
      .catch((e) => alive && setError(e))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [id])

  const update = useCallback(
    async (patch) => {
      const next = await recipesApi.update(id, patch)
      setRecipe(next)
      return next
    },
    [id],
  )

  return { recipe, loading, error, update }
}

/** Preferencia "Manos libres", guardada en el dispositivo. */
const HANDS_KEY = 'recipebox:handsfree'
export function useHandsFree() {
  const [on, setOn] = useState(() => {
    try {
      return localStorage.getItem(HANDS_KEY) !== '0'
    } catch {
      return true
    }
  })
  const set = (v) => {
    setOn(v)
    try {
      localStorage.setItem(HANDS_KEY, v ? '1' : '0')
    } catch {
      /* ignorar */
    }
  }
  return [on, set]
}
