import { useState, useCallback, useMemo } from 'react'
import type { Layer, LayerState, LayerId } from '../types'
import { createInitialLayerState } from '../domain'
import type { Drawable } from '@/features/drawable'

export type UseLayersReturn = {
  readonly layers: readonly Layer[]
  readonly activeLayer: Layer
  readonly activeLayerId: LayerId
  readonly addDrawable: (drawable: Drawable) => void
  readonly addDrawableToLayer: (drawable: Drawable, layerId: LayerId) => void
  readonly removeLastDrawable: () => void
  readonly removeLastDrawableFromLayer: (layerId: LayerId) => void
  readonly setDrawables: (drawables: readonly Drawable[]) => void
  readonly setDrawablesToLayer: (drawables: readonly Drawable[], layerId: LayerId) => void
  readonly clearActiveLayer: () => void
  readonly clearLayer: (layerId: LayerId) => void
  readonly setActiveLayer: (id: LayerId) => void
  readonly setLayerOpacity: (id: LayerId, opacity: number) => void
  readonly setLayerVisibility: (id: LayerId, isVisible: boolean) => void
}

/**
 * レイヤー状態を管理するフック
 * @returns レイヤー操作用のメソッドと現在の状態
 */
export const useLayers = (): UseLayersReturn => {
  const [state, setState] = useState<LayerState>(createInitialLayerState)

  /**
   * アクティブレイヤーを取得
   * @returns 現在アクティブなレイヤー
   */
  const activeLayer = useMemo(
    () => state.layers.find((l) => l.id === state.activeLayerId)!,
    [state.layers, state.activeLayerId]
  )

  /**
   * アクティブレイヤーにDrawableを追加
   * @param drawable - 追加するDrawable
   */
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

  /**
   * 指定レイヤーにDrawableを追加
   * @param drawable - 追加するDrawable
   * @param layerId - 対象レイヤーID
   */
  const addDrawableToLayer = useCallback((drawable: Drawable, layerId: LayerId) => {
    setState((prev) => ({
      ...prev,
      layers: prev.layers.map((layer) =>
        layer.id === layerId ? { ...layer, drawables: [...layer.drawables, drawable] } : layer
      ),
    }))
  }, [])

  /** アクティブレイヤーから最後のDrawableを削除 */
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

  /**
   * 指定レイヤーから最後のDrawableを削除
   * @param layerId - 対象レイヤーID
   */
  const removeLastDrawableFromLayer = useCallback((layerId: LayerId) => {
    setState((prev) => ({
      ...prev,
      layers: prev.layers.map((layer) =>
        layer.id === layerId ? { ...layer, drawables: layer.drawables.slice(0, -1) } : layer
      ),
    }))
  }, [])

  /**
   * アクティブレイヤーのDrawablesを設定
   * @param drawables - 設定するDrawable配列
   */
  const setDrawables = useCallback((drawables: readonly Drawable[]) => {
    setState((prev) => ({
      ...prev,
      layers: prev.layers.map((layer) =>
        layer.id === prev.activeLayerId ? { ...layer, drawables } : layer
      ),
    }))
  }, [])

  /**
   * 指定レイヤーのDrawablesを設定
   * @param drawables - 設定するDrawable配列
   * @param layerId - 対象レイヤーID
   */
  const setDrawablesToLayer = useCallback((drawables: readonly Drawable[], layerId: LayerId) => {
    setState((prev) => ({
      ...prev,
      layers: prev.layers.map((layer) => (layer.id === layerId ? { ...layer, drawables } : layer)),
    }))
  }, [])

  /** アクティブレイヤーをクリア */
  const clearActiveLayer = useCallback(() => {
    setState((prev) => ({
      ...prev,
      layers: prev.layers.map((layer) =>
        layer.id === prev.activeLayerId ? { ...layer, drawables: [] } : layer
      ),
    }))
  }, [])

  /**
   * 指定レイヤーをクリア
   * @param layerId - 対象レイヤーID
   */
  const clearLayer = useCallback((layerId: LayerId) => {
    setState((prev) => ({
      ...prev,
      layers: prev.layers.map((layer) =>
        layer.id === layerId ? { ...layer, drawables: [] } : layer
      ),
    }))
  }, [])

  /**
   * アクティブレイヤーを切り替え
   * @param id - 切り替え先のレイヤーID
   */
  const setActiveLayer = useCallback((id: LayerId) => {
    setState((prev) => ({ ...prev, activeLayerId: id }))
  }, [])

  /**
   * レイヤーの不透明度を設定
   * @param id - 対象のレイヤーID
   * @param opacity - 不透明度（0〜1）
   */
  const setLayerOpacity = useCallback((id: LayerId, opacity: number) => {
    setState((prev) => ({
      ...prev,
      layers: prev.layers.map((layer) =>
        layer.id === id ? { ...layer, opacity: Math.max(0, Math.min(1, opacity)) } : layer
      ),
    }))
  }, [])

  /**
   * レイヤーの表示/非表示を設定
   * @param id - 対象のレイヤーID
   * @param isVisible - 表示するかどうか
   */
  const setLayerVisibility = useCallback((id: LayerId, isVisible: boolean) => {
    setState((prev) => ({
      ...prev,
      layers: prev.layers.map((layer) => (layer.id === id ? { ...layer, isVisible } : layer)),
    }))
  }, [])

  return {
    layers: state.layers,
    activeLayer,
    activeLayerId: state.activeLayerId,
    addDrawable,
    addDrawableToLayer,
    removeLastDrawable,
    removeLastDrawableFromLayer,
    setDrawables,
    setDrawablesToLayer,
    clearActiveLayer,
    clearLayer,
    setActiveLayer,
    setLayerOpacity,
    setLayerVisibility,
  }
}
