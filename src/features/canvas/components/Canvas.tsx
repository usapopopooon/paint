import type { Drawable, Point } from '@/features/drawable'
import type { Layer } from '@/features/layer'
import type { CursorConfig } from '@/features/tools/types'
import { DrawingCanvas } from './DrawingCanvas'
import { PointerInputLayer } from '../../pointer'

/**
 * Canvasコンポーネントのプロパティ
 */
type CanvasProps = {
  readonly drawables?: readonly Drawable[]
  readonly layers?: readonly Layer[]
  readonly onStartStroke: (point: Point) => void
  readonly onAddPoint: (point: Point) => void
  readonly onEndStroke: () => void
  readonly onWheel?: (deltaY: number) => void
  readonly width?: number
  readonly height?: number
  readonly fillContainer?: boolean
  readonly cursor: CursorConfig
}

/**
 * ポインター入力と描画キャンバスを統合したコンポーネント
 * @param props - Canvasコンポーネントのプロパティ
 */
export const Canvas = ({
  drawables,
  layers,
  onStartStroke,
  onAddPoint,
  onEndStroke,
  onWheel,
  width = 800,
  height = 600,
  fillContainer = false,
  cursor,
}: CanvasProps) => {
  return (
    <PointerInputLayer
      onStart={onStartStroke}
      onMove={onAddPoint}
      onEnd={onEndStroke}
      onWheel={onWheel}
      cursor={cursor}
      className={fillContainer ? 'w-full h-full' : 'inline-block'}
    >
      <DrawingCanvas
        drawables={drawables}
        layers={layers}
        width={width}
        height={height}
        fillContainer={fillContainer}
        className={fillContainer ? undefined : 'rounded-lg border border-border'}
      />
    </PointerInputLayer>
  )
}
