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
                ? 'bg-primary text-primary-foreground'
                : 'bg-transparent text-muted-foreground'
            }`}
          >
            日本語
          </span>
          <span
            className={`w-12 text-center py-1 transition-colors ${
              locale === 'en'
                ? 'bg-primary text-primary-foreground'
                : 'bg-transparent text-muted-foreground'
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
