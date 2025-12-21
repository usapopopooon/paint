import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from './ui/button'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

type ColorPickerProps = {
  readonly color: string
  readonly onChange: (color: string) => void
}

const WHEEL_SIZE = 200
const RING_WIDTH = 16
const SQUARE_SIZE = (WHEEL_SIZE / 2 - RING_WIDTH) * Math.sqrt(2) - 4

// HSV to Hex conversion
const hsvToHex = (h: number, s: number, v: number): string => {
  const sNorm = s / 100
  const vNorm = v / 100
  const c = vNorm * sNorm
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = vNorm - c

  let r = 0, g = 0, b = 0
  if (h < 60) { r = c; g = x; b = 0 }
  else if (h < 120) { r = x; g = c; b = 0 }
  else if (h < 180) { r = 0; g = c; b = x }
  else if (h < 240) { r = 0; g = x; b = c }
  else if (h < 300) { r = x; g = 0; b = c }
  else { r = c; g = 0; b = x }

  const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

// Hex to HSV conversion
const hexToHsv = (hex: string): { h: number; s: number; v: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return { h: 0, s: 0, v: 100 }

  const r = parseInt(result[1], 16) / 255
  const g = parseInt(result[2], 16) / 255
  const b = parseInt(result[3], 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const v = max
  const d = max - min
  const s = max === 0 ? 0 : d / max

  if (max === min) {
    return { h: 0, s: Math.round(s * 100), v: Math.round(v * 100) }
  }

  const h = (() => {
    switch (max) {
      case r:
        return ((g - b) / d + (g < b ? 6 : 0)) / 6
      case g:
        return ((b - r) / d + 2) / 6
      default:
        return ((r - g) / d + 4) / 6
    }
  })()

  return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) }
}

type DragMode = 'none' | 'hue' | 'sv'

export const ColorPicker = ({ color, onChange }: ColorPickerProps) => {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [hsv, setHsv] = useState(() => hexToHsv(color))
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

  const updateSV = useCallback((x: number, y: number) => {
    const squareHalf = SQUARE_SIZE / 2
    const s = Math.max(0, Math.min(100, ((x + squareHalf) / SQUARE_SIZE) * 100))
    const v = Math.max(0, Math.min(100, (1 - (y + squareHalf) / SQUARE_SIZE) * 100))
    const newHsv = { h: hsv.h, s: Math.round(s), v: Math.round(v) }
    setHsv(newHsv)
    onChange(hsvToHex(newHsv.h, newHsv.s, newHsv.v))
  }, [hsv.h, onChange])

  const updateHue = useCallback((x: number, y: number) => {
    const angle = Math.atan2(y, x) * (180 / Math.PI)
    const hue = (angle + 90 + 360) % 360
    const newHsv = { h: Math.round(hue), s: hsv.s, v: hsv.v }
    setHsv(newHsv)
    onChange(hsvToHex(newHsv.h, newHsv.s, newHsv.v))
  }, [hsv.s, hsv.v, onChange])

  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      const pos = getPositionFromEvent(event)
      if (!pos) return

      const { x, y, distance } = pos
      const squareHalf = SQUARE_SIZE / 2
      const innerRadius = WHEEL_SIZE / 2 - RING_WIDTH

      // Add some padding to make edge indicators easier to grab
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

  const handleSvIndicatorMouseDown = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation()
      setDragMode('sv')
    },
    []
  )

  const handleHueIndicatorMouseDown = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation()
      setDragMode('hue')
    },
    []
  )

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

  // Calculate indicator positions
  const hueAngle = hsv.h - 90
  const ringMiddle = WHEEL_SIZE / 2 - RING_WIDTH / 2
  const hueIndicatorX = WHEEL_SIZE / 2 + Math.cos((hueAngle * Math.PI) / 180) * ringMiddle
  const hueIndicatorY = WHEEL_SIZE / 2 + Math.sin((hueAngle * Math.PI) / 180) * ringMiddle

  const svIndicatorX = (hsv.s / 100) * SQUARE_SIZE
  const svIndicatorY = (1 - hsv.v / 100) * SQUARE_SIZE

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="size-8 p-0 border-2"
          style={{ backgroundColor: color }}
          aria-label="Pick color"
        >
          <span className="sr-only">Pick color</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <div className="flex flex-col gap-3">
          <div
            ref={containerRef}
            className="relative cursor-crosshair"
            style={{ width: WHEEL_SIZE, height: WHEEL_SIZE }}
            onMouseDown={handleMouseDown}
          >
            {/* Hue wheel using conic-gradient */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'conic-gradient(from 0deg, hsl(0, 100%, 50%), hsl(60, 100%, 50%), hsl(120, 100%, 50%), hsl(180, 100%, 50%), hsl(240, 100%, 50%), hsl(300, 100%, 50%), hsl(360, 100%, 50%))',
              }}
            />
            {/* Inner circle mask */}
            <div
              className="absolute rounded-full bg-background"
              style={{
                top: RING_WIDTH,
                left: RING_WIDTH,
                right: RING_WIDTH,
                bottom: RING_WIDTH,
              }}
            />

            {/* SV square */}
            <div
              className="absolute"
              style={{
                width: SQUARE_SIZE,
                height: SQUARE_SIZE,
                top: (WHEEL_SIZE - SQUARE_SIZE) / 2,
                left: (WHEEL_SIZE - SQUARE_SIZE) / 2,
                background: `
                  linear-gradient(to top, #000, transparent),
                  linear-gradient(to right, #fff, hsl(${hsv.h}, 100%, 50%))
                `,
              }}
            />

            {/* SV indicator */}
            <div
              className="absolute"
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                border: '2px solid white',
                boxShadow: 'inset 0 0 0 1px black, 0 0 0 1px black',
                top: (WHEEL_SIZE - SQUARE_SIZE) / 2 + svIndicatorY - 6,
                left: (WHEEL_SIZE - SQUARE_SIZE) / 2 + svIndicatorX - 6,
              }}
              onMouseDown={handleSvIndicatorMouseDown}
            />

            {/* Hue indicator */}
            <div
              className="absolute"
              style={{
                width: RING_WIDTH - 4,
                height: RING_WIDTH - 4,
                borderRadius: '50%',
                border: '2px solid white',
                boxShadow: 'inset 0 0 0 1px black, 0 0 0 1px black',
                top: hueIndicatorY - (RING_WIDTH - 4) / 2,
                left: hueIndicatorX - (RING_WIDTH - 4) / 2,
              }}
              onMouseDown={handleHueIndicatorMouseDown}
            />
          </div>
          <div className="flex items-center gap-2">
            <div
              className="size-6 rounded border border-border"
              style={{ backgroundColor: color }}
            />
            <span className="text-sm font-mono text-foreground">{color.toUpperCase()}</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
