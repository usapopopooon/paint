import { useCallback, useRef, useState } from 'react'
import type { PointerPoint, PointerType } from './types'
import { getPointerType, getPointerPoint } from './pointerUtils'

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
  onPointerCancel: (event: React.PointerEvent<HTMLElement>) => void
  onPointerLeave: (event: React.PointerEvent<HTMLElement>) => void
  onPointerEnter: (event: React.PointerEvent<HTMLElement>) => void
  onWheel: (event: React.WheelEvent<HTMLElement>) => void
  onContextMenu: (event: React.MouseEvent<HTMLElement>) => void
}

type UsePointerInputReturn = {
  pointerProps: PointerInputProps
  pointerPosition: { x: number; y: number } | null
  isDrawing: boolean
  activePointerType: PointerType | null
}

const extractPointerPoint = (
  event: React.PointerEvent<HTMLElement>,
  element: HTMLElement
): PointerPoint => {
  const rect = element.getBoundingClientRect()
  const pointerType = getPointerType(event.pointerType)
  return getPointerPoint(event.clientX, event.clientY, rect, event.pressure, pointerType)
}

export const usePointerInput = ({
  onStart,
  onMove,
  onEnd,
  onWheel,
}: UsePointerInputOptions): UsePointerInputReturn => {
  // Track the active pointer ID to prevent multi-pointer conflicts
  const activePointerIdRef = useRef<number | null>(null)
  const activePointerTypeRef = useRef<PointerType | null>(null)
  const [pointerPosition, setPointerPosition] = useState<{ x: number; y: number } | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  const endStroke = useCallback(() => {
    if (activePointerIdRef.current !== null) {
      activePointerIdRef.current = null
      activePointerTypeRef.current = null
      setIsDrawing(false)
      onEnd()
    }
  }, [onEnd])

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      // Ignore if already drawing with another pointer (prevents multi-touch conflicts)
      if (activePointerIdRef.current !== null) {
        return
      }

      // Only handle primary button (left mouse button, touch, or pen contact)
      if (event.button !== 0) {
        return
      }

      const element = event.currentTarget

      // Capture the pointer to receive events even if it leaves the element
      try {
        element.setPointerCapture(event.pointerId)
      } catch {
        // setPointerCapture can fail in some edge cases, continue anyway
      }

      activePointerIdRef.current = event.pointerId
      activePointerTypeRef.current = getPointerType(event.pointerType)
      setIsDrawing(true)

      const point = extractPointerPoint(event, element)
      setPointerPosition({ x: point.x, y: point.y })
      onStart(point)
    },
    [onStart]
  )

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      const element = event.currentTarget
      const point = extractPointerPoint(event, element)
      setPointerPosition({ x: point.x, y: point.y })

      // Only process move events for the active pointer
      if (activePointerIdRef.current !== event.pointerId) {
        return
      }

      onMove(point)
    },
    [onMove]
  )

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      // Only handle the active pointer
      if (activePointerIdRef.current !== event.pointerId) {
        return
      }

      const element = event.currentTarget

      // Release pointer capture
      try {
        element.releasePointerCapture(event.pointerId)
      } catch {
        // releasePointerCapture can fail if capture was already released
      }

      endStroke()
    },
    [endStroke]
  )

  const handlePointerCancel = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      // Handle interrupted pointer (e.g., system gesture, palm rejection)
      if (activePointerIdRef.current !== event.pointerId) {
        return
      }

      endStroke()
    },
    [endStroke]
  )

  const handlePointerLeave = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      // If we have pointer capture, we'll still receive events, so don't end stroke
      // Only clear position for non-captured pointers
      if (activePointerIdRef.current !== event.pointerId) {
        setPointerPosition(null)
        return
      }

      // For the active pointer, check if we still have capture
      // If not (shouldn't happen normally), end the stroke
      try {
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
          setPointerPosition(null)
          endStroke()
        }
      } catch {
        setPointerPosition(null)
        endStroke()
      }
    },
    [endStroke]
  )

  const handlePointerEnter = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      const element = event.currentTarget
      const point = extractPointerPoint(event, element)
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

  const handleContextMenu = useCallback((event: React.MouseEvent<HTMLElement>) => {
    // Prevent context menu on right-click or long-press
    event.preventDefault()
  }, [])

  return {
    pointerProps: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerCancel,
      onPointerLeave: handlePointerLeave,
      onPointerEnter: handlePointerEnter,
      onWheel: handleWheel,
      onContextMenu: handleContextMenu,
    },
    pointerPosition,
    isDrawing,
    activePointerType: activePointerTypeRef.current,
  }
}
