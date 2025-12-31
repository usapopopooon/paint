import { memo, useMemo, useState } from 'react'
import { Eye, EyeOff, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useLocale } from '@/features/i18n'
import type { Layer, LayerId } from '@/features/layer'
import { BACKGROUND_LAYER_ID } from '@/features/layer'

type LayerPanelProps = {
  readonly layers: readonly Layer[]
  readonly activeLayerId: LayerId
  readonly drawingLayerCount: number
  readonly onLayerSelect: (id: LayerId) => void
  readonly onLayerVisibilityChange: (id: LayerId, isVisible: boolean) => void
  readonly onLayerAdd: () => void
  readonly onLayerDelete: (id: LayerId) => void
}

export const LayerPanel = memo(function LayerPanel({
  layers,
  activeLayerId,
  drawingLayerCount,
  onLayerSelect,
  onLayerVisibilityChange,
  onLayerAdd,
  onLayerDelete,
}: LayerPanelProps) {
  const { t } = useLocale()
  const [deleteTargetId, setDeleteTargetId] = useState<LayerId | null>(null)

  // 背景レイヤーをUI上から非表示にする
  const visibleLayers = useMemo(
    () => layers.filter((layer) => layer.id !== BACKGROUND_LAYER_ID),
    [layers]
  )

  const canDeleteLayer = drawingLayerCount > 1

  const handleDeleteClick = (e: React.MouseEvent, layerId: LayerId) => {
    e.stopPropagation()
    if (canDeleteLayer) {
      setDeleteTargetId(layerId)
    }
  }

  const handleDeleteConfirm = () => {
    if (deleteTargetId) {
      onLayerDelete(deleteTargetId)
      setDeleteTargetId(null)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteTargetId(null)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{t('layers.title')}</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="secondary"
              size="sm"
              className="size-6 p-0"
              onClick={onLayerAdd}
              aria-label={t('layers.add')}
            >
              <Plus className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">{t('layers.add')}</TooltipContent>
        </Tooltip>
      </div>
      <div className="flex flex-col gap-1">
        {[...visibleLayers].reverse().map((layer) => (
          <div
            key={layer.id}
            className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer ${
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
                  aria-label={layer.isVisible ? t('layers.hide') : t('layers.show')}
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
                {layer.isVisible ? t('layers.hide') : t('layers.show')}
              </TooltipContent>
            </Tooltip>
            <span className="text-sm flex-1">{layer.name}</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="size-6 p-0"
                    onClick={(e) => handleDeleteClick(e, layer.id)}
                    disabled={!canDeleteLayer}
                    aria-label={t('layers.delete')}
                  >
                    <Trash2
                      className={`size-4 ${!canDeleteLayer ? 'text-muted-foreground' : activeLayerId === layer.id ? 'text-control-foreground' : ''}`}
                    />
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent side="right">
                {canDeleteLayer ? t('layers.delete') : t('layers.cannotDelete')}
              </TooltipContent>
            </Tooltip>
          </div>
        ))}
      </div>

      <AlertDialog open={deleteTargetId !== null} onOpenChange={handleDeleteCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('layers.delete')}</AlertDialogTitle>
            <AlertDialogDescription>{t('layers.deleteConfirm')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              {t('layers.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
})
