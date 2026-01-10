---
title: 'vite-plugin-pwaとStorybookビルドの競合を解決する'
emoji: '📦'
type: 'tech'
topics: ['vite', 'pwa', 'storybook']
published: false
---

## 問題

vite-plugin-pwaを導入したプロジェクトで`npm run build-storybook`を実行すると、以下のエラーが発生しました。

```
Error:
Configure "workbox.maximumFileSizeToCacheInBytes" to change the limit:
the default value is 2 MiB.
Assets exceeding the limit:
- sb-manager/globals-runtime.js is 3.15 MB, and won't be precached.
```

## 原因

vite-plugin-pwaは内部でworkboxを使用し、ビルド時にファイルをService Workerにプリキャッシュします。デフォルトでは**2MiBを超えるファイルはキャッシュできない**という制限があります。

Storybookをビルドすると`sb-manager/globals-runtime.js`（約3.15MB）という大きなファイルが生成されるため、workboxがこのファイルをキャッシュしようとしてエラーになります。

## 解決方法

StorybookはPWAとして配布する必要がないため、Storybookビルド時にVitePWAプラグインを除外します。

`.storybook/main.ts`の`viteFinal`で以下のようにフィルタリングします。

```typescript
import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  // ... 他の設定
  viteFinal: async (config) => {
    // StorybookビルドではVitePWAプラグインを除外
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
      // ... 他の設定
    }
  },
}
export default config
```

vite-plugin-pwaは複数のプラグイン（`vite-plugin-pwa`, `vite-plugin-pwa:build`など）を返すため、`.flat()`で配列をフラット化してからフィルタリングしています。

## まとめ

本体アプリはPWA対応のまま、Storybookビルドだけプラグインを除外することで問題を解決できます。
