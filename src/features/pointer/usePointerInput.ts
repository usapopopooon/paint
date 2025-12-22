import { useCallback, useRef, useState } from 'react'
import type { PointerPoint, PointerType, PointerInputHandlers } from './types'

type UsePointerInputOptions = {
  onStart: (point: PointerPoint) => void
  onMove: (point: PointerPoint) => void
  onEnd: () => void
  onWheel?: (deltaY: number) => void
}

type PointerInputProps = {
  onPointerDown: (event: React.PointerEvent<HTMLElement>) => void
  onPointerMove: (event: React.PointerEvent<HTMLElement>) => void
  onPointerUp: (event: React.PointerEvent<HTMLElement>) => void
  onPointerLeave: (event: React.PointerEvent<HTMLElement>) => void
  onPointerEnter: (event: React.PointerEvent<HTMLElement>) => void
  onWheel: (event: React.WheelEvent<HTMLElement>) => void
}

type UsePointerInputReturn = {
  pointerProps: PointerInputProps
  pointerPosition: { x: number; y: number } | null
  isDrawing: boolean
}

const getPointerType = (event: React.PointerEvent): PointerType => {
  switch (event.pointerType) {
    case 'pen':
      return 'pen'
    case 'touch':
      return 'touch'
    default:
      return 'mouse'
  }
}

const getPointerPoint = (
  event: React.PointerEvent<HTMLElement>,
  element: HTMLElement
): PointerPoint => {
  const rect = element.getBoundingClientRect()
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
    pressure: event.pressure,
    pointerType: getPointerType(event),
  }
}

export const usePointerInput = ({
  onStart,
  onMove,
  onEnd,
  onWheel,
}: UsePointerInputOptions): UsePointerInputReturn => {
  const isDrawingRef = useRef(false)
  const [pointerPosition, setPointerPosition] = useState<{ x: number; y: number } | null>(null)

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      const element = event.currentTarget
      element.setPointerCapture(event.pointerId)
      isDrawingRef.current = true
      const point = getPointerPoint(event, element)
      setPointerPosition({ x: point.x, y: point.y })
      onStart(point)
    },
    [onStart]
  )

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      const element = event.currentTarget
      const point = getPointerPoint(event, element)
      setPointerPosition({ x: point.x, y: point.y })
      if (!isDrawingRef.current) return
      onMove(point)
    },
    [onMove]
  )

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      const element = event.currentTarget
      element.releasePointerCapture(event.pointerId)
      if (!isDrawingRef.current) return
      isDrawingRef.current = false
      onEnd()
    },
    [onEnd]
  )

  const handlePointerLeave = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      setPointerPosition(null)
      if (isDrawingRef.current) {
        isDrawingRef.current = false
        onEnd()
      }
    },
    [onEnd]
  )

  const handlePointerEnter = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      const element = event.currentTarget
      const point = getPointerPoint(event, element)
      setPointerPosition({ x: point.x, y: point.y })
    },
    []
  )

  const handleWheel = useCallback(
    (event: React.WheelEvent<HTMLElement>) => {
      if (onWheel) {
        event.preventDefault()
        onWheel(event.deltaY)
      }
    },
    [onWheel]
  )

  return {
    pointerProps: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerLeave: handlePointerLeave,
      onPointerEnter: handlePointerEnter,
      onWheel: handleWheel,
    },
    pointerPosition,
    isDrawing: isDrawingRef.current,
  }
}
