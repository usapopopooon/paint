import { Moon, Sun } from 'lucide-react'
import { Button } from './ui/button'

type ThemeToggleProps = {
  readonly isDark: boolean
  readonly onToggle: () => void
}

export const ThemeToggle = ({ isDark, onToggle }: ThemeToggleProps) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </Button>
  )
}
