import { Moon, Sun } from 'lucide-react'
import { Button } from './ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'

type ThemeToggleProps = {
  readonly isDark: boolean
  readonly onToggle: () => void
}

export const ThemeToggle = ({ isDark, onToggle }: ThemeToggleProps) => {
  const label = isDark ? 'ライトモード' : 'ダークモード'

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          aria-label={label}
        >
          {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {label}
      </TooltipContent>
    </Tooltip>
  )
}
