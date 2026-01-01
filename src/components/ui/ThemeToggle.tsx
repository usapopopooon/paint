import { memo } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from './button'
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip'
import { useTranslation } from '@/features/i18n'
import { useTheme } from '@/features/theme'

/**
 * ダーク/ライトモード切り替えトグルコンポーネント
 */
export const ThemeToggle = memo(function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()
  const { t } = useTranslation()
  const label = isDark ? t('theme.lightMode') : t('theme.darkMode')

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="secondary" size="icon" onClick={toggleTheme} aria-label={label}>
          {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  )
})
