import { useRef, useEffect, useCallback, useMemo } from 'react'
import type { Point, Bounds } from '@/lib/geometry'
import type { TransformMode, TransformHandlePosition, TransformState } from '../types'
import {
  getAllHandlePositions,
  getTransformedCorners,
  HANDLE_INFO,
} from '../adapters/canvas'
import {
  TRANSFORM_HANDLE_SIZE,
  TRANSFORM_HANDLE_STROKE_WIDTH,
} from '../constants'

type TransformHandlesProps = {
  /** キャンバスの幅 */
  readonly width: number
  /** キャンバスの高さ */
  readonly height: number
  /** 変形状態 */
  readonly transformState: TransformState
  /** ズームレベル */
  readonly scale?: number
  /** オフセット */
  readonly offset?: Point
  /** プレビュー用ImageData */
  readonly previewImageData?: ImageData | null
}

/**
 * 変形ハンドルとプレビューを描画するコンポーネント
 */
export const TransformHandles = ({
  width,
  height,
  transformState,
  scale = 1,
  offset = { x: 0, y: 0 },
  previewImageData,
}: TransformHandlesProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null)

  // プレビュー用の一時Canvasを作成
  useEffect(() => {
    if (previewImageData && !previewCanvasRef.current) {
      previewCanvasRef.current = document.createElement('canvas')
    }
  }, [previewImageData])

  // プレビューImageDataをCanvasに描画
  useEffect(() => {
    if (previewImageData && previewCanvasRef.current) {
      previewCanvasRef.current.width = previewImageData.width
      previewCanvasRef.current.height = previewImageData.height
      const ctx = previewCanvasRef.current.getContext('2d')
      if (ctx) {
        ctx.putImageData(previewImageData, 0, 0)
      }
    }
  }, [previewImageData])

  // ハンドル位置を計算
  const handlePositions = useMemo(
    () =>
      getAllHandlePositions(
        transformState.originalBounds,
        transformState.rotation,
        transformState.center
      ),
    [transformState.originalBounds, transformState.rotation, transformState.center]
  )

  // 変形後の4隅を計算
  const transformedCorners = useMemo(
    () =>
      getTransformedCorners(
        transformState.originalBounds,
        transformState.scale,
        transformState.rotation,
        transformState.center
      ),
    [
      transformState.originalBounds,
      transformState.scale,
      transformState.rotation,
      transformState.center,
    ]
  )

  /**
   * ハンドルを描画
   */
  const drawHandle = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      position: Point,
      isRotation: boolean,
      handleSize: number
    ) => {
      ctx.save()

      if (isRotation) {
        // 回転ハンドル（円形）
        ctx.beginPath()
        ctx.arc(position.x, position.y, handleSize / 2, 0, Math.PI * 2)
        ctx.fillStyle = '#ffffff'
        ctx.fill()
        ctx.strokeStyle = '#0078d4'
        ctx.lineWidth = TRANSFORM_HANDLE_STROKE_WIDTH
        ctx.stroke()

        // 中心の回転アイコン
        ctx.beginPath()
        ctx.arc(position.x, position.y, handleSize / 4, 0, Math.PI * 1.5)
        ctx.strokeStyle = '#0078d4'
        ctx.lineWidth = 1.5
        ctx.stroke()
      } else {
        // リサイズハンドル（四角形）
        const halfSize = handleSize / 2
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(position.x - halfSize, position.y - halfSize, handleSize, handleSize)
        ctx.strokeStyle = '#0078d4'
        ctx.lineWidth = TRANSFORM_HANDLE_STROKE_WIDTH
        ctx.strokeRect(position.x - halfSize, position.y - halfSize, handleSize, handleSize)
      }

      ctx.restore()
    },
    []
  )

  /**
   * 描画処理
   */
  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // クリア
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // スケールとオフセットを適用
    ctx.save()
    ctx.translate(offset.x, offset.y)
    ctx.scale(scale, scale)

    // プレビュー画像を描画
    if (previewImageData && previewCanvasRef.current) {
      const { originalBounds, center, rotation } = transformState

      ctx.save()
      ctx.translate(center.x, center.y)
      ctx.rotate(rotation)
      ctx.scale(transformState.scale.x, transformState.scale.y)
      ctx.translate(-center.x, -center.y)

      // 変形後の位置に描画
      ctx.drawImage(previewCanvasRef.current, originalBounds.x, originalBounds.y)
      ctx.restore()
    }

    // バウンディングボックスを描画
    ctx.beginPath()
    ctx.moveTo(transformedCorners[0].x, transformedCorners[0].y)
    for (let i = 1; i < transformedCorners.length; i++) {
      ctx.lineTo(transformedCorners[i].x, transformedCorners[i].y)
    }
    ctx.closePath()
    ctx.strokeStyle = '#0078d4'
    ctx.lineWidth = 1 / scale
    ctx.setLineDash([4 / scale, 4 / scale])
    ctx.stroke()
    ctx.setLineDash([])

    // ハンドルサイズ（ズームに依存しない）
    const handleSize = TRANSFORM_HANDLE_SIZE / scale

    // 回転ハンドルと中央上部を結ぶ線
    const topCenter = handlePositions['top-center']
    const rotation = handlePositions['rotation']
    ctx.beginPath()
    ctx.moveTo(topCenter.x, topCenter.y)
    ctx.lineTo(rotation.x, rotation.y)
    ctx.strokeStyle = '#0078d4'
    ctx.lineWidth = 1 / scale
    ctx.stroke()

    // ハンドルを描画
    const handleTypes: TransformHandlePosition[] = getVisibleHandles(transformState.mode)

    for (const handleType of handleTypes) {
      const pos = handlePositions[handleType]
      drawHandle(ctx, pos, handleType === 'rotation', handleSize)
    }

    ctx.restore()
  }, [
    offset,
    scale,
    transformState,
    transformedCorners,
    handlePositions,
    previewImageData,
    drawHandle,
  ])

  /**
   * モードに応じて表示するハンドルを取得
   */
  const getVisibleHandles = (mode: TransformMode): TransformHandlePosition[] => {
    const scaleHandles: TransformHandlePosition[] = [
      'top-left',
      'top-center',
      'top-right',
      'middle-left',
      'middle-right',
      'bottom-left',
      'bottom-center',
      'bottom-right',
    ]

    switch (mode) {
      case 'free-transform':
        return [...scaleHandles, 'rotation']
      case 'scale':
        return scaleHandles
      case 'rotate':
        return ['rotation']
      default:
        return [...scaleHandles, 'rotation']
    }
  }

  /**
   * キャンバスサイズ変更時の処理
   */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // デバイスピクセル比を考慮
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr

    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.scale(dpr, dpr)
    }

    render()
  }, [width, height, render])

  // 状態が変わったら再描画
  useEffect(() => {
    render()
  }, [render, transformState, previewImageData])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width,
        height,
        pointerEvents: 'none',
      }}
    />
  )
}

/**
 * 変形ハンドル用のカーソルを取得
 */
export const getTransformCursor = (
  handle: TransformHandlePosition | null,
  rotation: number = 0
): string => {
  if (!handle) return 'default'

  const info = HANDLE_INFO[handle]
  if (handle === 'rotation') {
    return 'grab'
  }

  // 回転に応じてカーソルを調整
  // 45度ごとに8方向のカーソルをマッピング
  const cursorMap: Record<string, string[]> = {
    'nwse-resize': ['nwse-resize', 'ns-resize', 'nesw-resize', 'ew-resize'],
    'nesw-resize': ['nesw-resize', 'ew-resize', 'nwse-resize', 'ns-resize'],
    'ns-resize': ['ns-resize', 'nesw-resize', 'ew-resize', 'nwse-resize'],
    'ew-resize': ['ew-resize', 'nwse-resize', 'ns-resize', 'nesw-resize'],
  }

  const baseCursor = info.cursor
  const cursorCycle = cursorMap[baseCursor]
  if (!cursorCycle) return baseCursor

  // 45度ごとのインデックス
  const angle = ((rotation * 180) / Math.PI) % 360
  const normalizedAngle = angle < 0 ? angle + 360 : angle
  const index = Math.round(normalizedAngle / 45) % 4

  return cursorCycle[index]
}
