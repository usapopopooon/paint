import { useState, useCallback, useMemo, useRef } from 'react'
import type { Layer, LayerState, LayerId, LayerBlendMode } from '../types'
import { createInitialLayerState, createDrawingLayer } from '../domain'
import type { Drawable } from '@/features/drawable'
import { translateDrawables, flipDrawablesHorizontal } from '@/features/drawable'
import { BACKGROUND_LAYER_ID } from '../constants'
import { generateId } from '@/lib/id'
import { useLocale } from '@/features/i18n'

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
  readonly setLayerName: (id: LayerId, name: string) => void
  readonly setLayerBlendMode: (id: LayerId, blendMode: LayerBlendMode) => void
  readonly moveLayer: (id: LayerId, newIndex: number) => void
  readonly moveLayerUp: (id: LayerId) => boolean
  readonly moveLayerDown: (id: LayerId) => boolean
  readonly translateAllLayers: (offsetX: number, offsetY: number) => void
  readonly flipAllLayersHorizontal: (canvasWidth: number) => void
  readonly addLayer: () => { layerId: LayerId; name: string; index: number }
  readonly deleteLayer: (id: LayerId) => { layer: Layer; index: number } | null
  readonly restoreLayer: (layer: Layer, index: number) => void
  readonly getLayerById: (id: LayerId) => Layer | undefined
  readonly getLayerIndex: (id: LayerId) => number
  readonly drawingLayerCount: number
  readonly setLayers: (layers: readonly Layer[], activeLayerId: LayerId) => void
}

/**
 * レイヤー状態を管理するフック
 * @returns レイヤー操作用のメソッドと現在の状態
 */
export const useLayers = (): UseLayersReturn => {
  const { t } = useLocale()
  const [state, setState] = useState<LayerState>(() =>
    createInitialLayerState(t('layers.defaultName', { number: 1 }))
  )

  // レイヤー番号のカウンター（削除されても番号は増え続ける）
  const layerCounterRef = useRef(1)

  /**
   * アクティブレイヤーを取得
   * @returns 現在アクティブなレイヤー
   */
  const activeLayer = useMemo(
    () => state.layers.find((l) => l.id === state.activeLayerId)!,
    [state.layers, state.activeLayerId]
  )

  /**
   * 描画レイヤーの数（背景レイヤーを除く）
   */
  const drawingLayerCount = useMemo(
    () => state.layers.filter((l) => l.id !== BACKGROUND_LAYER_ID).length,
    [state.layers]
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

  /**
   * レイヤー名を設定
   * @param id - 対象のレイヤーID
   * @param name - 新しいレイヤー名
   */
  const setLayerName = useCallback((id: LayerId, name: string) => {
    setState((prev) => ({
      ...prev,
      layers: prev.layers.map((layer) => (layer.id === id ? { ...layer, name } : layer)),
    }))
  }, [])

  /**
   * レイヤーのブレンドモードを設定
   * @param id - 対象のレイヤーID
   * @param blendMode - 新しいブレンドモード
   */
  const setLayerBlendMode = useCallback((id: LayerId, blendMode: LayerBlendMode) => {
    setState((prev) => ({
      ...prev,
      layers: prev.layers.map((layer) => (layer.id === id ? { ...layer, blendMode } : layer)),
    }))
  }, [])

  /**
   * レイヤーを指定位置に移動
   * @param id - 移動するレイヤーのID
   * @param newIndex - 移動先のインデックス
   */
  const moveLayer = useCallback((id: LayerId, newIndex: number) => {
    // 背景レイヤーは移動不可
    if (id === BACKGROUND_LAYER_ID) return

    setState((prev) => {
      const currentIndex = prev.layers.findIndex((l) => l.id === id)
      if (currentIndex === -1) return prev

      // 背景レイヤーより前には移動できない
      const backgroundIndex = prev.layers.findIndex((l) => l.id === BACKGROUND_LAYER_ID)
      const minIndex = backgroundIndex >= 0 ? backgroundIndex + 1 : 0
      const clampedNewIndex = Math.max(minIndex, Math.min(prev.layers.length - 1, newIndex))

      if (currentIndex === clampedNewIndex) return prev

      const newLayers = [...prev.layers]
      const [movedLayer] = newLayers.splice(currentIndex, 1)
      newLayers.splice(clampedNewIndex, 0, movedLayer)

      return {
        ...prev,
        layers: newLayers,
      }
    })
  }, [])

  /**
   * レイヤーを1つ上に移動（配列の後ろ方向）
   * @param id - 移動するレイヤーのID
   * @returns 移動できた場合はtrue
   */
  const moveLayerUp = useCallback(
    (id: LayerId): boolean => {
      // 背景レイヤーは移動不可
      if (id === BACKGROUND_LAYER_ID) return false

      const currentIndex = state.layers.findIndex((l) => l.id === id)
      if (currentIndex === -1) return false

      // 既に最上位の場合は移動不可
      if (currentIndex >= state.layers.length - 1) return false

      moveLayer(id, currentIndex + 1)
      return true
    },
    [state.layers, moveLayer]
  )

  /**
   * レイヤーを1つ下に移動（配列の前方向）
   * @param id - 移動するレイヤーのID
   * @returns 移動できた場合はtrue
   */
  const moveLayerDown = useCallback(
    (id: LayerId): boolean => {
      // 背景レイヤーは移動不可
      if (id === BACKGROUND_LAYER_ID) return false

      const currentIndex = state.layers.findIndex((l) => l.id === id)
      if (currentIndex === -1) return false

      // 背景レイヤーより前には移動できない
      const backgroundIndex = state.layers.findIndex((l) => l.id === BACKGROUND_LAYER_ID)
      const minIndex = backgroundIndex >= 0 ? backgroundIndex + 1 : 0

      if (currentIndex <= minIndex) return false

      moveLayer(id, currentIndex - 1)
      return true
    },
    [state.layers, moveLayer]
  )

  /**
   * 全レイヤーの描画要素を座標移動
   * @param offsetX - X方向のオフセット
   * @param offsetY - Y方向のオフセット
   */
  const translateAllLayers = useCallback((offsetX: number, offsetY: number) => {
    if (offsetX === 0 && offsetY === 0) return
    setState((prev) => ({
      ...prev,
      layers: prev.layers.map((layer) => ({
        ...layer,
        drawables: translateDrawables(layer.drawables, offsetX, offsetY),
      })),
    }))
  }, [])

  /**
   * 全レイヤーの描画要素を水平方向に反転
   * @param canvasWidth - キャンバスの幅
   */
  const flipAllLayersHorizontal = useCallback((canvasWidth: number) => {
    setState((prev) => ({
      ...prev,
      layers: prev.layers.map((layer) => ({
        ...layer,
        drawables: flipDrawablesHorizontal(layer.drawables, canvasWidth),
      })),
    }))
  }, [])

  /**
   * 新しいレイヤーを追加
   * @returns 追加されたレイヤーの情報
   */
  const addLayer = useCallback(() => {
    layerCounterRef.current += 1
    const nextNumber = layerCounterRef.current
    const layerId = generateId('layer')
    const name = t('layers.defaultName', { number: nextNumber })

    let index = 0
    setState((prev) => {
      const newLayer = createDrawingLayer(layerId, name)
      // 新しいレイヤーは最上位に追加
      const newLayers = [...prev.layers, newLayer]
      index = newLayers.length - 1

      return {
        ...prev,
        layers: newLayers,
        activeLayerId: layerId, // 新しいレイヤーをアクティブに
      }
    })

    return { layerId, name, index }
  }, [t])

  /**
   * レイヤーを削除
   * @param id - 削除するレイヤーのID
   * @returns 削除されたレイヤーと位置、削除できない場合はnull
   */
  const deleteLayer = useCallback(
    (id: LayerId): { layer: Layer; index: number } | null => {
      // 背景レイヤーは削除不可
      if (id === BACKGROUND_LAYER_ID) return null

      // 描画レイヤーが1枚のみの場合は削除不可
      const drawingLayers = state.layers.filter((l) => l.id !== BACKGROUND_LAYER_ID)
      if (drawingLayers.length <= 1) return null

      const index = state.layers.findIndex((l) => l.id === id)
      if (index === -1) return null

      const layer = state.layers[index]
      const result = { layer, index }

      const newLayers = state.layers.filter((l) => l.id !== id)

      // 削除されたレイヤーがアクティブだった場合、別のレイヤーをアクティブに
      let newActiveLayerId = state.activeLayerId
      if (state.activeLayerId === id) {
        // 残っている描画レイヤーの最上位をアクティブに
        const remainingDrawingLayers = newLayers.filter((l) => l.id !== BACKGROUND_LAYER_ID)
        newActiveLayerId = remainingDrawingLayers[remainingDrawingLayers.length - 1]?.id ?? ''
      }

      setState({
        ...state,
        layers: newLayers,
        activeLayerId: newActiveLayerId,
      })

      return result
    },
    [state]
  )

  /**
   * 削除されたレイヤーを復元（Undo用）
   * @param layer - 復元するレイヤー
   * @param index - 挿入位置
   */
  const restoreLayer = useCallback((layer: Layer, index: number) => {
    setState((prev) => {
      const newLayers = [...prev.layers]
      newLayers.splice(index, 0, layer)

      return {
        ...prev,
        layers: newLayers,
        activeLayerId: layer.id,
      }
    })
  }, [])

  /**
   * IDでレイヤーを取得
   * @param id - レイヤーID
   * @returns レイヤー、見つからない場合はundefined
   */
  const getLayerById = useCallback(
    (id: LayerId): Layer | undefined => {
      return state.layers.find((l) => l.id === id)
    },
    [state.layers]
  )

  /**
   * レイヤーのインデックスを取得
   * @param id - レイヤーID
   * @returns インデックス、見つからない場合は-1
   */
  const getLayerIndex = useCallback(
    (id: LayerId): number => {
      return state.layers.findIndex((l) => l.id === id)
    },
    [state.layers]
  )

  /**
   * レイヤー状態を一括で設定（プロジェクト読み込み用）
   * @param layers - 設定するレイヤー配列
   * @param activeLayerId - アクティブレイヤーID
   */
  const setLayers = useCallback((layers: readonly Layer[], activeLayerId: LayerId) => {
    // レイヤー番号カウンターを更新
    const drawingLayers = layers.filter((l) => l.id !== BACKGROUND_LAYER_ID)
    layerCounterRef.current = drawingLayers.length

    setState({
      layers,
      activeLayerId,
    })
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
    setLayerName,
    setLayerBlendMode,
    moveLayer,
    moveLayerUp,
    moveLayerDown,
    translateAllLayers,
    flipAllLayersHorizontal,
    addLayer,
    deleteLayer,
    restoreLayer,
    getLayerById,
    getLayerIndex,
    drawingLayerCount,
    setLayers,
  }
}
