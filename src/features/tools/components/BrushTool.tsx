import { memo } from 'react'
import { Brush } from 'lucide-react'
import { MIN_BRUSH_WIDTH, MAX_BRUSH_WIDTH } from '../constants'
import { DrawingToolButton } from './DrawingToolButton'

type BrushToolProps = {
  readonly isActive: boolean
  readonly width: number
  readonly opacity: number
  readonly onSelect: () => void
  readonly onWidthChange: (width: number) => void
  readonly onOpacityChange: (opacity: number) => void
}

export const BrushTool = memo(function BrushTool(props: BrushToolProps) {
  return (
    <DrawingToolButton
      {...props}
      icon={Brush}
      translationKey="tools.brush"
      keyboardShortcut="B"
      minWidth={MIN_BRUSH_WIDTH}
      maxWidth={MAX_BRUSH_WIDTH}
    />
  )
})
