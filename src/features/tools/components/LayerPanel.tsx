import { memo } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { TranslationKey } from '@/features/i18n'
import type { Layer, LayerId } from '@/features/layer'

type LayerPanelProps = {
  readonly layers: readonly Layer[]
  readonly activeLayerId: LayerId
  readonly onLayerSelect: (id: LayerId) => void
  readonly onLayerVisibilityChange: (id: LayerId, isVisible: boolean) => void
  readonly t: (key: TranslationKey) => string
}

export const LayerPanel = memo(function LayerPanel({
  layers,
  activeLayerId,
  onLayerSelect,
  onLayerVisibilityChange,
  t,
}: LayerPanelProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-foreground">{t('layers.title')}</span>
      <div className="flex flex-col gap-1">
        {[...layers].reverse().map((layer) => (
          <div
            key={layer.id}
            className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer ${
              activeLayerId === layer.id ? 'bg-primary/20' : 'hover:bg-muted'
            }`}
            onClick={() => onLayerSelect(layer.id)}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="size-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    onLayerVisibilityChange(layer.id, !layer.isVisible)
                  }}
                  aria-label={layer.isVisible ? t('layers.visible') : t('layers.hidden')}
                >
                  {layer.isVisible ? (
                    <Eye className="size-4" />
                  ) : (
                    <EyeOff className="size-4 text-muted-foreground" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {layer.isVisible ? t('layers.visible') : t('layers.hidden')}
              </TooltipContent>
            </Tooltip>
            <span className="text-sm text-foreground">
              {t('layers.layer')} {layer.name.replace(/\D/g, '')}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
})
