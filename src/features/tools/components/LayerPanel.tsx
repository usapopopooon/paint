import { memo, useMemo } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useLocale } from '@/features/i18n'
import type { Layer, LayerId } from '@/features/layer'
import { BACKGROUND_LAYER_ID } from '@/features/layer'

type LayerPanelProps = {
  readonly layers: readonly Layer[]
  readonly activeLayerId: LayerId
  readonly onLayerSelect: (id: LayerId) => void
  readonly onLayerVisibilityChange: (id: LayerId, isVisible: boolean) => void
}

export const LayerPanel = memo(function LayerPanel({
  layers,
  activeLayerId,
  onLayerSelect,
  onLayerVisibilityChange,
}: LayerPanelProps) {
  const { t } = useLocale()

  // 背景レイヤーをUI上から非表示にする
  const visibleLayers = useMemo(
    () => layers.filter((layer) => layer.id !== BACKGROUND_LAYER_ID),
    [layers]
  )

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-foreground">{t('layers.title')}</span>
      <div className="flex flex-col gap-1">
        {[...visibleLayers].reverse().map((layer) => (
          <div
            key={layer.id}
            className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition-colors ${
              activeLayerId === layer.id
                ? 'bg-control text-control-foreground'
                : 'hover:bg-secondary/80 dark:hover:bg-white/10'
            }`}
            onClick={() => onLayerSelect(layer.id)}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className="size-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    onLayerVisibilityChange(layer.id, !layer.isVisible)
                  }}
                  aria-label={layer.isVisible ? t('layers.visible') : t('layers.hidden')}
                >
                  {layer.isVisible ? (
                    <Eye
                      className={`size-4 ${activeLayerId === layer.id ? 'text-control-foreground' : ''}`}
                    />
                  ) : (
                    <EyeOff className="size-4 text-muted-foreground" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {layer.isVisible ? t('layers.visible') : t('layers.hidden')}
              </TooltipContent>
            </Tooltip>
            <span className="text-sm">
              {t('layers.layer')} {layer.name.replace(/\D/g, '')}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
})
