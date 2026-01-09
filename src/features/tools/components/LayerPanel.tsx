import { memo, useMemo, useState, useEffect, useCallback, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Plus, Trash2, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useTranslation } from '@/features/i18n'
import type { Layer, LayerId, LayerBlendMode } from '@/features/layer'
import { BACKGROUND_LAYER_ID, layerNameSchema, MAX_LAYER_NAME_LENGTH } from '@/features/layer'
import { useIsPixiEngine } from '@/features/canvas'
import { OpacityPopover } from './OpacityPopover'

const renameFormSchema = z.object({
  name: layerNameSchema,
})

type RenameFormData = z.infer<typeof renameFormSchema>

// Canvas 2Dでは全ブレンドモードが使用可能
const ALL_BLEND_MODES: LayerBlendMode[] = ['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten']

// PixiJSではoverlay, darken, lightenがバグで透明背景と誤って相互作用するため除外
// @see https://github.com/pixijs/pixijs/issues/11206
const PIXI_BLEND_MODES: LayerBlendMode[] = ['normal', 'multiply', 'screen']

type LayerPanelProps = {
  readonly layers: readonly Layer[]
  readonly activeLayerId: LayerId
  readonly drawingLayerCount: number
  readonly onLayerSelect: (id: LayerId) => void
  readonly onLayerVisibilityChange: (id: LayerId, isVisible: boolean) => void
  readonly onLayerAdd: () => void
  readonly onLayerDelete: (id: LayerId) => void
  readonly onLayerNameChange: (id: LayerId, name: string) => void
  readonly onLayerBlendModeChange: (id: LayerId, blendMode: LayerBlendMode) => void
  readonly onLayerOpacityChange: (id: LayerId, opacity: number) => void
  readonly onLayerMove?: (id: LayerId, newIndex: number) => void
}

export const LayerPanel = memo(function LayerPanel({
  layers,
  activeLayerId,
  drawingLayerCount,
  onLayerSelect,
  onLayerVisibilityChange,
  onLayerAdd,
  onLayerDelete,
  onLayerNameChange,
  onLayerBlendModeChange,
  onLayerOpacityChange,
  onLayerMove,
}: LayerPanelProps) {
  const { t } = useTranslation()
  const isPixiEngine = useIsPixiEngine()
  const blendModes = isPixiEngine ? PIXI_BLEND_MODES : ALL_BLEND_MODES
  const [deleteTargetId, setDeleteTargetId] = useState<LayerId | null>(null)
  const [editingLayerId, setEditingLayerId] = useState<LayerId | null>(null)
  const [draggedLayerId, setDraggedLayerId] = useState<LayerId | null>(null)
  const [dragOverLayerId, setDragOverLayerId] = useState<LayerId | null>(null)
  const [pendingBlendMode, setPendingBlendMode] = useState<LayerBlendMode | null>(null)
  const [blendModeWarningShown, setBlendModeWarningShown] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<RenameFormData>({
    resolver: zodResolver(renameFormSchema),
    defaultValues: { name: '' },
    mode: 'onChange',
  })

  // 背景レイヤーをUI上から非表示にする
  const visibleLayers = useMemo(
    () => layers.filter((layer) => layer.id !== BACKGROUND_LAYER_ID),
    [layers]
  )

  // アクティブレイヤーを取得
  const activeLayer = useMemo(
    () => layers.find((layer) => layer.id === activeLayerId),
    [layers, activeLayerId]
  )

  const canDeleteLayer = drawingLayerCount > 1

  // ブレンドモードのラベルを取得
  const getBlendModeLabel = useCallback((mode: LayerBlendMode) => t(`blendMode.${mode}`), [t])

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

  const handleNameDoubleClick = (e: React.MouseEvent, layer: Layer) => {
    e.stopPropagation()
    setEditingLayerId(layer.id)
    reset({ name: layer.name })
  }

  const onRenameSubmit = (data: RenameFormData) => {
    if (editingLayerId) {
      onLayerNameChange(editingLayerId, data.name.trim())
    }
    setEditingLayerId(null)
    reset({ name: '' })
  }

  const handleNameCancel = () => {
    setEditingLayerId(null)
    reset({ name: '' })
  }

  const getNameErrorMessage = (): string | undefined => {
    if (!errors.name) return undefined
    const errorType = errors.name.type
    if (errorType === 'too_small') {
      return t('layers.nameRequired')
    }
    if (errorType === 'too_big') {
      return t('layers.nameTooLong', { max: MAX_LAYER_NAME_LENGTH })
    }
    return t('layers.nameRequired')
  }

  // ダイアログが開いたときにinputにフォーカス
  useEffect(() => {
    if (editingLayerId) {
      const timer = setTimeout(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [editingLayerId])

  // ドラッグ&ドロップハンドラ
  const handleDragStart = useCallback((e: React.DragEvent, layerId: LayerId) => {
    setDraggedLayerId(layerId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', layerId)
  }, [])

  const handleDragOver = useCallback(
    (e: React.DragEvent, layerId: LayerId) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      if (draggedLayerId && draggedLayerId !== layerId) {
        setDragOverLayerId(layerId)
      }
    },
    [draggedLayerId]
  )

  const handleDragLeave = useCallback(() => {
    setDragOverLayerId(null)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent, targetLayerId: LayerId) => {
      e.preventDefault()
      if (!draggedLayerId || !onLayerMove || draggedLayerId === targetLayerId) {
        setDraggedLayerId(null)
        setDragOverLayerId(null)
        return
      }

      // ターゲットレイヤーのインデックスを取得（背景レイヤーを含む全体配列での位置）
      const targetIndex = layers.findIndex((l) => l.id === targetLayerId)
      if (targetIndex !== -1) {
        onLayerMove(draggedLayerId, targetIndex)
      }

      setDraggedLayerId(null)
      setDragOverLayerId(null)
    },
    [draggedLayerId, layers, onLayerMove]
  )

  const handleDragEnd = useCallback(() => {
    setDraggedLayerId(null)
    setDragOverLayerId(null)
  }, [])

  // 合成モード変更ハンドラ（PixiJSの場合のみ初回警告ダイアログを表示）
  const handleBlendModeChange = useCallback(
    (value: LayerBlendMode) => {
      // normalへの変更は警告不要
      if (value === 'normal') {
        onLayerBlendModeChange(activeLayerId, value)
        return
      }

      // Canvas 2Dエンジンの場合は警告不要
      if (!isPixiEngine) {
        onLayerBlendModeChange(activeLayerId, value)
        return
      }

      // PixiJS: 警告が既に表示済みの場合はそのまま適用
      if (blendModeWarningShown) {
        onLayerBlendModeChange(activeLayerId, value)
        return
      }

      // PixiJS: 初回はダイアログを表示
      setPendingBlendMode(value)
    },
    [activeLayerId, blendModeWarningShown, isPixiEngine, onLayerBlendModeChange]
  )

  const handleBlendModeWarningConfirm = useCallback(() => {
    if (pendingBlendMode) {
      setBlendModeWarningShown(true)
      onLayerBlendModeChange(activeLayerId, pendingBlendMode)
      setPendingBlendMode(null)
    }
  }, [activeLayerId, pendingBlendMode, onLayerBlendModeChange])

  const handleBlendModeWarningCancel = useCallback(() => {
    setPendingBlendMode(null)
  }, [])

  return (
    <div className="flex flex-col gap-1 flex-1 min-h-0">
      <div className="flex items-center justify-between flex-shrink-0">
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
      {/* 選択中レイヤーの合成モード・透明度設定 */}
      {activeLayer && (
        <div className="flex items-center gap-1 flex-shrink-0">
          <Select value={activeLayer.blendMode} onValueChange={handleBlendModeChange}>
            <SelectTrigger className="h-7 text-xs flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {blendModes.map((mode) => (
                <SelectItem key={mode} value={mode} className="text-xs">
                  {getBlendModeLabel(mode)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <OpacityPopover
            opacity={activeLayer.opacity}
            onOpacityChange={(opacity) => onLayerOpacityChange(activeLayerId, opacity)}
          />
        </div>
      )}
      <div className="flex flex-col gap-1 flex-1 min-h-0 overflow-y-auto mt-2">
        {[...visibleLayers].reverse().map((layer) => (
          <div
            key={layer.id}
            draggable={!!onLayerMove}
            onDragStart={(e) => handleDragStart(e, layer.id)}
            onDragOver={(e) => handleDragOver(e, layer.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, layer.id)}
            onDragEnd={handleDragEnd}
            className={`flex flex-col gap-0.5 px-1 py-1 rounded cursor-pointer ${
              activeLayerId === layer.id
                ? 'bg-control text-control-foreground'
                : 'hover:bg-secondary/80 dark:hover:bg-white/10'
            } ${draggedLayerId === layer.id ? 'opacity-50' : ''} ${
              dragOverLayerId === layer.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onLayerSelect(layer.id)}
          >
            {/* 1段目: 表示切替・合成モード・透明度・削除 */}
            <div className="flex items-center gap-1">
              {onLayerMove && (
                <GripVertical className="size-4 cursor-grab text-muted-foreground flex-shrink-0" />
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="size-5 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      onLayerVisibilityChange(layer.id, !layer.isVisible)
                    }}
                    aria-label={layer.isVisible ? t('layers.hide') : t('layers.show')}
                  >
                    {layer.isVisible ? (
                      <Eye
                        className={`size-3.5 ${activeLayerId === layer.id ? 'text-control-foreground' : ''}`}
                      />
                    ) : (
                      <EyeOff className="size-3.5 text-muted-foreground" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {layer.isVisible ? t('layers.hide') : t('layers.show')}
                </TooltipContent>
              </Tooltip>
              <span className="text-xs text-muted-foreground truncate flex-1">
                {getBlendModeLabel(layer.blendMode)}
              </span>
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {Math.round(layer.opacity * 100)}%
              </span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="size-5 p-0"
                      onClick={(e) => handleDeleteClick(e, layer.id)}
                      disabled={!canDeleteLayer}
                      aria-label={t('layers.delete')}
                    >
                      <Trash2
                        className={`size-3.5 ${!canDeleteLayer ? 'text-muted-foreground' : activeLayerId === layer.id ? 'text-control-foreground' : ''}`}
                      />
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {canDeleteLayer ? t('layers.delete') : t('layers.cannotDelete')}
                </TooltipContent>
              </Tooltip>
            </div>
            {/* 2段目: レイヤー名 */}
            <div className="flex items-center pl-5">
              <span
                className="text-sm flex-1 truncate cursor-text"
                onDoubleClick={(e) => handleNameDoubleClick(e, layer)}
                title={layer.name}
              >
                {layer.name}
              </span>
            </div>
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

      <Dialog open={editingLayerId !== null} onOpenChange={(open) => !open && handleNameCancel()}>
        <DialogContent className="sm:max-w-[300px]">
          <DialogHeader>
            <DialogTitle>{t('layers.rename')}</DialogTitle>
            <DialogDescription className="sr-only">
              {t('layers.renameDescription')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onRenameSubmit)}>
            <div className="flex flex-col gap-2">
              <Input
                {...register('name')}
                ref={(e) => {
                  register('name').ref(e)
                  inputRef.current = e
                }}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && <p className="text-sm text-destructive">{getNameErrorMessage()}</p>}
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={handleNameCancel}>
                {t('actions.cancel')}
              </Button>
              <Button type="submit" disabled={!isValid}>
                {t('actions.ok')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={pendingBlendMode !== null} onOpenChange={handleBlendModeWarningCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('blendMode.warning.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('blendMode.warning.description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleBlendModeWarningConfirm}>
              {t('actions.ok')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
})
