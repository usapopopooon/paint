import { memo } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useLocale, useTranslation } from '../hooks'

/**
 * 言語切り替えトグルコンポーネント
 */
export const LocaleToggle = memo(function LocaleToggle() {
  const { locale, setLocale } = useLocale()
  const { t } = useTranslation()

  const toggleLocale = () => setLocale(locale === 'en' ? 'ja' : 'en')

  // 切り替え先の言語に応じたツールチップを表示
  const tooltipText = locale === 'ja' ? t('locale.switchToEnglish') : t('locale.switchToJapanese')

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={toggleLocale}
          className="flex items-center text-sm rounded-full border border-border overflow-hidden cursor-pointer"
          role="switch"
          aria-checked={locale === 'ja'}
          aria-label={tooltipText}
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
      <TooltipContent side="bottom">{tooltipText}</TooltipContent>
    </Tooltip>
  )
})
