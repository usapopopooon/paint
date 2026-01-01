import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ClipboardPaste, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useTranslation } from '@/features/i18n'
import { toast } from 'sonner'
import { useColorWheel } from '../hooks/useColorWheel'
import { WHEEL_SIZE, RING_WIDTH, SQUARE_SIZE, HSV_MIN, HSV_MAX } from '../constants'
import { normalizeHex, getColorNameKey } from '../helpers'
import { hexColorSchema } from '../domain'

const colorInputSchema = z.object({
  color: hexColorSchema,
})

type ColorInputForm = z.infer<typeof colorInputSchema>

/**
 * ColorWheelコンポーネントのプロパティ
 */
type ColorWheelProps = {
  readonly color: string
  readonly onChange: (color: string) => void
}

/**
 * HSVカラーホイールコンポーネント
 * 色相リングと彩度・明度の正方形で色を選択
 * @param props - ColorWheelコンポーネントのプロパティ
 */
export const ColorWheel = ({ color, onChange }: ColorWheelProps) => {
  const { t } = useTranslation()
  const {
    containerRef,
    hsv,
    setColor,
    handlePointerDown,
    handleHueKeyDown,
    handleSvKeyDown,
    hueIndicatorX,
    hueIndicatorY,
    svIndicatorX,
    svIndicatorY,
  } = useColorWheel({ color, onChange })

  const colorName = t(getColorNameKey(hsv.h))
  const hueValueText = t('color.hueValue', { color: colorName })
  const svValueText = t('color.svValue', { s: hsv.s, v: hsv.v })

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ColorInputForm>({
    resolver: zodResolver(colorInputSchema),
    defaultValues: { color: color.toUpperCase() },
  })

  // 外部からcolorが変更された場合にフォームを更新
  useEffect(() => {
    setValue('color', color.toUpperCase())
  }, [color, setValue])

  const onSubmit = (data: ColorInputForm) => {
    const normalized = normalizeHex(data.color)
    setColor(normalized)
    onChange(normalized)
    setValue('color', normalized.toUpperCase())
  }

  const onError = () => {
    toast.error(t('color.invalidFormat'))
    reset({ color: color.toUpperCase() })
  }

  const handleBlurOrEnter = handleSubmit(onSubmit, onError)

  return (
    <div className="flex flex-col gap-3 mb-2" onWheel={(e) => e.stopPropagation()}>
      <div
        ref={containerRef}
        className="relative cursor-crosshair"
        style={{ width: WHEEL_SIZE, height: WHEEL_SIZE, touchAction: 'none' }}
        onPointerDown={handlePointerDown}
      >
        {/* Hue ring - フォーカス可能 */}
        <div
          role="slider"
          tabIndex={0}
          aria-label={t('color.hue')}
          aria-valuenow={hsv.h}
          aria-valuemin={HSV_MIN}
          aria-valuemax={359}
          aria-valuetext={hueValueText}
          className="absolute inset-0 rounded-full outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          style={{
            background:
              'conic-gradient(from 0deg, hsl(0, 100%, 50%), hsl(60, 100%, 50%), hsl(120, 100%, 50%), hsl(180, 100%, 50%), hsl(240, 100%, 50%), hsl(300, 100%, 50%), hsl(360, 100%, 50%))',
          }}
          onKeyDown={handleHueKeyDown}
        />
        {/* Inner circle mask */}
        <div
          className="absolute rounded-full bg-background pointer-events-none"
          style={{
            top: RING_WIDTH,
            left: RING_WIDTH,
            right: RING_WIDTH,
            bottom: RING_WIDTH,
          }}
        />

        {/* SV square - フォーカス可能 */}
        <div
          role="slider"
          tabIndex={0}
          aria-label={t('color.saturationBrightness')}
          aria-valuenow={hsv.s}
          aria-valuemin={HSV_MIN}
          aria-valuemax={HSV_MAX}
          aria-valuetext={svValueText}
          className="absolute rounded-sm outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]"
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
          onKeyDown={handleSvKeyDown}
        />

        {/* Hue indicator - pointer-events: none */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: RING_WIDTH - 4,
            height: RING_WIDTH - 4,
            borderRadius: '50%',
            border: '2px solid white',
            boxShadow: 'inset 0 0 0 1px black, 0 0 0 1px black',
            top: hueIndicatorY - (RING_WIDTH - 4) / 2,
            left: hueIndicatorX - (RING_WIDTH - 4) / 2,
          }}
        />

        {/* SV indicator - pointer-events: none */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            border: '2px solid white',
            boxShadow: 'inset 0 0 0 1px black, 0 0 0 1px black',
            top: (WHEEL_SIZE - SQUARE_SIZE) / 2 + svIndicatorY - 6,
            left: (WHEEL_SIZE - SQUARE_SIZE) / 2 + svIndicatorX - 6,
          }}
        />
      </div>
      <div className="flex items-center gap-2">
        <div className="size-6 rounded border border-border" style={{ backgroundColor: color }} />
        <input
          type="text"
          {...register('color')}
          onBlur={handleBlurOrEnter}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleBlurOrEnter()
            }
          }}
          onClick={(e) => {
            ;(e.target as HTMLInputElement).select()
          }}
          className={`w-20 px-1 py-0.5 text-sm font-mono text-foreground bg-transparent border rounded focus:outline-none focus:ring-1 ${
            errors.color
              ? 'border-destructive focus:ring-destructive'
              : 'border-border focus:ring-ring'
          }`}
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="size-6"
              onClick={() => {
                navigator.clipboard.writeText(color.toUpperCase())
                toast.success(t('color.copied'))
              }}
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
              variant="secondary"
              size="icon"
              className="size-6"
              onClick={async () => {
                const text = await navigator.clipboard.readText()
                const result = hexColorSchema.safeParse(text.trim())
                if (result.success) {
                  const normalized = normalizeHex(result.data)
                  setColor(normalized)
                  onChange(normalized)
                  toast.success(t('color.pasted'))
                } else {
                  toast.error(t('color.invalidFormat'))
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
