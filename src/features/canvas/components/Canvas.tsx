import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import type { Drawable, Point } from '@/features/drawable'
import type { Layer } from '@/features/layer'
import type { CursorConfig, ToolType } from '@/features/tools/types'
import type { CanvasOffset } from '../hooks/useCanvasOffset'
import type {
  SelectionRegion,
  SelectionToolType,
  TransformState,
  TransformHandlePosition,
} from '@/features/selection'
import { SelectionOverlay, getTransformCursor } from '@/features/selection'
import { DrawingCanvas } from './DrawingCanvas'
import { PointerInputLayer } from '../../pointer'
import { getPixelColor, EYEDROPPER_CURSOR } from '@/features/eyedropper'

/**
 * Canvasコンポーネントのプロパティ
 */
type CanvasProps = {
  readonly drawables?: readonly Drawable[]
  readonly layers?: readonly Layer[]
  readonly onStartStroke: (point: Point) => void
  readonly onAddPoint: (point: Point) => void
  readonly onEndStroke: () => void
  readonly width?: number
  readonly height?: number
  readonly fillContainer?: boolean
  readonly cursor: CursorConfig
  readonly toolType?: ToolType
  readonly offset?: CanvasOffset
  readonly onPan?: (deltaX: number, deltaY: number) => void
  /** セカンダリクリック（右クリック等）で色を取得した時のコールバック */
  readonly onPickColor?: (color: string) => void
  /** ズーム倍率（座標変換に使用、デフォルト: 1） */
  readonly zoom?: number
  /** ビューポートサイズ（ズーム計算に使用） */
  readonly viewportSize?: { width: number; height: number }
  /** ズームツールクリック時のコールバック（ビューポートサイズ付き） */
  readonly onZoomAtPoint?: (
    mouseX: number,
    mouseY: number,
    viewportWidth: number,
    viewportHeight: number,
    direction: 'in' | 'out'
  ) => void
  /** 選択領域 */
  readonly selectionRegion?: SelectionRegion | null
  /** 選択中のポイント */
  readonly selectionPoints?: readonly Point[]
  /** 選択ツールタイプ */
  readonly selectionToolType?: SelectionToolType
  /** 選択中かどうか */
  readonly isSelecting?: boolean
  /** 移動中かどうか */
  readonly isMoving?: boolean
  /** 選択開始コールバック */
  readonly onStartSelection?: (point: Point) => void
  /** 選択更新コールバック */
  readonly onUpdateSelection?: (point: Point) => void
  /** 選択確定コールバック */
  readonly onCommitSelection?: () => void
  /** 移動開始コールバック */
  readonly onStartMove?: (point: Point) => void | Promise<void>
  /** 移動更新コールバック */
  readonly onUpdateMove?: (point: Point) => void
  /** 移動確定コールバック */
  readonly onCommitMove?: () => void
  /** 点が選択領域内かどうか判定 */
  readonly isPointInRegion?: (point: Point) => boolean
  /** アクティブレイヤーが非表示かどうか */
  readonly isActiveLayerHidden?: boolean
  /** 非表示レイヤーでポインターイベントが発生した時のコールバック */
  readonly onHiddenLayerInteraction?: () => void
  /** 変形状態 */
  readonly transformState?: TransformState | null
  /** 変形プレビュー用ImageData */
  readonly previewImageData?: ImageData | null
  /** ハンドル操作開始コールバック */
  readonly onStartHandleOperation?: (handle: TransformHandlePosition, point: Point) => void
  /** 変形更新コールバック */
  readonly onUpdateTransform?: (point: Point, shiftKey: boolean, altKey: boolean) => void
  /** ハンドル操作終了コールバック */
  readonly onEndHandleOperation?: () => void
  /** 点がハンドル上にあるか検出 */
  readonly detectHandleAtPoint?: (
    point: Point,
    handleSize: number
  ) => TransformHandlePosition | null
  /** 変形確定コールバック */
  readonly onConfirmTransform?: () => void
  /** 変形キャンセルコールバック */
  readonly onCancelTransform?: () => void
}

/**
 * ポインター入力と描画キャンバスを統合したコンポーネント
 * @param props - Canvasコンポーネントのプロパティ
 */
export const Canvas = ({
  drawables,
  layers,
  onStartStroke,
  onAddPoint,
  onEndStroke,
  width = 800,
  height = 600,
  fillContainer = false,
  cursor,
  toolType = 'pen',
  offset = { x: 0, y: 0 },
  onPan,
  onPickColor,
  zoom = 1,
  viewportSize = { width: 0, height: 0 },
  onZoomAtPoint,
  selectionRegion,
  selectionPoints = [],
  selectionToolType = 'select-rectangle',
  isSelecting = false,
  isMoving = false,
  onStartSelection,
  onUpdateSelection,
  onCommitSelection,
  onStartMove,
  onUpdateMove,
  onCommitMove,
  isPointInRegion,
  isActiveLayerHidden = false,
  onHiddenLayerInteraction,
  transformState,
  previewImageData,
  onStartHandleOperation,
  onUpdateTransform,
  onEndHandleOperation,
  detectHandleAtPoint,
  onConfirmTransform,
  onCancelTransform,
}: CanvasProps) => {
  const isHandTool = toolType === 'hand'
  const isEyedropperTool = toolType === 'eyedropper'
  const isZoomInTool = toolType === 'zoom-in'
  const isZoomOutTool = toolType === 'zoom-out'
  const isSelectionTool = toolType === 'select-rectangle' || toolType === 'select-lasso'
  const isDrawingTool =
    !isHandTool && !isEyedropperTool && !isZoomInTool && !isZoomOutTool && !isSelectionTool
  const containerRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const lastClientPosRef = useRef<{ x: number; y: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  /**
   * セカンダリクリック（右クリック等）で色を取得
   * 選択ツール時はコンテキストメニューを表示するためスキップ
   */
  const handleSecondaryClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // 選択ツール時はコンテキストメニューを表示するため何もしない
      if (isSelectionTool) return

      if (!onPickColor) return

      // コンテキストメニューを防止
      e.preventDefault()

      const container = containerRef.current
      if (!container) return

      // キャンバス要素を取得
      const canvas = container.querySelector('canvas')
      if (!canvas) return

      // クリック位置をキャンバス座標に変換（zoomを考慮）
      const rect = canvas.getBoundingClientRect()
      const x = (e.clientX - rect.left) / zoom
      const y = (e.clientY - rect.top) / zoom

      const color = getPixelColor(canvas, x, y)
      if (color) {
        onPickColor(color)
      }
    },
    [onPickColor, zoom, isSelectionTool]
  )

  /**
   * ズームツールクリック時のハンドラ
   */
  const handleZoomClick = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!onZoomAtPoint || (!isZoomInTool && !isZoomOutTool)) return

      const container = containerRef.current
      if (!container) return

      const rect = container.getBoundingClientRect()
      const canvasCenterInViewportX = viewportSize.width / 2
      const canvasCenterInViewportY = viewportSize.height / 2
      const canvasCenterInScreenX = rect.left + rect.width / 2
      const canvasCenterInScreenY = rect.top + rect.height / 2

      const mouseX = canvasCenterInViewportX + (e.clientX - canvasCenterInScreenX)
      const mouseY = canvasCenterInViewportY + (e.clientY - canvasCenterInScreenY)

      onZoomAtPoint(
        mouseX,
        mouseY,
        viewportSize.width,
        viewportSize.height,
        isZoomInTool ? 'in' : 'out'
      )
    },
    [onZoomAtPoint, isZoomInTool, isZoomOutTool, viewportSize]
  )

  // ハンドツール時はネイティブポインターイベントでパン処理
  // clientX/clientYを使うことでtransformの影響を受けずに正確に計算できる
  useEffect(() => {
    if (!isHandTool || !onPan) return

    const container = containerRef.current
    if (!container) return

    const handlePointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return
      isDraggingRef.current = true
      lastClientPosRef.current = { x: e.clientX, y: e.clientY }
      setIsDragging(true)
      container.setPointerCapture(e.pointerId)
    }

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current || !lastClientPosRef.current) return
      const deltaX = e.clientX - lastClientPosRef.current.x
      const deltaY = e.clientY - lastClientPosRef.current.y
      onPan(deltaX, deltaY)
      lastClientPosRef.current = { x: e.clientX, y: e.clientY }
    }

    const handlePointerUp = (e: PointerEvent) => {
      if (!isDraggingRef.current) return
      isDraggingRef.current = false
      lastClientPosRef.current = null
      setIsDragging(false)
      container.releasePointerCapture(e.pointerId)
    }

    container.addEventListener('pointerdown', handlePointerDown)
    container.addEventListener('pointermove', handlePointerMove)
    container.addEventListener('pointerup', handlePointerUp)
    container.addEventListener('pointercancel', handlePointerUp)

    return () => {
      container.removeEventListener('pointerdown', handlePointerDown)
      container.removeEventListener('pointermove', handlePointerMove)
      container.removeEventListener('pointerup', handlePointerUp)
      container.removeEventListener('pointercancel', handlePointerUp)
    }
  }, [isHandTool, onPan])

  // 移動中かどうかを追跡するref
  const isMovingRef = useRef(false)

  // 選択ツール時のポインターイベント処理（変形中は無効）
  useEffect(() => {
    if (!isSelectionTool || transformState) return

    const container = containerRef.current
    if (!container) return

    const getCanvasPoint = (e: PointerEvent): Point => {
      const canvas = container.querySelector('canvas')
      if (!canvas) return { x: 0, y: 0 }
      const rect = canvas.getBoundingClientRect()
      return {
        x: (e.clientX - rect.left) / zoom,
        y: (e.clientY - rect.top) / zoom,
      }
    }

    const handlePointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return

      // 非表示レイヤーの場合は操作をブロックしてコールバックを呼ぶ
      if (isActiveLayerHidden) {
        onHiddenLayerInteraction?.()
        return
      }

      isDraggingRef.current = true
      setIsDragging(true)
      container.setPointerCapture(e.pointerId)

      const point = getCanvasPoint(e)

      // 選択領域内をクリックした場合は移動開始
      if (selectionRegion && isPointInRegion?.(point)) {
        isMovingRef.current = true
        onStartMove?.(point)
      } else {
        // 選択領域外をクリックした場合は新規選択開始
        isMovingRef.current = false
        onStartSelection?.(point)
      }
    }

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return
      const point = getCanvasPoint(e)

      if (isMovingRef.current) {
        onUpdateMove?.(point)
      } else {
        onUpdateSelection?.(point)
      }
    }

    const handlePointerUp = (e: PointerEvent) => {
      if (!isDraggingRef.current) return
      isDraggingRef.current = false
      setIsDragging(false)
      container.releasePointerCapture(e.pointerId)

      if (isMovingRef.current) {
        onCommitMove?.()
        isMovingRef.current = false
      } else {
        onCommitSelection?.()
      }
    }

    container.addEventListener('pointerdown', handlePointerDown)
    container.addEventListener('pointermove', handlePointerMove)
    container.addEventListener('pointerup', handlePointerUp)
    container.addEventListener('pointercancel', handlePointerUp)

    return () => {
      container.removeEventListener('pointerdown', handlePointerDown)
      container.removeEventListener('pointermove', handlePointerMove)
      container.removeEventListener('pointerup', handlePointerUp)
      container.removeEventListener('pointercancel', handlePointerUp)
    }
  }, [
    isSelectionTool,
    transformState,
    zoom,
    selectionRegion,
    isPointInRegion,
    onStartSelection,
    onUpdateSelection,
    onCommitSelection,
    onStartMove,
    onUpdateMove,
    onCommitMove,
    isActiveLayerHidden,
    onHiddenLayerInteraction,
  ])

  // 変形操作中のハンドル位置を追跡
  const activeHandleRef = useRef<TransformHandlePosition | null>(null)
  const isTransformingRef = useRef(false)
  const [hoveredHandle, setHoveredHandle] = useState<TransformHandlePosition | null>(null)

  // ハンドルサイズ（ズームに依存しない）
  const HANDLE_SIZE = 8 / zoom

  // 変形中のポインターイベント処理
  useEffect(() => {
    if (!transformState || !isSelectionTool) return

    const container = containerRef.current
    if (!container) return

    const getCanvasPoint = (e: PointerEvent): Point => {
      const canvas = container.querySelector('canvas')
      if (!canvas) return { x: 0, y: 0 }
      const rect = canvas.getBoundingClientRect()
      return {
        x: (e.clientX - rect.left) / zoom,
        y: (e.clientY - rect.top) / zoom,
      }
    }

    const handlePointerDown = (e: PointerEvent) => {
      // 右クリックで変形キャンセル
      if (e.button === 2) {
        onCancelTransform?.()
        e.preventDefault()
        e.stopPropagation()
        return
      }

      if (e.button !== 0) return

      const point = getCanvasPoint(e)
      const handle = detectHandleAtPoint?.(point, HANDLE_SIZE)

      if (handle) {
        activeHandleRef.current = handle
        isTransformingRef.current = true
        isDraggingRef.current = true
        setIsDragging(true)
        container.setPointerCapture(e.pointerId)
        onStartHandleOperation?.(handle, point)
        e.preventDefault()
        e.stopPropagation()
      } else {
        // ハンドル外を左クリックで変形確定
        onConfirmTransform?.()
        e.preventDefault()
        e.stopPropagation()
      }
    }

    const handlePointerMove = (e: PointerEvent) => {
      const point = getCanvasPoint(e)

      if (isTransformingRef.current && isDraggingRef.current) {
        onUpdateTransform?.(point, e.shiftKey, e.altKey)
      } else {
        // ホバー中のハンドルを検出してカーソルを更新
        const handle = detectHandleAtPoint?.(point, HANDLE_SIZE) ?? null
        setHoveredHandle(handle)
      }
    }

    const handlePointerUp = (e: PointerEvent) => {
      if (!isDraggingRef.current || !isTransformingRef.current) return

      isDraggingRef.current = false
      isTransformingRef.current = false
      setIsDragging(false)
      container.releasePointerCapture(e.pointerId)
      activeHandleRef.current = null
      onEndHandleOperation?.()
    }

    container.addEventListener('pointerdown', handlePointerDown)
    container.addEventListener('pointermove', handlePointerMove)
    container.addEventListener('pointerup', handlePointerUp)
    container.addEventListener('pointercancel', handlePointerUp)

    return () => {
      container.removeEventListener('pointerdown', handlePointerDown)
      container.removeEventListener('pointermove', handlePointerMove)
      container.removeEventListener('pointerup', handlePointerUp)
      container.removeEventListener('pointercancel', handlePointerUp)
    }
  }, [
    transformState,
    isSelectionTool,
    zoom,
    HANDLE_SIZE,
    detectHandleAtPoint,
    onStartHandleOperation,
    onUpdateTransform,
    onEndHandleOperation,
    onConfirmTransform,
    onCancelTransform,
  ])

  // ツールに応じたカーソルスタイルを計算（描画ツール以外）
  const cursorStyle = useMemo(() => {
    // ハンドツール、スポイト、ズームツールは非表示レイヤーでも使用可能
    if (isHandTool) {
      return isDragging ? 'grabbing' : 'grab'
    }
    if (isEyedropperTool) {
      return EYEDROPPER_CURSOR
    }
    if (isZoomInTool) {
      return 'zoom-in'
    }
    if (isZoomOutTool) {
      return 'zoom-out'
    }
    // 描画ツールと選択ツールは非表示レイヤー時にnot-allowedカーソル
    if (isActiveLayerHidden) {
      return 'not-allowed'
    }
    if (isSelectionTool) {
      // 変形中はハンドルに応じたカーソル
      if (transformState) {
        const rotation = transformState.rotation
        return getTransformCursor(hoveredHandle, rotation)
      }
      // 移動中はmoveカーソル
      if (isMoving) {
        return 'move'
      }
      return 'crosshair'
    }
    return undefined // 描画ツールはPointerInputLayerがカーソルを制御
  }, [
    isHandTool,
    isEyedropperTool,
    isZoomInTool,
    isZoomOutTool,
    isSelectionTool,
    isDragging,
    isMoving,
    isActiveLayerHidden,
    transformState,
    hoveredHandle,
  ])

  // 描画ツール用のstrokeハンドラをラップして非表示レイヤーチェックを追加
  const handleStartStroke = useCallback(
    (point: Point) => {
      if (isActiveLayerHidden) {
        onHiddenLayerInteraction?.()
        return
      }
      onStartStroke(point)
    },
    [isActiveLayerHidden, onHiddenLayerInteraction, onStartStroke]
  )

  // クリックハンドラを統合
  const handleClick = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (isEyedropperTool) {
        handleSecondaryClick(e)
      } else if (isZoomInTool || isZoomOutTool) {
        handleZoomClick(e)
      }
    },
    [isEyedropperTool, isZoomInTool, isZoomOutTool, handleSecondaryClick, handleZoomClick]
  )

  // 常に同じ構造を返すことでDrawingCanvasの再マウントを防ぐ
  // PointerInputLayerは常に存在し、描画ツール以外はdisabledにする
  return (
    <div
      ref={containerRef}
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        touchAction: 'none',
        cursor: cursorStyle,
        position: 'relative',
      }}
      className={fillContainer ? 'w-full h-full' : 'inline-block'}
      onPointerUp={handleClick}
      onContextMenu={handleSecondaryClick}
    >
      <PointerInputLayer
        onStart={handleStartStroke}
        onMove={onAddPoint}
        onEnd={onEndStroke}
        cursor={isActiveLayerHidden ? undefined : cursor}
        className={fillContainer ? 'w-full h-full' : 'inline-block'}
        zoom={zoom}
        disabled={!isDrawingTool}
      >
        <DrawingCanvas
          drawables={drawables}
          layers={layers}
          width={width}
          height={height}
          fillContainer={fillContainer}
        />
      </PointerInputLayer>
      <SelectionOverlay
        width={width}
        height={height}
        region={selectionRegion ?? null}
        selectionPoints={selectionPoints}
        toolType={selectionToolType}
        isSelecting={isSelecting}
        scale={zoom}
        transformState={transformState}
        previewImageData={previewImageData}
      />
    </div>
  )
}
