import { useCallback } from 'react'
import type { Layer } from '@/features/layer'
import type { ImageDrawable, Point } from '@/features/drawable'
import type { SelectionRegion, UseSelectionReturn } from '@/features/selection'
import {
  renderLayerToOffscreenCanvas,
  clearSelectionRegion,
  getMaskedImageDataFromSelection,
  imageDataToDataURL,
  canvasToDataURL,
  getSelectionBounds,
  fillSelectionRegion,
  getOrCreateOffscreenCanvas,
  drawImageDataToContext,
} from '@/features/selection'
import { generateId } from '@/lib/id'
import type { ToolType } from '@/features/tools'

/**
 * キャンバス全体をカバーするImageDrawableを作成
 */
export const createFullCanvasImageDrawable = (
  dataURL: string,
  width: number,
  height: number
): ImageDrawable => ({
  id: generateId('drawable'),
  createdAt: Date.now(),
  type: 'image',
  src: dataURL,
  x: 0,
  y: 0,
  width,
  height,
  scaleX: 1,
  scaleY: 1,
})

/**
 * 選択領域のキャッシュされたImageDataをレイヤーに保存
 */
export const saveRegionImageDataToLayer = async (
  region: SelectionRegion,
  layer: Layer,
  canvasWidth: number,
  canvasHeight: number
): Promise<ImageDrawable | null> => {
  if (!region.imageData) return null

  const offscreenCanvas = await getOrCreateOffscreenCanvas(layer, canvasWidth, canvasHeight)
  const ctx = offscreenCanvas.getContext('2d')!

  const bounds = getSelectionBounds(region.shape, { x: 0, y: 0 })
  drawImageDataToContext(
    ctx,
    region.imageData,
    bounds.x + region.offset.x,
    bounds.y + region.offset.y
  )

  const dataURL = canvasToDataURL(offscreenCanvas)
  return createFullCanvasImageDrawable(dataURL, canvasWidth, canvasHeight)
}

export interface UseSelectionHandlersOptions {
  selection: UseSelectionReturn
  layers: readonly Layer[]
  activeLayerId: string
  canvasWidth: number
  canvasHeight: number
  penColor: string
  brushColor: string
  currentToolType: ToolType
  setDrawablesToLayer: (drawables: readonly ImageDrawable[], layerId: string) => void
  replaceLayerDrawables: (drawables: readonly ImageDrawable[], layerId: string) => void
  addDrawable: (drawable: ImageDrawable) => void
  recordCanvasResize: (
    oldWidth: number,
    oldHeight: number,
    newWidth: number,
    newHeight: number,
    offsetX: number,
    offsetY: number
  ) => void
  translateAllLayers: (offsetX: number, offsetY: number) => void
  setSizeDirectly: (width: number, height: number) => void
  setToolType: (type: ToolType) => void
  setSelectionToolType: (type: 'select-rectangle' | 'select-lasso') => void
}

export interface SelectionHandlers {
  handleSelectRectangle: () => void
  handleSelectLasso: () => void
  handleSelectAll: () => void
  handleDeselect: () => Promise<void>
  handleDeleteSelection: () => Promise<void>
  handleCopySelection: () => Promise<void>
  handleCutSelection: () => Promise<void>
  handlePasteSelection: () => void
  handleFillSelection: () => Promise<void>
  handleCropToSelection: () => Promise<void>
  handleStartSelection: (point: Point) => Promise<void>
  handleStartMove: (point: Point) => Promise<void>
  handleCommitMove: () => void
}

export function useSelectionHandlers(options: UseSelectionHandlersOptions): SelectionHandlers {
  const {
    selection,
    layers,
    activeLayerId,
    canvasWidth,
    canvasHeight,
    penColor,
    brushColor,
    currentToolType,
    setDrawablesToLayer,
    replaceLayerDrawables,
    addDrawable,
    recordCanvasResize,
    translateAllLayers,
    setSizeDirectly,
    setToolType,
    setSelectionToolType,
  } = options

  const handleSelectRectangle = useCallback(() => {
    setToolType('select-rectangle')
    setSelectionToolType('select-rectangle')
  }, [setToolType, setSelectionToolType])

  const handleSelectLasso = useCallback(() => {
    setToolType('select-lasso')
    setSelectionToolType('select-lasso')
  }, [setToolType, setSelectionToolType])

  const handleSelectAll = useCallback(() => {
    selection.selectAll({ x: 0, y: 0, width: canvasWidth, height: canvasHeight }, activeLayerId)
    setToolType('select-rectangle')
  }, [selection, canvasWidth, canvasHeight, activeLayerId, setToolType])

  /**
   * 選択解除ハンドラ
   * 移動中の場合はキャッシュされたImageDataを現在位置に描画してから選択解除
   */
  const handleDeselect = useCallback(async () => {
    const region = selection.state.region
    if (!region) {
      selection.deselect()
      return
    }

    const layer = layers.find((l) => l.id === region.layerId)
    if (layer && region.imageData) {
      const imageDrawable = await saveRegionImageDataToLayer(
        region,
        layer,
        canvasWidth,
        canvasHeight
      )
      if (imageDrawable) {
        setDrawablesToLayer([imageDrawable], region.layerId)
      }
    }

    selection.deselect()
  }, [selection, layers, canvasWidth, canvasHeight, setDrawablesToLayer])

  /**
   * 選択領域でキャンバスを切り抜くハンドラ（矩形選択時のみ）
   */
  const handleCropToSelection = useCallback(async () => {
    const region = selection.state.region
    if (!region) return

    if (region.shape.type !== 'rectangle') return

    const bounds = region.shape.bounds
    const newWidth = Math.round(bounds.width)
    const newHeight = Math.round(bounds.height)

    const offsetX = -Math.round(bounds.x)
    const offsetY = -Math.round(bounds.y)

    recordCanvasResize(canvasWidth, canvasHeight, newWidth, newHeight, offsetX, offsetY)

    translateAllLayers(offsetX, offsetY)
    setSizeDirectly(newWidth, newHeight)
    selection.deselect()
  }, [
    selection,
    canvasWidth,
    canvasHeight,
    recordCanvasResize,
    translateAllLayers,
    setSizeDirectly,
  ])

  /**
   * 選択領域を削除するハンドラ
   */
  const handleDeleteSelection = useCallback(async () => {
    const region = selection.state.region
    if (!region) return

    const layer = layers.find((l) => l.id === region.layerId)
    if (!layer || layer.drawables.length === 0) {
      selection.deselect()
      return
    }

    const offscreenCanvas = await renderLayerToOffscreenCanvas(layer, canvasWidth, canvasHeight)
    const ctx = offscreenCanvas.getContext('2d')!

    clearSelectionRegion(ctx, region.shape, region.offset)

    const imageDrawable = createFullCanvasImageDrawable(
      canvasToDataURL(offscreenCanvas),
      canvasWidth,
      canvasHeight
    )
    replaceLayerDrawables([imageDrawable], region.layerId)

    selection.deselect()
  }, [selection, layers, canvasWidth, canvasHeight, replaceLayerDrawables])

  /**
   * 選択領域をコピーするハンドラ
   */
  const handleCopySelection = useCallback(async () => {
    const region = selection.state.region
    if (!region) return

    const layer = layers.find((l) => l.id === region.layerId)
    if (!layer) return

    const offscreenCanvas = await renderLayerToOffscreenCanvas(layer, canvasWidth, canvasHeight)
    const ctx = offscreenCanvas.getContext('2d')!

    const imageData = getMaskedImageDataFromSelection(ctx, region.shape, region.offset)
    const bounds = getSelectionBounds(region.shape, region.offset)

    selection.copySelection(imageData, bounds)
  }, [selection, layers, canvasWidth, canvasHeight])

  /**
   * 選択領域をカットするハンドラ
   */
  const handleCutSelection = useCallback(async () => {
    const region = selection.state.region
    if (!region) return

    const layer = layers.find((l) => l.id === region.layerId)
    if (!layer) return

    const offscreenCanvas = await renderLayerToOffscreenCanvas(layer, canvasWidth, canvasHeight)
    const ctx = offscreenCanvas.getContext('2d')!

    const imageData = getMaskedImageDataFromSelection(ctx, region.shape, region.offset)
    const bounds = getSelectionBounds(region.shape, region.offset)

    clearSelectionRegion(ctx, region.shape, region.offset)

    const imageDrawable = createFullCanvasImageDrawable(
      canvasToDataURL(offscreenCanvas),
      canvasWidth,
      canvasHeight
    )
    replaceLayerDrawables([imageDrawable], region.layerId)

    selection.cutSelection(imageData, bounds)
  }, [selection, layers, canvasWidth, canvasHeight, replaceLayerDrawables])

  /**
   * ペーストするハンドラ
   */
  const handlePasteSelection = useCallback(() => {
    const clipboard = selection.state.clipboard
    if (!clipboard) return

    const dataURL = imageDataToDataURL(clipboard.imageData)

    const centerX = (canvasWidth - clipboard.bounds.width) / 2
    const centerY = (canvasHeight - clipboard.bounds.height) / 2

    const imageDrawable: ImageDrawable = {
      id: generateId('drawable'),
      createdAt: Date.now(),
      type: 'image',
      src: dataURL,
      x: centerX,
      y: centerY,
      width: clipboard.bounds.width,
      height: clipboard.bounds.height,
      scaleX: 1,
      scaleY: 1,
    }
    addDrawable(imageDrawable)

    selection.pasteSelection(activeLayerId, {
      x: 0,
      y: 0,
      width: canvasWidth,
      height: canvasHeight,
    })
  }, [selection, addDrawable, activeLayerId, canvasWidth, canvasHeight])

  /**
   * 選択領域を前景色で塗りつぶすハンドラ
   */
  const handleFillSelection = useCallback(async () => {
    const region = selection.state.region
    if (!region) return

    const layer = layers.find((l) => l.id === region.layerId)
    if (!layer) return

    const color = currentToolType === 'brush' ? brushColor : penColor

    const offscreenCanvas = await renderLayerToOffscreenCanvas(layer, canvasWidth, canvasHeight)
    const ctx = offscreenCanvas.getContext('2d')!

    fillSelectionRegion(ctx, region.shape, color, region.offset)

    const imageDrawable = createFullCanvasImageDrawable(
      canvasToDataURL(offscreenCanvas),
      canvasWidth,
      canvasHeight
    )
    replaceLayerDrawables([imageDrawable], region.layerId)

    selection.deselect()
  }, [
    selection,
    layers,
    currentToolType,
    brushColor,
    penColor,
    canvasWidth,
    canvasHeight,
    replaceLayerDrawables,
  ])

  /**
   * 選択開始ハンドラ
   * 既存の選択領域がある場合は先に保存してから新しい選択を開始
   */
  const handleStartSelection = useCallback(
    async (point: Point) => {
      const region = selection.state.region
      if (region?.imageData) {
        const layer = layers.find((l) => l.id === region.layerId)
        if (layer) {
          const imageDrawable = await saveRegionImageDataToLayer(
            region,
            layer,
            canvasWidth,
            canvasHeight
          )
          if (imageDrawable) {
            setDrawablesToLayer([imageDrawable], region.layerId)
          }
        }
      }

      selection.startSelection(point, activeLayerId)
    },
    [selection, layers, canvasWidth, canvasHeight, setDrawablesToLayer, activeLayerId]
  )

  /**
   * 選択領域の移動を開始するハンドラ
   */
  const handleStartMove = useCallback(
    async (point: Point) => {
      const region = selection.state.region
      if (!region) return

      if (region.imageData) {
        selection.startMove(point)
        return
      }

      const layer = layers.find((l) => l.id === region.layerId)
      if (!layer || layer.drawables.length === 0) {
        selection.startMove(point)
        return
      }

      const offscreenCanvas = await renderLayerToOffscreenCanvas(layer, canvasWidth, canvasHeight)
      const ctx = offscreenCanvas.getContext('2d')!

      const imageData = getMaskedImageDataFromSelection(ctx, region.shape, { x: 0, y: 0 })
      selection.setRegionImageData(imageData)

      clearSelectionRegion(ctx, region.shape, { x: 0, y: 0 })

      const imageDrawable = createFullCanvasImageDrawable(
        canvasToDataURL(offscreenCanvas),
        canvasWidth,
        canvasHeight
      )
      setDrawablesToLayer([imageDrawable], region.layerId)

      selection.startMove(point)
    },
    [selection, layers, canvasWidth, canvasHeight, setDrawablesToLayer]
  )

  /**
   * 選択領域の移動を確定するハンドラ
   */
  const handleCommitMove = useCallback(() => {
    selection.commitMove()
  }, [selection])

  return {
    handleSelectRectangle,
    handleSelectLasso,
    handleSelectAll,
    handleDeselect,
    handleDeleteSelection,
    handleCopySelection,
    handleCutSelection,
    handlePasteSelection,
    handleFillSelection,
    handleCropToSelection,
    handleStartSelection,
    handleStartMove,
    handleCommitMove,
  }
}
