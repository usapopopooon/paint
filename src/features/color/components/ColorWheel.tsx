import { ClipboardPaste, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { TranslationKey } from '@/features/i18n'
import { useColorWheel, WHEEL_SIZE, RING_WIDTH, SQUARE_SIZE } from '../hooks/useColorWheel'
import { isValidHex, normalizeHex } from '../helpers'

/**
 * ColorWheelコンポーネントのプロパティ
 */
type ColorWheelProps = {
  readonly color: string
  readonly onChange: (color: string) => void
  readonly t: (key: TranslationKey) => string
}

/**
 * HSVカラーホイールコンポーネント
 * 色相リングと彩度・明度の正方形で色を選択
 * @param props - ColorWheelコンポーネントのプロパティ
 */
export const ColorWheel = ({ color, onChange, t }: ColorWheelProps) => {
  const {
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
  } = useColorWheel({ color, onChange })

  return (
    <div
      className="flex flex-col gap-3"
      onWheel={(e) => e.stopPropagation()}
    >
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
        <input
          type="text"
          value={color.toUpperCase()}
          onChange={(e) => {
            const text = e.target.value.trim()
            if (isValidHex(text)) {
              const normalized = normalizeHex(text)
              setColor(normalized)
              onChange(normalized)
            }
          }}
          onClick={(e) => {
            ;(e.target as HTMLInputElement).select()
          }}
          className="w-20 px-1 py-0.5 text-sm font-mono text-foreground bg-transparent border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={() => navigator.clipboard.writeText(color.toUpperCase())}
              aria-label={t('color.copy')}
            >
              <Copy className="size-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('color.copy')}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={async () => {
                const text = await navigator.clipboard.readText()
                if (isValidHex(text.trim())) {
                  const normalized = normalizeHex(text.trim())
                  setColor(normalized)
                  onChange(normalized)
                }
              }}
              aria-label={t('color.paste')}
            >
              <ClipboardPaste className="size-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('color.paste')}</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}
