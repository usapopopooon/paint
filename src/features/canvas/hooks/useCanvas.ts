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

  /** Undo: アクション種別に応じてレイヤーを復元 + 履歴を戻す */
  const undo = useCallback(async () => {
    const action = await history.peekUndo()
    if (action) {
      if (action.type === 'drawable:added') {
        layerManager.removeLastDrawable()
      } else if (action.type === 'drawables:cleared') {
        // クリア前の状態を復元
        layerManager.setDrawables(action.previousDrawables)
      }
      await history.undo()
    }
  }, [history, layerManager])

  /** Redo: アクション種別に応じてレイヤーを更新 + 履歴を進める */
  const redo = useCallback(async () => {
    const action = await history.peekRedo()
    if (action) {
      if (action.type === 'drawable:added') {
        layerManager.addDrawable(action.drawable)
      } else if (action.type === 'drawables:cleared') {
        // クリア操作を再実行
        layerManager.clearActiveLayer()
      }
      await history.redo()
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
