import { useCallback } from 'react'
import type { Layer } from '@/features/layer'
import type { ImageDrawable } from '@/features/drawable'
import type { TransformMode, UseTransformReturn, UseSelectionReturn } from '@/features/selection'
import {
  renderLayerToOffscreenCanvas,
  clearSelectionRegion,
  getMaskedImageDataFromSelection,
  canvasToDataURL,
  getSelectionBounds,
  drawImageDataToContext,
} from '@/features/selection'
import { createFullCanvasImageDrawable } from './useSelectionHandlers'

export interface UseTransformHandlersOptions {
  selection: UseSelectionReturn
  transform: UseTransformReturn
  layers: readonly Layer[]
  canvasWidth: number
  canvasHeight: number
  replaceLayerDrawables: (drawables: readonly ImageDrawable[], layerId: string) => void
  setDrawablesToLayer: (drawables: readonly ImageDrawable[], layerId: string) => void
  undo: () => void
}

export interface TransformHandlers {
  handleStartTransform: (mode: TransformMode) => Promise<void>
  handleFreeTransform: () => void
  handleScaleTransform: () => void
  handleRotateTransform: () => void
  handleTransformShortcut: () => void
  handleConfirmTransform: () => Promise<void>
  handleCancelTransform: () => void
}

export function useTransformHandlers(options: UseTransformHandlersOptions): TransformHandlers {
  const {
    selection,
    transform,
    layers,
    canvasWidth,
    canvasHeight,
    replaceLayerDrawables,
    setDrawablesToLayer,
    undo,
  } = options

  /**
   * 変形を開始するハンドラ
   */
  const handleStartTransform = useCallback(
    async (mode: TransformMode) => {
      if (transform.isTransforming) return

      const region = selection.state.region
      if (!region) return

      const layer = layers.find((l) => l.id === region.layerId)
      if (!layer) return

      const bounds = getSelectionBounds(region.shape, region.offset)

      let imageData: ImageData
      if (region.imageData) {
        imageData = region.imageData
      } else {
        const tempCanvas = await renderLayerToOffscreenCanvas(layer, canvasWidth, canvasHeight)
        const tempCtx = tempCanvas.getContext('2d')!
        imageData = getMaskedImageDataFromSelection(tempCtx, region.shape, { x: 0, y: 0 })
        selection.setRegionImageData(imageData)
      }

      // 1. まずレイヤーを空にする（履歴に記録 - キャンセル時にUndoで復元可能）
      replaceLayerDrawables([], region.layerId)

      // 2. 変形状態を開始（プレビュー表示を有効化）
      transform.startTransform(mode, imageData, bounds)

      // 3. 選択領域をクリアしたImageDrawableを作成してレイヤーに設定
      const offscreenCanvas = await renderLayerToOffscreenCanvas(layer, canvasWidth, canvasHeight)
      const ctx = offscreenCanvas.getContext('2d')!

      clearSelectionRegion(ctx, region.shape, { x: 0, y: 0 })

      const clearedImageDrawable = createFullCanvasImageDrawable(
        canvasToDataURL(offscreenCanvas),
        canvasWidth,
        canvasHeight
      )

      setDrawablesToLayer([clearedImageDrawable], region.layerId)
    },
    [
      selection,
      transform,
      layers,
      canvasWidth,
      canvasHeight,
      replaceLayerDrawables,
      setDrawablesToLayer,
    ]
  )

  const handleFreeTransform = useCallback(() => {
    handleStartTransform('free-transform')
  }, [handleStartTransform])

  const handleScaleTransform = useCallback(() => {
    handleStartTransform('scale')
  }, [handleStartTransform])

  const handleRotateTransform = useCallback(() => {
    handleStartTransform('rotate')
  }, [handleStartTransform])

  /**
   * 変形中にCtrl+Tでモード切り替え、または変形開始
   */
  const handleTransformShortcut = useCallback(() => {
    if (transform.isTransforming) {
      transform.cycleTransformMode()
    } else if (selection.state.region) {
      handleStartTransform('free-transform')
    }
  }, [transform, selection.state.region, handleStartTransform])

  /**
   * 変形を確定するハンドラ
   */
  const handleConfirmTransform = useCallback(async () => {
    if (!transform.isTransforming) return

    const region = selection.state.region
    if (!region) {
      transform.cancelTransform()
      return
    }

    const layer = layers.find((l) => l.id === region.layerId)
    if (!layer) {
      transform.cancelTransform()
      selection.deselect()
      return
    }

    const offscreenCanvas = await renderLayerToOffscreenCanvas(layer, canvasWidth, canvasHeight)
    const ctx = offscreenCanvas.getContext('2d')!

    const result = await transform.commitTransform()
    if (!result) return

    drawImageDataToContext(ctx, result.imageData, result.bounds.x, result.bounds.y)

    const imageDrawable = createFullCanvasImageDrawable(
      canvasToDataURL(offscreenCanvas),
      canvasWidth,
      canvasHeight
    )

    setDrawablesToLayer([imageDrawable], region.layerId)

    selection.deselect()
  }, [transform, selection, layers, canvasWidth, canvasHeight, setDrawablesToLayer])

  /**
   * 変形をキャンセルするハンドラ
   */
  const handleCancelTransform = useCallback(() => {
    if (transform.isTransforming) {
      transform.cancelTransform()
      undo()
    }
  }, [transform, undo])

  return {
    handleStartTransform,
    handleFreeTransform,
    handleScaleTransform,
    handleRotateTransform,
    handleTransformShortcut,
    handleConfirmTransform,
    handleCancelTransform,
  }
}
