# Storybook 10のプレビュー領域もダークモードに対応させてみた

## はじめに

Storybook 10でダークモードを設定する機会があったので、やり方をメモしておきます。

StorybookのUIクローム（サイドバーやヘッダー）は簡単にダークテーマにできるんですが、プレビュー領域の背景は別途設定が必要でした。この記事ではそのあたりも含めて、Storybook全体をダークテーマに統一するまでの手順をまとめています。もっと良いやり方があるかもしれませんが、参考程度にどうぞ。

動作確認用として、ダークモード対応したコンポーネントがあると便利なので、今回はTailwind CSSの`dark:`バリアントに対応したshadcn/uiのButtonコンポーネントを使っていきます。

## 前提条件

- Vite + React + TypeScript プロジェクト
- Node.js 18以上

## 0. プロジェクトのセットアップ

まずは土台作りから。このあたりは既にできてる方は読み飛ばしてください。

### Viteプロジェクトの作成

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install
```

### Tailwind CSS v4のインストール

```bash
npm install tailwindcss @tailwindcss/vite
```

`vite.config.ts`にTailwindプラグインを追加します。

```ts:vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

`src/index.css`にTailwindをインポート。Tailwind CSS v4ではクラスベースのダークモードを使うために`@custom-variant`の設定も必要です。

```css:src/index.css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));
```

### パスエイリアスの設定

`tsconfig.json`に追加。

```json:tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

`tsconfig.app.json`にも同様に追加しておきます。

```json:tsconfig.app.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### shadcn/uiの初期化

ダークモード確認用のコンポーネントとしてshadcn/uiを使います。Tailwind CSSの`dark:`バリアントでスタイルが切り替わるので、設定がうまくいっているか確認しやすいです。

```bash
npx shadcn@latest init --defaults
```

### Buttonコンポーネントの追加

```bash
npx shadcn@latest add button
```

これで`src/components/ui/button.tsx`が作成されます。

### Storybookの初期化

```bash
npx storybook@latest init
```

ここまでが下準備です。

## 1. 必要なアドオンのインストール

ダークモード切り替えに使うアドオンを入れます。

```bash
npm install -D @storybook/addon-themes
```

`main.ts`にアドオンを追加。

```ts:.storybook/main.ts
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-themes",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
};
export default config;
```

### React 19を使っている場合

React 19 + Storybook 10の組み合わせだと、そのままでは起動時にエラーになりました。`viteFinal`を追加して、`react/jsx-dev-runtime`を事前バンドル対象に含める必要があります。

```ts:.storybook/main.ts
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-themes",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  viteFinal: async (config) => {
    return {
      ...config,
      optimizeDeps: {
        ...config.optimizeDeps,
        include: [
          ...(config.optimizeDeps?.include ?? []),
          'react/jsx-dev-runtime',
        ],
      },
    };
  },
};
export default config;
```

ここでしばらくハマったので、同じ構成の方は参考までに。React 18以前ならこの設定は不要です。

## 2. UIクローム（サイドバー・ヘッダー）のダークテーマ

`manager.ts`を作成して、StorybookのUI部分をダークテーマにします。

```ts:.storybook/manager.ts
import { addons } from 'storybook/manager-api'
import { create } from 'storybook/theming'

const theme = create({
  base: 'dark',
  brandTitle: 'My Project',
})

addons.setConfig({
  sidebar: {
    showRoots: true,
  },
  theme,
})
```

## 3. プレビュー領域のダークテーマ

ここが少しややこしいところでした。`preview.tsx`でプレビュー領域の背景とコンポーネントのテーマを設定します。

```tsx:.storybook/preview.tsx
import React from 'react'
import type { Preview } from '@storybook/react-vite'
import { withThemeByClassName } from '@storybook/addon-themes'
import { themes } from 'storybook/theming'
import '../src/index.css'

const preview: Preview = {
  initialGlobals: {
    theme: 'dark',
  },
  parameters: {
    backgrounds: { disable: true },
    docs: {
      theme: themes.dark,
    },
  },
  decorators: [
    // プレビュー領域の背景色を設定するデコレーター
    (Story, context) => {
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
```

### Storybook + Vitestを使っている場合

`@storybook/addon-vitest`でVitestと統合している場合、`preview.tsx`でJSXを使うと`React is not defined`エラーが出ることがあります。React 17以降はJSX Transformのおかげで通常は`import React`不要ですが、Vitest統合時はバンドルの仕方が異なるようで、明示的にインポートが必要でした。

```tsx
import React from 'react' // Vitest統合時に必要
```

TypeScriptから「Reactが使われていない」という警告が出ますが、実行時に必要なので無視して大丈夫です。

### 各設定が何をしているか

自分用のメモも兼ねて整理しておきます。

| 設定                             | 役割                                                             |
| -------------------------------- | ---------------------------------------------------------------- |
| 背景色デコレーター               | プレビュー領域の背景色をテーマに応じて切り替え                   |
| `withThemeByClassName`           | コンポーネントのルート要素に`dark`クラスを付与（Tailwind CSS用） |
| `docs.theme`                     | Docsパネル（ArgsTable等）のテーマ                                |
| `backgrounds: { disable: true }` | Storybookデフォルトの背景切り替え機能を無効化                    |

## 4. Buttonコンポーネントのストーリー作成

動作確認用にButtonのストーリーを書いておきます。

```tsx:src/components/ui/button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './button'

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Button',
  },
}

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Delete',
  },
}

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline',
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary',
  },
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost',
  },
}

export const Link: Story = {
  args: {
    variant: 'link',
    children: 'Link',
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
}
```

## 5. テーマ切り替え機能について

`@storybook/addon-themes`を入れると、ツールバーにテーマ切り替えボタンが出てきます。このボタンでlight/darkを切り替えると、プレビュー領域の背景色が変わり、コンポーネントに`dark`クラスが付与/削除されます。

ちなみにDocsパネルのテーマは静的に決まるので、ツールバーでの動的切り替えには対応していません。ここは少し残念なポイント。

## 6. 結果

設定が終わったら、Storybookを起動してみます。

```bash
npm run storybook
```

うまくいけば、ダークモードでは以下がすべてダークテーマになっているはずです。

- サイドバー・ヘッダー
- プレビュー領域の背景
- Docsパネル（ArgsTable、Description等）
- Tailwind CSSの`dark:`バリアントを使ったコンポーネント

こんな感じになりました。ツールバーでライトモードに切り替えると、プレビュー領域の背景とコンポーネントのスタイルが連動して切り替わります。ただ、上で触れた通りUIクロームはダーク固定なので、そこだけ少し惜しいところ。

|                                        ダークモード                                        |                                        ライトモード                                        |
| :----------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------: |
| ![ダークモード](https://storage.googleapis.com/zenn-user-upload/6a93503eba45-20251221.png) | ![ライトモード](https://storage.googleapis.com/zenn-user-upload/fb7dc8915b21-20251221.png) |

## おわりに

Storybook 10でダークモードを設定するには、だいたいこんな流れになります。

1. **プロジェクトセットアップ** - Vite + Tailwind CSS（+ 確認用のコンポーネント）
2. **manager.ts** - UIクローム
3. **preview.tsx** - プレビュー領域 + Docsパネル
4. **main.ts** - addon-themesの追加

公式ドキュメントを読みながら試行錯誤した結果なので、もしかしたらもっとスマートなやり方があるかもしれません。
