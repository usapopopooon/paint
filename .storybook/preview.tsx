import React from 'react'
import type { Preview } from '@storybook/react-vite'
import { withThemeByClassName } from '@storybook/addon-themes'
import { themes } from 'storybook/theming'
import '../src/index.css'
import { LocaleProvider } from '../src/hooks/useLocale'

const preview: Preview = {
  initialGlobals: {
    theme: 'dark',
  },
  parameters: {
    options: {
      storySort: {
        order: ['UI'],
      },
    },
    backgrounds: { disable: true },
    docs: {
      theme: themes.dark,
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme || 'dark'
      const isDark = theme === 'dark'

      return (
        <LocaleProvider defaultLocale="en">
          <div
            style={{
              backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
              padding: '1rem',
            }}
          >
            <Story />
          </div>
        </LocaleProvider>
      )
    },
    withThemeByClassName({
      themes: {
        light: '',
        dark: 'dark',
      },
      defaultTheme: 'dark',
    }),
  ],
}

export default preview
