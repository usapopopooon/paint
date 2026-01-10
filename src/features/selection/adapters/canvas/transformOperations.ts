/**
 * 変形計算ユーティリティ
 *
 * ハンドル操作からの変形計算、制約処理（Shift/Alt）などを提供。
 */

import type { Point, Bounds } from '@/lib/geometry'
import type { TransformHandlePosition, TransformMode, TransformState } from '../../types'

/**
 * ハンドル位置の座標定義
 */
export type HandleInfo = {
  /** ハンドルの位置（バウンズに対する相対位置 0-1） */
  readonly position: Point
  /** カーソルスタイル */
  readonly cursor: string
  /** 対角のハンドル位置（リサイズの固定点用） */
  readonly opposite: TransformHandlePosition | null
}

/**
 * ハンドル情報のマップ
 */
export const HANDLE_INFO: Record<TransformHandlePosition, HandleInfo> = {
  'top-left': { position: { x: 0, y: 0 }, cursor: 'nwse-resize', opposite: 'bottom-right' },
  'top-center': { position: { x: 0.5, y: 0 }, cursor: 'ns-resize', opposite: 'bottom-center' },
  'top-right': { position: { x: 1, y: 0 }, cursor: 'nesw-resize', opposite: 'bottom-left' },
  'middle-left': { position: { x: 0, y: 0.5 }, cursor: 'ew-resize', opposite: 'middle-right' },
  'middle-right': { position: { x: 1, y: 0.5 }, cursor: 'ew-resize', opposite: 'middle-left' },
  'bottom-left': { position: { x: 0, y: 1 }, cursor: 'nesw-resize', opposite: 'top-right' },
  'bottom-center': { position: { x: 0.5, y: 1 }, cursor: 'ns-resize', opposite: 'top-center' },
  'bottom-right': { position: { x: 1, y: 1 }, cursor: 'nwse-resize', opposite: 'top-left' },
  rotation: { position: { x: 0.5, y: -0.15 }, cursor: 'grab', opposite: null },
}

/**
 * ハンドルのキャンバス上の座標を計算
 */
export const getHandlePosition = (
  handle: TransformHandlePosition,
  bounds: Bounds,
  rotation: number = 0,
  center?: Point
): Point => {
  const info = HANDLE_INFO[handle]
  const handleCenter = center ?? {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height / 2,
  }

  // ハンドルのローカル座標
  let localX: number
  let localY: number

  if (handle === 'rotation') {
    // 回転ハンドルは上部中央の上
    const rotationHandleOffset = Math.min(30, bounds.height * 0.3)
    localX = 0
    localY = -bounds.height / 2 - rotationHandleOffset
  } else {
    localX = (info.position.x - 0.5) * bounds.width
    localY = (info.position.y - 0.5) * bounds.height
  }

  // 回転を適用
  if (rotation !== 0) {
    const cos = Math.cos(rotation)
    const sin = Math.sin(rotation)
    const rx = localX * cos - localY * sin
    const ry = localX * sin + localY * cos
    localX = rx
    localY = ry
  }

  return {
    x: handleCenter.x + localX,
    y: handleCenter.y + localY,
  }
}

/**
 * すべてのハンドル位置を計算
 */
export const getAllHandlePositions = (
  bounds: Bounds,
  rotation: number = 0,
  center?: Point
): Record<TransformHandlePosition, Point> => {
  const handles: Partial<Record<TransformHandlePosition, Point>> = {}
  const handleTypes: TransformHandlePosition[] = [
    'top-left',
    'top-center',
    'top-right',
    'middle-left',
    'middle-right',
    'bottom-left',
    'bottom-center',
    'bottom-right',
    'rotation',
  ]

  for (const handle of handleTypes) {
    handles[handle] = getHandlePosition(handle, bounds, rotation, center)
  }

  return handles as Record<TransformHandlePosition, Point>
}

/**
 * 点がハンドル内にあるかを判定
 */
export const isPointInHandle = (
  point: Point,
  handlePosition: Point,
  handleSize: number
): boolean => {
  const halfSize = handleSize / 2
  return (
    point.x >= handlePosition.x - halfSize &&
    point.x <= handlePosition.x + halfSize &&
    point.y >= handlePosition.y - halfSize &&
    point.y <= handlePosition.y + halfSize
  )
}

/**
 * クリック位置からハンドルを検出
 */
export const detectHandle = (
  point: Point,
  bounds: Bounds,
  rotation: number,
  center: Point,
  handleSize: number,
  mode: TransformMode
): TransformHandlePosition | null => {
  const handles = getAllHandlePositions(bounds, rotation, center)

  // 回転ハンドルは free-transform と rotate モードでのみ有効
  if (mode === 'free-transform' || mode === 'rotate') {
    if (isPointInHandle(point, handles.rotation, handleSize)) {
      return 'rotation'
    }
  }

  // スケールハンドル（free-transform と scale モードで有効）
  if (mode === 'free-transform' || mode === 'scale') {
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

    for (const handle of scaleHandles) {
      if (isPointInHandle(point, handles[handle], handleSize)) {
        return handle
      }
    }
  }

  return null
}

/**
 * スケール計算（ハンドルドラッグから）
 */
export const calculateScaleFromHandle = (
  handle: TransformHandlePosition,
  startPoint: Point,
  currentPoint: Point,
  originalBounds: Bounds,
  center: Point,
  options: {
    /** アスペクト比を維持 */
    preserveAspectRatio?: boolean
    /** 中心からスケール */
    scaleFromCenter?: boolean
  } = {}
): { x: number; y: number } => {
  const { preserveAspectRatio = false, scaleFromCenter = false } = options
  const info = HANDLE_INFO[handle]

  if (handle === 'rotation' || info.opposite === null) {
    return { x: 1, y: 1 }
  }

  // 固定点を計算（対角のハンドル位置または中心）
  let anchorX: number
  let anchorY: number

  if (scaleFromCenter) {
    anchorX = center.x
    anchorY = center.y
  } else {
    const oppositeInfo = HANDLE_INFO[info.opposite]
    anchorX = originalBounds.x + oppositeInfo.position.x * originalBounds.width
    anchorY = originalBounds.y + oppositeInfo.position.y * originalBounds.height
  }

  // ハンドルの元の位置
  const handleOriginalX = originalBounds.x + info.position.x * originalBounds.width
  const handleOriginalY = originalBounds.y + info.position.y * originalBounds.height

  // 移動量
  const dx = currentPoint.x - startPoint.x
  const dy = currentPoint.y - startPoint.y

  // 新しいハンドル位置
  const newHandleX = handleOriginalX + dx
  const newHandleY = handleOriginalY + dy

  // スケール計算
  let scaleX = 1
  let scaleY = 1

  const originalDistX = handleOriginalX - anchorX
  const originalDistY = handleOriginalY - anchorY
  const newDistX = newHandleX - anchorX
  const newDistY = newHandleY - anchorY

  // 水平方向のスケール
  if (handle.includes('left') || handle.includes('right')) {
    if (Math.abs(originalDistX) > 0.001) {
      scaleX = newDistX / originalDistX
    }
  }

  // 垂直方向のスケール
  if (handle.includes('top') || handle.includes('bottom')) {
    if (Math.abs(originalDistY) > 0.001) {
      scaleY = newDistY / originalDistY
    }
  }

  // 中央ハンドルの場合は一方向のみ
  if (handle === 'top-center' || handle === 'bottom-center') {
    scaleX = 1
  }
  if (handle === 'middle-left' || handle === 'middle-right') {
    scaleY = 1
  }

  // アスペクト比維持
  if (
    preserveAspectRatio &&
    handle !== 'top-center' &&
    handle !== 'bottom-center' &&
    handle !== 'middle-left' &&
    handle !== 'middle-right'
  ) {
    const uniformScale = Math.max(Math.abs(scaleX), Math.abs(scaleY))
    scaleX = scaleX >= 0 ? uniformScale : -uniformScale
    scaleY = scaleY >= 0 ? uniformScale : -uniformScale
  }

  return { x: scaleX, y: scaleY }
}

/**
 * 回転角度を計算（ハンドルドラッグから）
 */
export const calculateRotationFromHandle = (
  startPoint: Point,
  currentPoint: Point,
  center: Point,
  options: {
    /** 15度単位にスナップ */
    snapToAngle?: boolean
    /** スナップ角度（度） */
    snapAngleDegrees?: number
  } = {}
): number => {
  const { snapToAngle = false, snapAngleDegrees = 15 } = options

  // 開始点と現在点の角度を計算
  const startAngle = Math.atan2(startPoint.y - center.y, startPoint.x - center.x)
  const currentAngle = Math.atan2(currentPoint.y - center.y, currentPoint.x - center.x)

  let rotation = currentAngle - startAngle

  // 角度スナップ
  if (snapToAngle) {
    const snapRadians = (snapAngleDegrees * Math.PI) / 180
    rotation = Math.round(rotation / snapRadians) * snapRadians
  }

  return rotation
}

/**
 * 変形状態を初期化
 */
export const createInitialTransformState = (
  mode: TransformMode,
  bounds: Bounds,
  imageData: ImageData | null
): TransformState => ({
  mode,
  center: {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height / 2,
  },
  scale: { x: 1, y: 1 },
  rotation: 0,
  originalBounds: bounds,
  originalImageData: imageData,
})

/**
 * 変形モードを次に切り替え
 */
export const getNextTransformMode = (currentMode: TransformMode): TransformMode => {
  const modes: TransformMode[] = ['free-transform', 'scale', 'rotate']
  const currentIndex = modes.indexOf(currentMode)
  return modes[(currentIndex + 1) % modes.length]
}

/**
 * 変形状態を更新（スケール適用）
 */
export const applyScaleToTransform = (
  state: TransformState,
  scale: { x: number; y: number }
): TransformState => ({
  ...state,
  scale: {
    x: state.scale.x * scale.x,
    y: state.scale.y * scale.y,
  },
})

/**
 * 変形状態を更新（回転適用）
 */
export const applyRotationToTransform = (
  state: TransformState,
  rotation: number
): TransformState => ({
  ...state,
  rotation: state.rotation + rotation,
})

/**
 * ポイントが変形領域内にあるかを判定
 */
export const isPointInTransformBounds = (
  point: Point,
  bounds: Bounds,
  rotation: number,
  center: Point
): boolean => {
  // ポイントを逆回転して、軸整列バウンズでチェック
  const dx = point.x - center.x
  const dy = point.y - center.y
  const cos = Math.cos(-rotation)
  const sin = Math.sin(-rotation)
  const localX = dx * cos - dy * sin + center.x
  const localY = dx * sin + dy * cos + center.y

  return (
    localX >= bounds.x &&
    localX <= bounds.x + bounds.width &&
    localY >= bounds.y &&
    localY <= bounds.y + bounds.height
  )
}

/**
 * 変形後の4隅の座標を取得
 */
export const getTransformedCorners = (
  bounds: Bounds,
  scale: { x: number; y: number },
  rotation: number,
  center: Point
): Point[] => {
  const corners = [
    { x: bounds.x, y: bounds.y },
    { x: bounds.x + bounds.width, y: bounds.y },
    { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
    { x: bounds.x, y: bounds.y + bounds.height },
  ]

  const cos = Math.cos(rotation)
  const sin = Math.sin(rotation)

  return corners.map((corner) => {
    // 中心からの相対座標
    const dx = corner.x - center.x
    const dy = corner.y - center.y

    // スケール適用
    const sx = dx * scale.x
    const sy = dy * scale.y

    // 回転適用
    const rx = sx * cos - sy * sin
    const ry = sx * sin + sy * cos

    return {
      x: rx + center.x,
      y: ry + center.y,
    }
  })
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
