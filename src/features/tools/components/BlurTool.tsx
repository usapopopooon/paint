import { memo } from 'react'
import { Droplets } from 'lucide-react'
import { MIN_BLUR_WIDTH, MAX_BLUR_WIDTH } from '../constants'
import { DrawingToolButton } from './DrawingToolButton'

type BlurToolProps = {
  readonly isActive: boolean
  readonly width: number
  readonly opacity: number
  readonly onSelect: () => void
  readonly onWidthChange: (width: number) => void
  readonly onOpacityChange: (opacity: number) => void
}

export const BlurTool = memo(function BlurTool(props: BlurToolProps) {
  return (
    <DrawingToolButton
      {...props}
      icon={Droplets}
      translationKey="tools.blur"
      keyboardShortcut="U"
      minWidth={MIN_BLUR_WIDTH}
      maxWidth={MAX_BLUR_WIDTH}
    />
  )
})
