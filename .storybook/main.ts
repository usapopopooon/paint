import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@vueless/storybook-dark-mode',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {
      builder: {
        viteConfigPath: 'vite.config.ts',
      },
    },
  },
  core: {
    disableTelemetry: true,
  },
  viteFinal: async (config) => {
    // StorybookビルドではVitePWAプラグインを除外（workboxがStorybookの大きなファイルをキャッシュしようとしてエラーになるため）
    const pwaPluginNames = [
      'vite-plugin-pwa',
      'vite-plugin-pwa:build',
      'vite-plugin-pwa:dev-sw',
      'vite-plugin-pwa:info',
    ]
    const plugins = config.plugins?.flat().filter((plugin) => {
      if (plugin && typeof plugin === 'object' && 'name' in plugin) {
        return !pwaPluginNames.includes(plugin.name as string)
      }
      return true
    })

    return {
      ...config,
      plugins,
      base: process.env.NODE_ENV === 'production' ? '/paint/storybook/' : '/',
      optimizeDeps: {
        ...config.optimizeDeps,
        include: [
          ...(config.optimizeDeps?.include ?? []),
          'react/jsx-dev-runtime',
          'storybook/preview-api',
          'storybook/theming',
          '@vueless/storybook-dark-mode',
        ],
      },
    }
  },
}
export default config
