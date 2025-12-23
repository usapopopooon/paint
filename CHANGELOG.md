# Changelog

## [0.0.7] - 2025-12-23

### Fixes

- **キャンバス外からのドラッグ対応** (#18)
  - キャンバス外でマウスボタンを押しながらキャンバス内にドラッグした場合、描画が開始されるよう修正
- **クリア後のundo/redo修正** (#19)
  - クリア操作のundoで描画が正しく復元されるよう修正
- **テストのビルドエラー修正** (#28)
  - `useCanvasHistory.test.ts`のモックオブジェクトの型を修正

### Developer Experience

- **CIワークフロー改善** (#28)
  - `hotfix/*`ブランチもmainへのマージを許可するよう変更
  - CIにビルドステップを追加（型エラーの早期検出）

## [0.0.6] - 2025-12-23

### Docs

- **README改善** (#22)
  - 設計方針の具体例を削除し、機能一覧への参照を追加

## [0.0.5] - 2025-12-23

### Architecture

- **Clean Architecture採用** (#20)
  - Package by Feature + Clean Architectureによるディレクトリ構造の統一
  - 各featureをtypes/domain/useCases/adapters/infrastructure/helpers/hooks/componentsレイヤーで構成
  - 1ファイル1関数パターンでテストとの対応を明確化
  - READMEにアーキテクチャ概念図（Mermaid）を追加

## [0.0.4] - 2025-12-23

### Architecture

- **ポインタ入力処理の抽象化** (#12)
  - `usePointerInput` hookでマウス/タッチ/ペン入力を統一
  - CanvasをDrawingCanvasとPointerInputLayerに分離
- **Drawable抽象化**: ストローク以外の描画要素に対応可能な設計
- **ツールシステムの抽象化**: 拡張可能なレジストリパターン
- **i18n/Theme のfeature化**: Context APIによる状態管理

### Features

- **キーボードショートカット**: P=ペン、E=消しゴム選択
- **ツールチップにショートカット表示**

### Developer Experience

- **Prettier**: コードフォーマット統一
- **cspell**: スペルチェック導入
- **テストカバレッジ**: 60%閾値チェック、カバレッジバッジ
- **CIにlintステップ追加**
- **CIのテスト二重実行を修正**

### Code Quality

- JSDocコメント追加
- コメントの日本語統一
- READMEの日本語化
- 重複コードの共通化（lib/に抽出）

## [0.0.3] - 2025-12-22

### Features

- **マウスホイールでブラシサイズ変更** (#11)

### Fixes

- Storybookのテーマ切り替えを全UIモードで修正

## [0.0.2] - 2025-12-21

### Features

- **BrushCursor**: HTML/CSS overlay cursor for large brush sizes (>128px)

### Improvements

- Move ThemeToggle and LocaleToggle to `components/ui/`
- Run CI on all branches
- Add workflow to require release branches for merging to main

### Removed

- Remove unused ColorPicker component

## [0.0.1] - 2024-12-21

Initial release.

### Features

- **Drawing Canvas**: Freehand drawing with Canvas API
- **Pen Tool**: Adjustable brush width
- **Eraser Tool**: Adjustable eraser width
- **Color Picker**: HSV color wheel with saturation/value square
- **Color Input**: Hex color code input with copy/paste support
- **Undo/Redo**: History management for drawing actions
- **Dark/Light Mode**: Theme switching with system preference detection
- **i18n**: English and Japanese language support
- **Keyboard Shortcuts**: Quick access to tools and actions

### Developer Experience

- Storybook for component documentation
- Vitest + Playwright for testing
- GitHub Actions CI/CD pipeline
- Automatic screenshot generation for README
- Test coverage badge
