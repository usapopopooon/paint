import { useRef, useEffect, useCallback } from 'react'
import type { Point } from '@/lib/geometry'
import type { SelectionRegion, SelectionToolType, TransformState } from '../types'
import { MARCHING_ANTS_SPEED } from '../constants'
import {
  renderSelection2D,
  renderRectanglePreview2D,
  renderLassoPreview2D,
} from '../adapters/canvas'
import { TransformHandles } from './TransformHandles'

type SelectionOverlayProps = {
  /** キャンバスの幅 */
  readonly width: number
  /** キャンバスの高さ */
  readonly height: number
  /** 確定済みの選択領域 */
  readonly region: SelectionRegion | null
  /** 選択中のポイント（プレビュー用） */
  readonly selectionPoints: readonly Point[]
  /** 選択ツールタイプ */
  readonly toolType: SelectionToolType
  /** 選択中かどうか */
  readonly isSelecting: boolean
  /** ズームレベル */
  readonly scale?: number
  /** オフセット */
  readonly offset?: Point
  /** 変形状態（変形中の場合） */
  readonly transformState?: TransformState | null
  /** 変形プレビュー用ImageData */
  readonly previewImageData?: ImageData | null
}

/**
 * 選択領域のオーバーレイコンポーネント
 * マーチングアンツアニメーションを描画
 */
export const SelectionOverlay = ({
  width,
  height,
  region,
  selectionPoints,
  toolType,
  isSelecting,
  scale = 1,
  offset = { x: 0, y: 0 },
  transformState,
  previewImageData,
}: SelectionOverlayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const dashOffsetRef = useRef(0)
  const lastTimeRef = useRef(0)

  // 最新の状態を保持するRef
  const stateRef = useRef({
    region,
    selectionPoints,
    toolType,
    isSelecting,
    scale,
    offset,
  })

  // 状態が変わったらRefを更新
  useEffect(() => {
    stateRef.current = {
      region,
      selectionPoints,
      toolType,
      isSelecting,
      scale,
      offset,
    }
  }, [region, selectionPoints, toolType, isSelecting, scale, offset])

  /**
   * 描画処理
   */
  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const state = stateRef.current

    // クリア
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // スケールとオフセットを適用
    ctx.save()
    ctx.translate(state.offset.x, state.offset.y)
    ctx.scale(state.scale, state.scale)

    // 選択中のプレビュー描画
    if (state.isSelecting && state.selectionPoints.length >= 2) {
      if (state.toolType === 'select-rectangle') {
        renderRectanglePreview2D(
          ctx,
          state.selectionPoints[0],
          state.selectionPoints[state.selectionPoints.length - 1],
          dashOffsetRef.current
        )
      } else {
        renderLassoPreview2D(ctx, state.selectionPoints, dashOffsetRef.current)
      }
    }

    // 確定済み選択領域の描画
    if (state.region) {
      renderSelection2D(ctx, state.region, { dashOffset: dashOffsetRef.current })
    }

    ctx.restore()
  }, [])

  /**
   * アニメーションループ
   */
  useEffect(() => {
    const shouldAnimate = region || isSelecting
    if (!shouldAnimate) {
      // アニメーション不要の場合はクリア
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
        }
      }
      return
    }

    lastTimeRef.current = performance.now()

    const animate = (timestamp: number) => {
      // ダッシュオフセットを更新（マーチングアンツ効果）
      const elapsed = timestamp - lastTimeRef.current
      if (elapsed > 16) {
        // 約60fps
        dashOffsetRef.current -= MARCHING_ANTS_SPEED * (elapsed / 1000)
        lastTimeRef.current = timestamp
      }

      render()

      // 選択領域があるか選択中の場合はアニメーション継続
      const state = stateRef.current
      if (state.region || state.isSelecting) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
    }
  }, [region, isSelecting, render])

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

  // 変形中の場合はTransformHandlesを表示
  if (transformState) {
    return (
      <TransformHandles
        width={width}
        height={height}
        transformState={transformState}
        scale={scale}
        offset={offset}
        previewImageData={previewImageData}
      />
    )
  }

  // 選択領域も選択中でもない場合は何も表示しない
  if (!region && !isSelecting) {
    return null
  }

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
