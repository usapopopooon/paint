import { useCallback, useMemo } from 'react'
import type { ToolConfig } from '../../tools/types'
import type { Layer } from '@/features/layer'
import type { Drawable, Point } from '@/features/drawable'
import { useLayers } from '@/features/layer'
import { useCanvasHistory } from './useCanvasHistory'
import { useDrawing } from './useDrawing'

/**
 * Canvas統合hook
 *
 * 状態の単一責任:
 * - useLayers: drawablesの状態を管理（single source of truth）
 * - useCanvasHistory: undo/redo履歴のみを管理
 * - useDrawing: 描画中のストローク管理
 * @returns キャンバス操作用のメソッドと現在の状態
 */
export const useCanvas = () => {
  const layerManager = useLayers()
  const history = useCanvasHistory()

  /**
   * Drawable完成時のハンドラ: レイヤーに追加 + 履歴に記録
   * @param drawable - 完成したDrawable
   */
  const handleDrawableComplete = useCallback(
    (drawable: Drawable) => {
      layerManager.addDrawable(drawable)
      history.addDrawable(drawable)
    },
    [layerManager, history]
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

  /** レンダリング用レイヤー（描画中のストローク含む） */
  const allLayers = useMemo((): readonly Layer[] => {
    if (!drawing.currentStroke) return layerManager.layers

    return layerManager.layers.map((layer) =>
      layer.id === layerManager.activeLayerId
        ? { ...layer, drawables: [...layer.drawables, drawing.currentStroke!] }
        : layer
    )
  }, [layerManager, drawing])

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

  /** Undo: レイヤーから削除 + 履歴を戻す */
  const undo = useCallback(() => {
    if (history.canUndo) {
      layerManager.removeLastDrawable()
      history.undo()
    }
  }, [history, layerManager])

  /** Redo: 履歴からdrawableを取得 + レイヤーに追加 */
  const redo = useCallback(async () => {
    if (history.canRedo) {
      const drawable = await history.getRedoDrawable()
      if (drawable) {
        layerManager.addDrawable(drawable)
        await history.redo()
      }
    }
  }, [history, layerManager])

  /** Clear: レイヤーをクリア + 履歴に記録 */
  const clear = useCallback(() => {
    const previousDrawables = layerManager.activeLayer.drawables
    layerManager.clearActiveLayer()
    history.recordClear(previousDrawables)
  }, [layerManager, history])

  return {
    drawables: allDrawables,
    layers: allLayers,
    activeLayerId: layerManager.activeLayerId,
    canUndo: history.canUndo,
    canRedo: history.canRedo,
    startStroke,
    addPoint: drawing.addPoint,
    endStroke: drawing.endStroke,
    undo,
    redo,
    clear,
  } as const
}
