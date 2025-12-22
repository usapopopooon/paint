# Paint

> 🚧 **WIP** - このプロジェクトは開発中です。

[![version](https://img.shields.io/badge/version-0.0.3-blue)](https://github.com/usapopopooon/paint/releases/tag/v0.0.3) [![CI](https://github.com/usapopopooon/paint/actions/workflows/ci.yml/badge.svg)](https://github.com/usapopopooon/paint/actions/workflows/ci.yml) ![coverage](https://usapopopooon.github.io/paint/coverage-badge.svg) [![Demo](https://img.shields.io/badge/Demo-open-green?logo=github-pages)](https://usapopopooon.github.io/paint/) [![Storybook](https://img.shields.io/badge/Storybook-open-ff4785?logo=storybook&logoColor=white)](https://usapopopooon.github.io/paint/storybook/)

ReactとCanvas APIで構築したお絵かきアプリ。

![Screenshot](https://usapopopooon.github.io/paint/screenshot.png?t=1766319764)

## 機能

- ペン・消しゴムツール（幅調整可能）
- HSVカラーホイール
- Undo/Redo
- ダーク/ライトモード
- 多言語対応（英語/日本語）

## 技術スタック

- **フレームワーク**: React 19, TypeScript
- **ビルド**: Vite
- **スタイリング**: Tailwind CSS v4
- **UIコンポーネント**: Radix UI, shadcn/ui
- **テスト**: Vitest, Playwright, Storybook
- **CI/CD**: GitHub Actions, GitHub Pages

## アーキテクチャ

**Package by Feature**アーキテクチャを採用しています。

### 設計方針

- **Package by Feature**: レイヤー（components, hooks, utils）ではなく機能（canvas, color, toolbar）でコードを整理
- **関心の分離**: ビジネスロジックはカスタムフックに抽出、UIはコンポーネントに集中
- **コロケーション**: テスト・ストーリー・コンポーネントを各機能内に配置
- **共有ユーティリティ**: 複数機能で使う汎用関数は`lib/`に配置

### ディレクトリ構造

```
src/
├── components/          # 共有UIコンポーネント
│   └── ui/              # 基本UIコンポーネント（Button, Slider, Tooltip等）
├── features/            # 機能モジュール
│   ├── brush/           # ブラシ設定
│   │   └── types/       # BrushTip, StrokeStyle等
│   ├── canvas/          # キャンバス機能
│   │   ├── components/  # Canvas
│   │   ├── hooks/       # useCanvas, useDrawing, useCanvasHistory
│   │   ├── utils/       # レンダリングユーティリティ
│   │   └── types/
│   ├── color/           # カラーピッカー機能
│   │   ├── components/  # ColorWheel
│   │   ├── hooks/       # useColorWheel
│   │   └── utils/
│   ├── drawable/        # 描画要素
│   │   ├── renderer/    # 描画要素レンダラー
│   │   └── types/       # Drawable, StrokeDrawable
│   ├── history/         # 履歴管理
│   │   ├── actions/     # アクションクリエイター
│   │   ├── storage/     # インメモリストレージ
│   │   └── types/       # HistoryAction
│   ├── i18n/            # 多言語対応
│   │   ├── components/  # LocaleToggle
│   │   ├── hooks/       # LocaleProvider, useLocale
│   │   ├── locales/     # 翻訳ファイル
│   │   └── types/
│   ├── layer/           # レイヤー管理
│   │   ├── hooks/       # useLayers
│   │   ├── renderer/    # レイヤーレンダラー
│   │   └── types/
│   ├── pointer/         # ポインター入力処理
│   │   └── components/  # BrushCursor
│   ├── theme/           # テーマ管理
│   │   ├── hooks/       # ThemeProvider, useTheme
│   │   └── types/
│   ├── toolbar/         # ツールバー
│   │   └── components/  # Toolbar
│   └── tools/           # ツール管理
│       ├── behaviors/   # ペン・消しゴムの動作定義
│       ├── components/  # ToolPanel
│       ├── hooks/       # useTool
│       └── types/
├── hooks/               # グローバルフック（useKeyboardShortcuts）
├── lib/                 # 共有ユーティリティ（色変換、ストレージ等）
└── test/                # テストユーティリティ・モック
```

## 開発

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev

# Storybook起動
npm run storybook

# テスト実行
npm test

# ユニットテスト実行
npm run test:unit

# カバレッジ付きテスト
npm run test:coverage

# リント
npm run lint

# ビルド
npm run build
```
