import type { Preview, ReactRenderer } from '@storybook/react-vite'
import { withThemeByClassName } from '@storybook/addon-themes'
import type { DecoratorFunction } from 'storybook/internal/types'
import { themes } from 'storybook/theming'
import '../src/index.css'

const withBackground: DecoratorFunction<ReactRenderer> = (Story, context) => {
  const theme = context.globals.theme || 'dark'
  const isDark = theme === 'dark'

  return (
    <div
      style={{
        backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
        padding: '1rem',
      }}
    >
      <Story />
    </div>
  )
}

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
    withBackground,
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
