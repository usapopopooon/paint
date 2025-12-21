import { useCallback, useRef, useState } from 'react'
import { Button } from './ui/button'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

type ColorPickerProps = {
  readonly color: string
  readonly onChange: (color: string) => void
}

const WHEEL_SIZE = 200
const WHEEL_RADIUS = WHEEL_SIZE / 2
const INNER_RADIUS = WHEEL_RADIUS * 0.7

const hslToHex = (h: number, s: number, l: number): string => {
  const hDecimal = l / 100
  const a = (s * Math.min(hDecimal, 1 - hDecimal)) / 100
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = hDecimal - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

const hexToHsl = (hex: string): { h: number; s: number; l: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return { h: 0, s: 0, l: 0 }

  const r = parseInt(result[1], 16) / 255
  const g = parseInt(result[2], 16) / 255
  const b = parseInt(result[3], 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2

  if (max === min) {
    return { h: 0, s: 0, l: Math.round(l * 100) }
  }

  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

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

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

export const ColorPicker = ({ color, onChange }: ColorPickerProps) => {
  const [open, setOpen] = useState(false)
  const wheelRef = useRef<HTMLCanvasElement>(null)
  const [hsl, setHsl] = useState(() => hexToHsl(color))

  const drawWheel = useCallback((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const centerX = WHEEL_RADIUS
    const centerY = WHEEL_RADIUS

    // Draw color wheel
    for (let angle = 0; angle < 360; angle++) {
      const startAngle = ((angle - 1) * Math.PI) / 180
      const endAngle = ((angle + 1) * Math.PI) / 180

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, WHEEL_RADIUS, startAngle, endAngle)
      ctx.closePath()

      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        WHEEL_RADIUS
      )
      gradient.addColorStop(0, `hsl(${angle}, 0%, 100%)`)
      gradient.addColorStop(0.5, `hsl(${angle}, 100%, 50%)`)
      gradient.addColorStop(1, `hsl(${angle}, 100%, 50%)`)
      ctx.fillStyle = gradient
      ctx.fill()
    }

    // Draw inner circle (lightness)
    ctx.beginPath()
    ctx.arc(centerX, centerY, INNER_RADIUS, 0, Math.PI * 2)
    ctx.fillStyle = hslToHex(hsl.h, hsl.s, hsl.l)
    ctx.fill()
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.stroke()
  }, [hsl])

  const handleWheelClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = wheelRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = event.clientX - rect.left - WHEEL_RADIUS
      const y = event.clientY - rect.top - WHEEL_RADIUS
      const distance = Math.sqrt(x * x + y * y)

      if (distance <= INNER_RADIUS) {
        // Clicked on center - do nothing or could add lightness adjustment
        return
      }

      if (distance <= WHEEL_RADIUS) {
        const angle = Math.atan2(y, x) * (180 / Math.PI)
        const hue = (angle + 360) % 360
        const saturation = Math.min(100, (distance / WHEEL_RADIUS) * 100)

        const newHsl = { h: Math.round(hue), s: Math.round(saturation), l: 50 }
        setHsl(newHsl)
        onChange(hslToHex(newHsl.h, newHsl.s, newHsl.l))
      }
    },
    [onChange]
  )

  const handleCanvasRef = useCallback(
    (canvas: HTMLCanvasElement | null) => {
      if (canvas) {
        (wheelRef as React.MutableRefObject<HTMLCanvasElement>).current = canvas
        drawWheel(canvas)
      }
    },
    [drawWheel]
  )

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
          <canvas
            ref={handleCanvasRef}
            width={WHEEL_SIZE}
            height={WHEEL_SIZE}
            onClick={handleWheelClick}
            className="cursor-crosshair rounded-full"
          />
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
