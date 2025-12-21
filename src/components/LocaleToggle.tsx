import { Button } from './ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'
import type { Locale, TranslationKey } from '@/hooks/useLocale'

type LocaleToggleProps = {
  readonly locale: Locale
  readonly onToggle: () => void
  readonly t: (key: TranslationKey) => string
}

export const LocaleToggle = ({ locale, onToggle, t }: LocaleToggleProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="font-mono text-xs px-2"
          aria-label={t('switchLanguage')}
        >
          {locale.toUpperCase()}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{t('switchLanguage')}</TooltipContent>
    </Tooltip>
  )
}
