import { memo } from 'react'
import { Pencil } from 'lucide-react'
import { MIN_PEN_WIDTH, MAX_PEN_WIDTH } from '../constants'
import { DrawingToolButton } from './DrawingToolButton'

type PenToolProps = {
  readonly isActive: boolean
  readonly width: number
  readonly opacity: number
  readonly onSelect: () => void
  readonly onWidthChange: (width: number) => void
  readonly onOpacityChange: (opacity: number) => void
}

export const PenTool = memo(function PenTool(props: PenToolProps) {
  return (
    <DrawingToolButton
      {...props}
      icon={Pencil}
      translationKey="tools.pen"
      keyboardShortcut="P"
      minWidth={MIN_PEN_WIDTH}
      maxWidth={MAX_PEN_WIDTH}
    />
  )
})
