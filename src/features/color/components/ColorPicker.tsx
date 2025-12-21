import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useColorWheel, WHEEL_SIZE, RING_WIDTH, SQUARE_SIZE } from '../hooks/useColorWheel'

type ColorPickerProps = {
  readonly color: string
  readonly onChange: (color: string) => void
}

export const ColorPicker = ({ color, onChange }: ColorPickerProps) => {
  const [open, setOpen] = useState(false)
  const {
    containerRef,
    hsv,
    handleMouseDown,
    handleSvIndicatorMouseDown,
    handleHueIndicatorMouseDown,
    hueIndicatorX,
    hueIndicatorY,
    svIndicatorX,
    svIndicatorY,
  } = useColorWheel({ color, onChange })

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
                background:
                  'conic-gradient(from 0deg, hsl(0, 100%, 50%), hsl(60, 100%, 50%), hsl(120, 100%, 50%), hsl(180, 100%, 50%), hsl(240, 100%, 50%), hsl(300, 100%, 50%), hsl(360, 100%, 50%))',
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
            <div className="size-6 rounded border border-border" style={{ backgroundColor: color }} />
            <span className="text-sm font-mono text-foreground">{color.toUpperCase()}</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
