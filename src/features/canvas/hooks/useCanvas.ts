import { useCallback, useMemo } from 'react'
import type { ToolConfig } from '../../tools/types'
import type { Layer } from '@/features/layer'
import type { Drawable, Point } from '@/features/drawable'
import { useLayers, BACKGROUND_LAYER_ID } from '@/features/layer'
import { stabilizeStroke, stabilizationToParams } from '@/features/stabilization'
import { useCanvasHistory } from './useCanvasHistory'
import { useDrawing } from './useDrawing'

/**
 * キャンバスリサイズundo/redo用のコールバック
 */
export type OnCanvasResizeCallback = (
  width: number,
  height: number,
  offsetX: number,
  offsetY: number
) => void

/**
 * useCanvasフックのオプション
 */
export type UseCanvasOptions = {
  /** キャンバスリサイズundo/redo時のコールバック */
  readonly onCanvasResize?: OnCanvasResizeCallback
  /** 手ぶれ補正の強度（0-1） */
  readonly stabilization?: number
}

/**
 * Canvas統合hook
 *
 * 状態の単一責任:
 * - useLayers: drawablesの状態を管理（single source of truth）
 * - useCanvasHistory: undo/redo履歴のみを管理
 * - useDrawing: 描画中のストローク管理
 * @param options - オプション
 * @returns キャンバス操作用のメソッドと現在の状態
 */
export const useCanvas = (options?: UseCanvasOptions) => {
  const { onCanvasResize, stabilization = 0 } = options ?? {}
  const layerManager = useLayers()
  const history = useCanvasHistory()

  /**
   * Drawable完成時のハンドラ: レイヤーに追加 + 履歴に記録
   * stabilizationが有効な場合、ガウシアンフィルタを適用
   * @param drawable - 完成したDrawable
   */
  const handleDrawableComplete = useCallback(
    (drawable: Drawable) => {
      let finalDrawable = drawable
      // 手ぶれ補正が有効な場合、ガウシアンフィルタを適用
      if (stabilization > 0 && drawable.type === 'stroke') {
        const { size, sigma } = stabilizationToParams(stabilization)
        const smoothedPoints = stabilizeStroke(drawable.points, size, sigma)
        finalDrawable = { ...drawable, points: smoothedPoints }
      }
      layerManager.addDrawable(finalDrawable)
      history.addDrawable(finalDrawable, layerManager.activeLayerId)
    },
    [layerManager, history, stabilization]
  )

  const drawing = useDrawing(handleDrawableComplete)

  /** アクティブレイヤーのdrawables（描画中含む） */
  const allDrawables = useMemo(
    (): readonly Drawable[] =>
      drawing.currentStroke
        ? [...layerManager.activeLayer.drawables, drawing.currentStroke]
        : layerManager.activeLayer.drawables,
    [layerManager, drawing]
  )

  /**
   * レンダリング用レイヤー（描画中のストローク含む）
   * 描画中はリアルタイムでガウシアンフィルタを適用（終端は遅れて平滑化される）
   */
  const allLayers = useMemo((): readonly Layer[] => {
    if (!drawing.currentStroke) return layerManager.layers

    // 描画中のストロークに手ぶれ補正を適用
    let displayStroke = drawing.currentStroke
    if (stabilization > 0 && drawing.currentStroke.type === 'stroke') {
      const { size, sigma } = stabilizationToParams(stabilization)
      const smoothedPoints = stabilizeStroke(drawing.currentStroke.points, size, sigma)
      displayStroke = { ...drawing.currentStroke, points: smoothedPoints }
    }

    return layerManager.layers.map((layer) =>
      layer.id === layerManager.activeLayerId
        ? { ...layer, drawables: [...layer.drawables, displayStroke] }
        : layer
    )
  }, [layerManager, drawing, stabilization])

  /**
   * ストロークを開始
   * @param point - 開始位置
   * @param config - ツール設定
   */
  const startStroke = useCallback(
    (point: Point, config: ToolConfig) => {
      drawing.startStroke(point, config)
    },
    [drawing]
  )

  /** Undo: アクション種別に応じてレイヤーを復元 + 履歴を戻す */
  const undo = useCallback(async () => {
    const action = await history.peekUndo()
    if (action) {
      const targetLayerId = action.layerId
      if (action.type === 'drawable:added') {
        if (targetLayerId) {
          layerManager.removeLastDrawableFromLayer(targetLayerId)
        } else {
          layerManager.removeLastDrawable()
        }
      } else if (action.type === 'drawables:cleared') {
        // クリア前の状態を復元
        if (targetLayerId) {
          layerManager.setDrawablesToLayer(action.previousDrawables, targetLayerId)
        } else {
          layerManager.setDrawables(action.previousDrawables)
        }
      } else if (action.type === 'layer:visibility-changed' && targetLayerId) {
        // 可視性を元に戻す
        layerManager.setLayerVisibility(targetLayerId, action.previousValue)
      } else if (action.type === 'layer:opacity-changed' && targetLayerId) {
        // 不透明度を元に戻す
        layerManager.setLayerOpacity(targetLayerId, action.previousValue)
      } else if (action.type === 'layer:renamed' && targetLayerId) {
        // レイヤー名を元に戻す
        layerManager.setLayerName(targetLayerId, action.previousName)
      } else if (action.type === 'canvas:resized') {
        // キャンバスリサイズを元に戻す
        const reverseOffsetX = -action.offsetX
        const reverseOffsetY = -action.offsetY
        layerManager.translateAllLayers(reverseOffsetX, reverseOffsetY)
        onCanvasResize?.(
          action.previousWidth,
          action.previousHeight,
          reverseOffsetX,
          reverseOffsetY
        )
      } else if (action.type === 'canvas:flipped') {
        // 反転を元に戻す（各レイヤーのdrawablesを復元）
        for (const snapshot of action.layerSnapshots) {
          layerManager.setDrawablesToLayer(snapshot.previousDrawables, snapshot.layerId)
        }
      } else if (action.type === 'layer:created' && targetLayerId) {
        // レイヤー作成を取り消す（レイヤーを削除）
        layerManager.deleteLayer(targetLayerId)
      } else if (action.type === 'layer:deleted') {
        // レイヤー削除を取り消す（レイヤーを復元）
        const snapshot = action.layerSnapshot
        const layer = {
          id: snapshot.id,
          name: snapshot.name,
          type: 'drawing' as const,
          isVisible: snapshot.isVisible,
          isLocked: snapshot.isLocked,
          opacity: snapshot.opacity,
          blendMode: snapshot.blendMode,
          drawables: snapshot.drawables,
        }
        layerManager.restoreLayer(layer, action.index)
      }
      await history.undo()
    }
  }, [history, layerManager, onCanvasResize])

  /** Redo: アクション種別に応じてレイヤーを更新 + 履歴を進める */
  const redo = useCallback(async () => {
    const action = await history.peekRedo()
    if (action) {
      const targetLayerId = action.layerId
      if (action.type === 'drawable:added') {
        if (targetLayerId) {
          layerManager.addDrawableToLayer(action.drawable, targetLayerId)
        } else {
          layerManager.addDrawable(action.drawable)
        }
      } else if (action.type === 'drawables:cleared') {
        // クリア操作を再実行
        if (targetLayerId) {
          layerManager.clearLayer(targetLayerId)
        } else {
          layerManager.clearActiveLayer()
        }
      } else if (action.type === 'layer:visibility-changed' && targetLayerId) {
        // 可視性を再適用
        layerManager.setLayerVisibility(targetLayerId, action.newValue)
      } else if (action.type === 'layer:opacity-changed' && targetLayerId) {
        // 不透明度を再適用
        layerManager.setLayerOpacity(targetLayerId, action.newValue)
      } else if (action.type === 'layer:renamed' && targetLayerId) {
        // レイヤー名を再適用
        layerManager.setLayerName(targetLayerId, action.newName)
      } else if (action.type === 'canvas:resized') {
        // キャンバスリサイズを再適用
        layerManager.translateAllLayers(action.offsetX, action.offsetY)
        onCanvasResize?.(action.newWidth, action.newHeight, action.offsetX, action.offsetY)
      } else if (action.type === 'canvas:flipped') {
        // 反転を再適用
        layerManager.flipAllLayersHorizontal(action.canvasWidth)
      } else if (action.type === 'layer:created' && targetLayerId) {
        // レイヤー作成を再実行
        const layer = {
          id: targetLayerId,
          name: action.name,
          type: 'drawing' as const,
          isVisible: true,
          isLocked: false,
          opacity: 1,
          blendMode: 'normal' as const,
          drawables: [],
        }
        layerManager.restoreLayer(layer, action.index)
      } else if (action.type === 'layer:deleted' && targetLayerId) {
        // レイヤー削除を再実行
        layerManager.deleteLayer(targetLayerId)
      }
      await history.redo()
    }
  }, [history, layerManager, onCanvasResize])

  /** Clear: レイヤーをクリア + 履歴に記録 */
  const clear = useCallback(() => {
    const previousDrawables = layerManager.activeLayer.drawables
    const targetLayerId = layerManager.activeLayerId
    layerManager.clearActiveLayer()
    history.recordClear(previousDrawables, targetLayerId)
  }, [layerManager, history])

  /**
   * レイヤーの可視性を変更 + 履歴に記録
   * @param layerId - 対象レイヤーID
   * @param isVisible - 新しい可視性
   */
  const setLayerVisibility = useCallback(
    (layerId: string, isVisible: boolean) => {
      const layer = layerManager.layers.find((l) => l.id === layerId)
      if (!layer || layer.isVisible === isVisible) return

      const previousValue = layer.isVisible
      layerManager.setLayerVisibility(layerId, isVisible)
      history.recordLayerVisibilityChange(layerId, previousValue, isVisible)
    },
    [layerManager, history]
  )

  /**
   * レイヤーの不透明度を変更 + 履歴に記録
   * @param layerId - 対象レイヤーID
   * @param opacity - 新しい不透明度
   */
  const setLayerOpacity = useCallback(
    (layerId: string, opacity: number) => {
      const layer = layerManager.layers.find((l) => l.id === layerId)
      if (!layer || layer.opacity === opacity) return

      const previousValue = layer.opacity
      layerManager.setLayerOpacity(layerId, opacity)
      history.recordLayerOpacityChange(layerId, previousValue, opacity)
    },
    [layerManager, history]
  )

  /**
   * レイヤー名を変更 + 履歴に記録
   * @param layerId - 対象レイヤーID
   * @param name - 新しいレイヤー名
   */
  const setLayerName = useCallback(
    (layerId: string, name: string) => {
      const layer = layerManager.layers.find((l) => l.id === layerId)
      if (!layer || layer.name === name) return

      const previousName = layer.name
      layerManager.setLayerName(layerId, name)
      history.recordLayerNameChange(layerId, previousName, name)
    },
    [layerManager, history]
  )

  /**
   * キャンバスを水平方向に反転 + 履歴に記録
   * @param canvasWidth - キャンバスの幅
   */
  const flipHorizontal = useCallback(
    (canvasWidth: number) => {
      // 各レイヤーの反転前のdrawablesを保存
      const layerSnapshots = layerManager.layers.map((layer) => ({
        layerId: layer.id,
        previousDrawables: layer.drawables,
      }))

      // 全レイヤーを反転
      layerManager.flipAllLayersHorizontal(canvasWidth)

      // 履歴に記録
      history.recordCanvasFlip('horizontal', canvasWidth, layerSnapshots)
    },
    [layerManager, history]
  )

  /**
   * レイヤーを追加 + 履歴に記録
   * @returns 追加されたレイヤー情報
   */
  const addLayer = useCallback(() => {
    const { layerId, name, index } = layerManager.addLayer()
    history.recordLayerCreated(layerId, name, index)
    return { layerId, name, index }
  }, [layerManager, history])

  /**
   * レイヤーを削除 + 履歴に記録
   * @param layerId - 削除するレイヤーID
   * @returns 削除に成功した場合true
   */
  const deleteLayer = useCallback(
    (layerId: string) => {
      const layer = layerManager.getLayerById(layerId)
      if (!layer) return false

      const result = layerManager.deleteLayer(layerId)
      if (!result) return false

      // LayerSnapshotを作成
      const layerSnapshot = {
        id: result.layer.id,
        name: result.layer.name,
        isVisible: result.layer.isVisible,
        isLocked: result.layer.isLocked,
        opacity: result.layer.opacity,
        blendMode: result.layer.blendMode,
        drawables: result.layer.drawables,
      }
      history.recordLayerDeleted(layerId, layerSnapshot, result.index)
      return true
    },
    [layerManager, history]
  )

  /**
   * 背景レイヤーを表示（エクスポート時に使用）
   */
  const showBackgroundLayer = useCallback(() => {
    layerManager.setLayerVisibility(BACKGROUND_LAYER_ID, true)
  }, [layerManager])

  /**
   * 背景レイヤーを非表示（エクスポート後に使用）
   */
  const hideBackgroundLayer = useCallback(() => {
    layerManager.setLayerVisibility(BACKGROUND_LAYER_ID, false)
  }, [layerManager])

  /**
   * Drawableを直接追加（画像インポート用）
   * stabilizationは適用しない
   * @param drawable - 追加するDrawable
   */
  const addDrawable = useCallback(
    (drawable: Drawable) => {
      layerManager.addDrawable(drawable)
      history.addDrawable(drawable, layerManager.activeLayerId)
    },
    [layerManager, history]
  )

  return {
    drawables: allDrawables,
    layers: allLayers,
    activeLayerId: layerManager.activeLayerId,
    drawingLayerCount: layerManager.drawingLayerCount,
    canUndo: history.canUndo,
    canRedo: history.canRedo,
    startStroke,
    addPoint: drawing.addPoint,
    endStroke: drawing.endStroke,
    undo,
    redo,
    clear,
    setActiveLayer: layerManager.setActiveLayer,
    setLayerVisibility,
    setLayerOpacity,
    setLayerName,
    moveLayer: layerManager.moveLayer,
    moveLayerUp: layerManager.moveLayerUp,
    moveLayerDown: layerManager.moveLayerDown,
    addLayer,
    deleteLayer,
    translateAllLayers: layerManager.translateAllLayers,
    recordCanvasResize: history.recordCanvasResize,
    flipHorizontal,
    showBackgroundLayer,
    hideBackgroundLayer,
    addDrawable,
  } as const
}
