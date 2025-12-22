import { useState, useCallback, useMemo } from 'react'
import type { Layer, LayerState, LayerId } from '../types'
import { createInitialLayerState } from '../types'
import type { Drawable } from '@/features/drawable'

export type UseLayersReturn = {
  readonly layers: readonly Layer[]
  readonly activeLayer: Layer
  readonly activeLayerId: LayerId
  readonly addDrawable: (drawable: Drawable) => void
  readonly removeLastDrawable: () => void
  readonly setDrawables: (drawables: readonly Drawable[]) => void
  readonly clearActiveLayer: () => void
  readonly setActiveLayer: (id: LayerId) => void
  readonly setLayerOpacity: (id: LayerId, opacity: number) => void
  readonly setLayerVisibility: (id: LayerId, visible: boolean) => void
}

/**
 * Hook for managing layer state
 */
export const useLayers = (): UseLayersReturn => {
  const [state, setState] = useState<LayerState>(createInitialLayerState)

  // Get active layer
  const activeLayer = useMemo(
    () => state.layers.find((l) => l.id === state.activeLayerId)!,
    [state.layers, state.activeLayerId]
  )

  // Add drawable to active layer
  const addDrawable = useCallback((drawable: Drawable) => {
    setState((prev) => ({
      ...prev,
      layers: prev.layers.map((layer) =>
        layer.id === prev.activeLayerId
          ? { ...layer, drawables: [...layer.drawables, drawable] }
          : layer
      ),
    }))
  }, [])

  // Remove last drawable from active layer
  const removeLastDrawable = useCallback(() => {
    setState((prev) => ({
      ...prev,
      layers: prev.layers.map((layer) =>
        layer.id === prev.activeLayerId
          ? { ...layer, drawables: layer.drawables.slice(0, -1) }
          : layer
      ),
    }))
  }, [])

  // Set drawables for active layer
  const setDrawables = useCallback((drawables: readonly Drawable[]) => {
    setState((prev) => ({
      ...prev,
      layers: prev.layers.map((layer) =>
        layer.id === prev.activeLayerId ? { ...layer, drawables } : layer
      ),
    }))
  }, [])

  // Clear active layer
  const clearActiveLayer = useCallback(() => {
    setState((prev) => ({
      ...prev,
      layers: prev.layers.map((layer) =>
        layer.id === prev.activeLayerId ? { ...layer, drawables: [] } : layer
      ),
    }))
  }, [])

  // Switch active layer (for future use)
  const setActiveLayer = useCallback((id: LayerId) => {
    setState((prev) => ({ ...prev, activeLayerId: id }))
  }, [])

  // Set layer opacity (for future use)
  const setLayerOpacity = useCallback((id: LayerId, opacity: number) => {
    setState((prev) => ({
      ...prev,
      layers: prev.layers.map((layer) =>
        layer.id === id ? { ...layer, opacity: Math.max(0, Math.min(1, opacity)) } : layer
      ),
    }))
  }, [])

  // Set layer visibility (for future use)
  const setLayerVisibility = useCallback((id: LayerId, visible: boolean) => {
    setState((prev) => ({
      ...prev,
      layers: prev.layers.map((layer) => (layer.id === id ? { ...layer, visible } : layer)),
    }))
  }, [])

  return {
    layers: state.layers,
    activeLayer,
    activeLayerId: state.activeLayerId,
    addDrawable,
    removeLastDrawable,
    setDrawables,
    clearActiveLayer,
    setActiveLayer,
    setLayerOpacity,
    setLayerVisibility,
  }
}
