import type { Point, Bounds } from '@/lib/geometry'
import type { SelectionShape, SelectionRegion } from '../../types'
import { MARCHING_ANTS_DASH } from '../../constants'

/**
 * マーチングアンツのスタイル設定
 */
type MarchingAntsStyle = {
  /** 線のダッシュパターン */
  readonly dash: readonly number[]
  /** ダッシュオフセット（アニメーション用） */
  readonly dashOffset: number
  /** 線の太さ */
  readonly lineWidth: number
}

const DEFAULT_STYLE: MarchingAntsStyle = {
  dash: MARCHING_ANTS_DASH,
  dashOffset: 0,
  lineWidth: 1,
}

/**
 * 矩形パスを描画
 */
const drawRectanglePath = (ctx: CanvasRenderingContext2D, bounds: Bounds, offset: Point): void => {
  ctx.beginPath()
  ctx.rect(bounds.x + offset.x, bounds.y + offset.y, bounds.width, bounds.height)
}

/**
 * Lassoパスを描画
 */
const drawLassoPath = (
  ctx: CanvasRenderingContext2D,
  points: readonly Point[],
  offset: Point
): void => {
  if (points.length < 2) return

  ctx.beginPath()
  const [first, ...rest] = points
  ctx.moveTo(first.x + offset.x, first.y + offset.y)

  rest.forEach((point) => {
    ctx.lineTo(point.x + offset.x, point.y + offset.y)
  })

  ctx.closePath()
}

/**
 * 選択領域をマーチングアンツとして描画
 * @param ctx - Canvas 2D コンテキスト
 * @param region - 選択領域
 * @param style - マーチングアンツのスタイル
 */
export const renderSelection2D = (
  ctx: CanvasRenderingContext2D,
  region: SelectionRegion,
  style: Partial<MarchingAntsStyle> = {}
): void => {
  const { shape, offset } = region
  const mergedStyle = { ...DEFAULT_STYLE, ...style }

  ctx.save()

  // パスを描画
  if (shape.type === 'rectangle') {
    drawRectanglePath(ctx, shape.bounds, offset)
  } else {
    drawLassoPath(ctx, shape.points, offset)
  }

  // 1回目: 白い実線（背景）
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = mergedStyle.lineWidth
  ctx.setLineDash([])
  ctx.stroke()

  // 2回目: 黒い破線（マーチングアンツ）
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = mergedStyle.lineWidth
  ctx.setLineDash([...mergedStyle.dash])
  ctx.lineDashOffset = mergedStyle.dashOffset
  ctx.stroke()

  ctx.restore()
}

/**
 * 選択中のプレビューを描画（確定前）
 * @param ctx - Canvas 2D コンテキスト
 * @param shape - 選択形状
 * @param dashOffset - ダッシュオフセット
 */
export const renderSelectionPreview2D = (
  ctx: CanvasRenderingContext2D,
  shape: SelectionShape,
  dashOffset: number = 0
): void => {
  ctx.save()

  // パスを描画
  if (shape.type === 'rectangle') {
    drawRectanglePath(ctx, shape.bounds, { x: 0, y: 0 })
  } else {
    if (shape.points.length < 2) {
      ctx.restore()
      return
    }

    ctx.beginPath()
    const [first, ...rest] = shape.points
    ctx.moveTo(first.x, first.y)

    rest.forEach((point) => {
      ctx.lineTo(point.x, point.y)
    })
    // プレビュー中は閉じない（最後のポイントまで描画）
  }

  // 薄い塗りつぶし
  ctx.fillStyle = 'rgba(0, 120, 215, 0.1)'
  ctx.fill()

  // 白い実線（背景）
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 1
  ctx.setLineDash([])
  ctx.stroke()

  // 破線
  ctx.strokeStyle = '#0078d7'
  ctx.lineWidth = 1
  ctx.setLineDash([...MARCHING_ANTS_DASH])
  ctx.lineDashOffset = dashOffset
  ctx.stroke()

  ctx.restore()
}

/**
 * 矩形選択のプレビューを描画（開始点と現在の点から）
 * @param ctx - Canvas 2D コンテキスト
 * @param start - 開始点
 * @param current - 現在の点
 * @param dashOffset - ダッシュオフセット
 */
export const renderRectanglePreview2D = (
  ctx: CanvasRenderingContext2D,
  start: Point,
  current: Point,
  dashOffset: number = 0
): void => {
  const bounds: Bounds = {
    x: Math.min(start.x, current.x),
    y: Math.min(start.y, current.y),
    width: Math.abs(current.x - start.x),
    height: Math.abs(current.y - start.y),
  }

  renderSelectionPreview2D(ctx, { type: 'rectangle', bounds }, dashOffset)
}

/**
 * Lasso選択のプレビューを描画（ポイント配列から）
 * @param ctx - Canvas 2D コンテキスト
 * @param points - ポイント配列
 * @param dashOffset - ダッシュオフセット
 */
export const renderLassoPreview2D = (
  ctx: CanvasRenderingContext2D,
  points: readonly Point[],
  dashOffset: number = 0
): void => {
  if (points.length < 2) return

  ctx.save()

  ctx.beginPath()
  const [first, ...rest] = points
  ctx.moveTo(first.x, first.y)

  rest.forEach((point) => {
    ctx.lineTo(point.x, point.y)
  })

  // 閉じる線を薄く描画（プレビュー用）
  ctx.lineTo(first.x, first.y)

  // 薄い塗りつぶし
  ctx.fillStyle = 'rgba(0, 120, 215, 0.1)'
  ctx.fill()

  // 白い実線（背景）
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 1
  ctx.setLineDash([])
  ctx.stroke()

  // 破線
  ctx.strokeStyle = '#0078d7'
  ctx.lineWidth = 1
  ctx.setLineDash([...MARCHING_ANTS_DASH])
  ctx.lineDashOffset = dashOffset
  ctx.stroke()

  ctx.restore()
}
