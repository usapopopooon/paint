import { memo } from 'react'
import { Eraser } from 'lucide-react'
import { MIN_ERASER_WIDTH, MAX_ERASER_WIDTH } from '../constants'
import { DrawingToolButton } from './DrawingToolButton'

type EraserToolProps = {
  readonly isActive: boolean
  readonly width: number
  readonly opacity: number
  readonly onSelect: () => void
  readonly onWidthChange: (width: number) => void
  readonly onOpacityChange: (opacity: number) => void
}

export const EraserTool = memo(function EraserTool(props: EraserToolProps) {
  return (
    <DrawingToolButton
      {...props}
      icon={Eraser}
      translationKey="tools.eraser"
      keyboardShortcut="E"
      minWidth={MIN_ERASER_WIDTH}
      maxWidth={MAX_ERASER_WIDTH}
    />
  )
})
