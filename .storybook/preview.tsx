import * as React from 'react'
import type { Preview } from '@storybook/react-vite'
import { DocsContainer } from '@storybook/addon-docs/blocks'
import { themes } from 'storybook/theming'
import { useDarkMode } from '@vueless/storybook-dark-mode'
import '../src/index.css'
import { LocaleProvider } from '../src/features/i18n'

const ThemedDocsContainer: React.FC<React.ComponentProps<typeof DocsContainer>> = (props) => {
  const isDark = useDarkMode()
  return (
    <DocsContainer {...props} theme={isDark ? themes.dark : themes.light}>
      {props.children}
    </DocsContainer>
  )
}

const preview: Preview = {
  parameters: {
    backgrounds: { disable: true },
    darkMode: {
      classTarget: 'html',
      darkClass: ['dark'],
      lightClass: ['light'],
      stylePreview: true,
    },
    docs: {
      container: ThemedDocsContainer,
    },
  },
  decorators: [
    (Story) => {
      return (
        <LocaleProvider defaultLocale="en">
          <Story />
        </LocaleProvider>
      )
    },
  ],
}

export default preview
