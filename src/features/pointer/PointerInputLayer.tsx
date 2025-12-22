import { type ReactNode, useEffect } from 'react'
import { usePointerInput } from './usePointerInput'
import type { PointerPoint } from './types'

type PointerInputLayerProps = {
  readonly children: ReactNode
  readonly onStart: (point: PointerPoint) => void
  readonly onMove: (point: PointerPoint) => void
  readonly onEnd: () => void
  readonly onWheel?: (deltaY: number) => void
  readonly onPositionChange?: (position: { x: number; y: number } | null) => void
  readonly className?: string
}

export const PointerInputLayer = ({
  children,
  onStart,
  onMove,
  onEnd,
  onWheel,
  onPositionChange,
  className,
}: PointerInputLayerProps) => {
  const { pointerProps, pointerPosition } = usePointerInput({
    onStart,
    onMove,
    onEnd,
    onWheel,
  })

  // Notify parent of position changes
  useEffect(() => {
    onPositionChange?.(pointerPosition)
  }, [onPositionChange, pointerPosition])

  return (
    <div
      {...pointerProps}
      className={className}
      style={{ touchAction: 'none', cursor: 'none' }}
    >
      {children}
    </div>
  )
}
