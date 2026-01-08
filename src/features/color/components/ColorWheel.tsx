import { useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ClipboardPaste, Copy } from 'lucide-react'
import * as HsvRing from 'react-hsv-ring'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useTranslation } from '@/features/i18n'
import { toast } from 'sonner'
import { colorWheelState } from '../hooks/colorWheelState'
import { WHEEL_SIZE, RING_WIDTH, ALPHA_SLIDER_TRACK_SIZE } from '../constants'
import { normalizeHex } from '../helpers'
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
 * react-hsv-ringライブラリを使用した色相リングと彩度・明度の正方形で色を選択
 * @param props - ColorWheelコンポーネントのプロパティ
 */
export const ColorWheel = ({ color, onChange }: ColorWheelProps) => {
  const { t } = useTranslation()

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

  const handleValueChange = useCallback(
    (hex: string) => {
      const normalized = hex.toLowerCase()
      onChange(normalized)
      setValue('color', normalized.toUpperCase())
    },
    [onChange, setValue]
  )

  const handleDragStart = useCallback(() => {
    colorWheelState.isDragging = true
  }, [])

  const handleDragEnd = useCallback(() => {
    colorWheelState.isDragging = false
  }, [])

  const onSubmit = (data: ColorInputForm) => {
    const normalized = normalizeHex(data.color)
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
      <HsvRing.Root
        value={color}
        onValueChange={handleValueChange}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <HsvRing.Wheel
          size={WHEEL_SIZE}
          ringWidth={RING_WIDTH}
          className="cursor-crosshair"
          style={{ touchAction: 'none' }}
        >
          <HsvRing.HueRing />
          <HsvRing.HueThumb />
          <HsvRing.Area />
          <HsvRing.AreaThumb />
        </HsvRing.Wheel>
        <HsvRing.AlphaSlider
          trackSize={ALPHA_SLIDER_TRACK_SIZE}
          className="mt-4 mb-2 rounded"
          style={{ width: WHEEL_SIZE }}
        />
      </HsvRing.Root>
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
