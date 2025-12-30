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
          className="flex items-center text-sm rounded-full border border-border overflow-hidden cursor-pointer"
          role="switch"
          aria-checked={locale === 'ja'}
          aria-label={t('locale.switch')}
        >
          <span
            className={`px-2 py-1 transition-colors ${
              locale === 'ja'
                ? 'bg-control text-control-foreground dark:text-control-foreground'
                : 'bg-transparent text-muted-foreground dark:text-white'
            }`}
          >
            日<span className="text-xs">あ</span>
          </span>
          <span
            className={`px-2 py-1 transition-colors ${
              locale === 'en'
                ? 'bg-control text-control-foreground dark:text-control-foreground'
                : 'bg-transparent text-muted-foreground dark:text-white'
            }`}
          >
            Aa
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{t('locale.switch')}</TooltipContent>
    </Tooltip>
  )
})
