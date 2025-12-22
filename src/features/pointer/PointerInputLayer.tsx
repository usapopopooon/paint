import type { ReactNode } from 'react'
import { usePointerInput } from './usePointerInput'
import { BrushCursor } from './BrushCursor'
import type { PointerPoint } from './types'

type CursorConfig = {
  readonly size: number
  readonly color: string
}

type PointerInputLayerProps = {
  readonly children: ReactNode
  readonly onStart: (point: PointerPoint) => void
  readonly onMove: (point: PointerPoint) => void
  readonly onEnd: () => void
  readonly onWheel?: (deltaY: number) => void
  readonly cursor?: CursorConfig
  readonly className?: string
}

export const PointerInputLayer = ({
  children,
  onStart,
  onMove,
  onEnd,
  onWheel,
  cursor,
  className,
}: PointerInputLayerProps) => {
  const { pointerProps, pointerPosition } = usePointerInput({
    onStart,
    onMove,
    onEnd,
    onWheel,
  })

  return (
    <div
      {...pointerProps}
      className={`relative ${className ?? ''}`}
      style={{ touchAction: 'none', cursor: 'none' }}
    >
      {children}
      {cursor && pointerPosition && (
        <BrushCursor x={pointerPosition.x} y={pointerPosition.y} size={cursor.size} color={cursor.color} />
      )}
    </div>
  )
}
