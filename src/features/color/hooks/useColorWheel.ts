import { useCallback, useEffect, useRef, useState } from 'react'
import { hexToHsv, hsvToHex, type HSV } from '../utils/color'

export const WHEEL_SIZE = 200
export const RING_WIDTH = 16
export const SQUARE_SIZE = (WHEEL_SIZE / 2 - RING_WIDTH) * Math.sqrt(2) - 4

type DragMode = 'none' | 'hue' | 'sv'

type UseColorWheelProps = {
  color: string
  onChange: (color: string) => void
}

export const useColorWheel = ({ color, onChange }: UseColorWheelProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hsv, setHsv] = useState<HSV>(() => hexToHsv(color))
  const [dragMode, setDragMode] = useState<DragMode>('none')

  const getPositionFromEvent = useCallback((event: React.MouseEvent | MouseEvent) => {
    const container = containerRef.current
    if (!container) return null

    const rect = container.getBoundingClientRect()
    const centerX = WHEEL_SIZE / 2
    const centerY = WHEEL_SIZE / 2
    const x = event.clientX - rect.left - centerX
    const y = event.clientY - rect.top - centerY
    const distance = Math.sqrt(x * x + y * y)

    return { x, y, distance }
  }, [])

  const updateSV = useCallback(
    (x: number, y: number) => {
      const squareHalf = SQUARE_SIZE / 2
      const s = Math.max(0, Math.min(100, ((x + squareHalf) / SQUARE_SIZE) * 100))
      const v = Math.max(0, Math.min(100, (1 - (y + squareHalf) / SQUARE_SIZE) * 100))
      const newHsv = { h: hsv.h, s: Math.round(s), v: Math.round(v) }
      setHsv(newHsv)
      onChange(hsvToHex(newHsv.h, newHsv.s, newHsv.v))
    },
    [hsv.h, onChange]
  )

  const updateHue = useCallback(
    (x: number, y: number) => {
      const angle = Math.atan2(y, x) * (180 / Math.PI)
      const hue = (angle + 90 + 360) % 360
      const newHsv = { h: Math.round(hue), s: hsv.s, v: hsv.v }
      setHsv(newHsv)
      onChange(hsvToHex(newHsv.h, newHsv.s, newHsv.v))
    },
    [hsv.s, hsv.v, onChange]
  )

  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      const pos = getPositionFromEvent(event)
      if (!pos) return

      const { x, y, distance } = pos
      const squareHalf = SQUARE_SIZE / 2
      const innerRadius = WHEEL_SIZE / 2 - RING_WIDTH

      const padding = 8
      if (Math.abs(x) <= squareHalf + padding && Math.abs(y) <= squareHalf + padding) {
        setDragMode('sv')
        updateSV(x, y)
      } else if (distance >= innerRadius - padding && distance <= WHEEL_SIZE / 2 + padding) {
        setDragMode('hue')
        updateHue(x, y)
      }
    },
    [getPositionFromEvent, updateSV, updateHue]
  )

  const handleSvIndicatorMouseDown = useCallback((event: React.MouseEvent) => {
    event.stopPropagation()
    setDragMode('sv')
  }, [])

  const handleHueIndicatorMouseDown = useCallback((event: React.MouseEvent) => {
    event.stopPropagation()
    setDragMode('hue')
  }, [])

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (dragMode === 'none') return

      const pos = getPositionFromEvent(event)
      if (!pos) return

      const { x, y } = pos

      if (dragMode === 'sv') {
        updateSV(x, y)
      } else if (dragMode === 'hue') {
        updateHue(x, y)
      }
    },
    [dragMode, getPositionFromEvent, updateSV, updateHue]
  )

  const handleMouseUp = useCallback(() => {
    setDragMode('none')
  }, [])

  useEffect(() => {
    if (dragMode === 'none') return

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragMode, handleMouseMove, handleMouseUp])

  const setColor = useCallback((hex: string) => {
    setHsv(hexToHsv(hex))
  }, [])

  // インジケーター位置を計算
  const hueAngle = hsv.h - 90
  const ringMiddle = WHEEL_SIZE / 2 - RING_WIDTH / 2
  const hueIndicatorX = WHEEL_SIZE / 2 + Math.cos((hueAngle * Math.PI) / 180) * ringMiddle
  const hueIndicatorY = WHEEL_SIZE / 2 + Math.sin((hueAngle * Math.PI) / 180) * ringMiddle

  const svIndicatorX = (hsv.s / 100) * SQUARE_SIZE
  const svIndicatorY = (1 - hsv.v / 100) * SQUARE_SIZE

  return {
    containerRef,
    hsv,
    setColor,
    handleMouseDown,
    handleSvIndicatorMouseDown,
    handleHueIndicatorMouseDown,
    hueIndicatorX,
    hueIndicatorY,
    svIndicatorX,
    svIndicatorY,
  }
}
