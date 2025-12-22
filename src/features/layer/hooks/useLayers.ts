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
 * レイヤー状態を管理するフック
 */
export const useLayers = (): UseLayersReturn => {
  const [state, setState] = useState<LayerState>(createInitialLayerState)

  // アクティブレイヤーを取得
  const activeLayer = useMemo(
    () => state.layers.find((l) => l.id === state.activeLayerId)!,
    [state.layers, state.activeLayerId]
  )

  // アクティブレイヤーにDrawableを追加
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

  // アクティブレイヤーから最後のDrawableを削除
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

  // アクティブレイヤーのDrawablesを設定
  const setDrawables = useCallback((drawables: readonly Drawable[]) => {
    setState((prev) => ({
      ...prev,
      layers: prev.layers.map((layer) =>
        layer.id === prev.activeLayerId ? { ...layer, drawables } : layer
      ),
    }))
  }, [])

  // アクティブレイヤーをクリア
  const clearActiveLayer = useCallback(() => {
    setState((prev) => ({
      ...prev,
      layers: prev.layers.map((layer) =>
        layer.id === prev.activeLayerId ? { ...layer, drawables: [] } : layer
      ),
    }))
  }, [])

  // アクティブレイヤーを切り替え（将来の拡張用）
  const setActiveLayer = useCallback((id: LayerId) => {
    setState((prev) => ({ ...prev, activeLayerId: id }))
  }, [])

  // レイヤーの不透明度を設定（将来の拡張用）
  const setLayerOpacity = useCallback((id: LayerId, opacity: number) => {
    setState((prev) => ({
      ...prev,
      layers: prev.layers.map((layer) =>
        layer.id === id ? { ...layer, opacity: Math.max(0, Math.min(1, opacity)) } : layer
      ),
    }))
  }, [])

  // レイヤーの表示/非表示を設定（将来の拡張用）
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
