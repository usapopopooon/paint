import type { ReactNode } from 'react'
import { usePointerInput } from '../hooks'
import { BrushCursor } from './BrushCursor'
import type { PointerPoint } from '../types'
import type { CursorConfig } from '@/features/tools/types'

/**
 * PointerInputLayerコンポーネントのプロパティ
 */
type PointerInputLayerProps = {
  readonly children: ReactNode
  readonly onStart: (point: PointerPoint) => void
  readonly onMove: (point: PointerPoint) => void
  readonly onEnd: () => void
  readonly onWheel?: (deltaY: number) => void
  readonly cursor?: CursorConfig
  readonly className?: string
  /** ズーム倍率（座標変換に使用、デフォルト: 1） */
  readonly zoom?: number
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
  zoom = 1,
}: PointerInputLayerProps) => {
  const { pointerProps, pointerPosition, canvasRef } = usePointerInput({
    onStart,
    onMove,
    onEnd,
    onWheel,
    zoom,
  })

  return (
    <div
      ref={canvasRef}
      {...pointerProps}
      className={`relative ${className ?? ''}`}
      style={{ touchAction: 'none', cursor: cursor ? 'none' : undefined }}
    >
      {children}
      {cursor && pointerPosition && (
        <BrushCursor
          x={pointerPosition.x}
          y={pointerPosition.y}
          size={cursor.size}
          color={cursor.color}
          outline={cursor.outline}
        />
      )}
    </div>
  )
}
