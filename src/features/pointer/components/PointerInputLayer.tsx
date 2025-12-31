import { useCallback, useRef, type CSSProperties, type ReactNode } from 'react'
import { usePointerInput } from '../hooks'
import { BrushCursor, type BrushCursorHandle } from './BrushCursor'
import type { PointerPoint } from '../types'
import type { CursorConfig } from '@/features/tools/types'

/**
 * PointerInputLayerコンポーネントのプロパティ
 */
type PointerInputLayerProps = {
  readonly children?: ReactNode
  readonly onStart: (point: PointerPoint) => void
  readonly onMove: (point: PointerPoint) => void
  readonly onEnd: () => void
  readonly onWheel?: (deltaY: number) => void
  readonly cursor?: CursorConfig
  readonly className?: string
  readonly style?: CSSProperties
  /** ズーム倍率（座標変換に使用、デフォルト: 1） */
  readonly zoom?: number
  /** 無効化（イベントを処理しない、カーソルも非表示） */
  readonly disabled?: boolean
}

/**
 * ポインター入力とカスタムカーソルを提供するレイヤーコンポーネント
 * @param props - PointerInputLayerコンポーネントのプロパティ
 */
export const PointerInputLayer = ({
  children,
  onStart,
  onMove,
  onEnd,
  onWheel,
  cursor,
  className,
  style,
  zoom = 1,
  disabled = false,
}: PointerInputLayerProps) => {
  const brushCursorRef = useRef<BrushCursorHandle>(null)

  // ポインター位置が更新された時にBrushCursorを直接更新（パフォーマンスのため）
  const handlePointerPositionChange = useCallback((x: number, y: number) => {
    brushCursorRef.current?.updatePosition(x, y)
    brushCursorRef.current?.show()
  }, [])

  // ポインターがキャンバスを離れた時にBrushCursorを非表示
  const handlePointerLeaveCanvas = useCallback(() => {
    brushCursorRef.current?.hide()
  }, [])

  const { pointerProps, canvasRef } = usePointerInput({
    onStart,
    onMove,
    onEnd,
    onWheel,
    zoom,
    onPointerPositionChange: handlePointerPositionChange,
    onPointerLeaveCanvas: handlePointerLeaveCanvas,
  })

  // 無効時はイベントを処理せず、カーソルも表示しない
  const effectivePointerProps = disabled ? {} : pointerProps
  const showCursor = !disabled && cursor

  return (
    <div
      ref={canvasRef}
      {...effectivePointerProps}
      className={`relative ${className ?? ''}`}
      style={{ touchAction: 'none', cursor: showCursor ? 'none' : undefined, ...style }}
    >
      {children}
      {showCursor && (
        <BrushCursor
          ref={brushCursorRef}
          size={cursor.size}
          color={cursor.color}
          outline={cursor.outline}
        />
      )}
    </div>
  )
}
