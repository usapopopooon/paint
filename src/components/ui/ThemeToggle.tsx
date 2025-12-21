import { Moon, Sun } from 'lucide-react'
import { Button } from './button'
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip'
import type { TranslationKey } from '@/hooks/useLocale'

type ThemeToggleProps = {
  readonly isDark: boolean
  readonly onToggle: () => void
  readonly t: (key: TranslationKey) => string
}

export const ThemeToggle = ({ isDark, onToggle, t }: ThemeToggleProps) => {
  const label = isDark ? t('lightMode') : t('darkMode')

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
