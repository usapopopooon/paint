import { memo } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useLocale } from '../hooks'

/**
 * 言語切り替えトグルコンポーネント
 */
export const LocaleToggle = memo(function LocaleToggle() {
  const { locale, toggleLocale, t } = useLocale()
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={toggleLocale}
          className="flex items-center text-xs rounded-full border border-border overflow-hidden cursor-pointer"
          role="switch"
          aria-checked={locale === 'ja'}
          aria-label={t('locale.switch')}
        >
          <span
            className={`w-12 text-center py-1 transition-colors ${
              locale === 'ja'
                ? 'bg-control text-control-foreground dark:text-control-foreground'
                : 'bg-transparent text-muted-foreground dark:text-white'
            }`}
          >
            日本語
          </span>
          <span
            className={`w-12 text-center py-1 transition-colors ${
              locale === 'en'
                ? 'bg-control text-control-foreground dark:text-control-foreground'
                : 'bg-transparent text-muted-foreground dark:text-white'
            }`}
          >
            English
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{t('locale.switch')}</TooltipContent>
    </Tooltip>
  )
})
