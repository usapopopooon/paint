import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { Locale } from '../types'
import type { TranslateFunction } from '../locales'

/**
 * LocaleToggleコンポーネントのプロパティ
 */
type LocaleToggleProps = {
  readonly locale: Locale
  readonly onToggle: () => void
  readonly t: TranslateFunction
}

/**
 * 言語切り替えトグルコンポーネント
 * @param props - LocaleToggleコンポーネントのプロパティ
 */
export const LocaleToggle = ({ locale, onToggle, t }: LocaleToggleProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onToggle}
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
}
