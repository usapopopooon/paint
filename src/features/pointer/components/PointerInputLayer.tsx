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
}: PointerInputLayerProps) => {
  const { pointerProps, pointerPosition, canvasRef } = usePointerInput({
    onStart,
    onMove,
    onEnd,
    onWheel,
  })

  return (
    <div
      ref={canvasRef}
      {...pointerProps}
      className={`relative ${className ?? ''}`}
      style={{ touchAction: 'none', cursor: 'none' }}
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
