# Changelog

## [0.3.10] - 2026-01-17

### Fixes

- **キャンバス未作成時にレイヤーパネルを非表示に**
  - 何も開いていない状態でレイヤー1が表示される問題を修正

### Dependencies

- `@stroke-stabilizer/core` を ^0.2.10 に更新
- `@stroke-stabilizer/react` を ^0.2.10 に更新

## [0.3.9] - 2026-01-16

### Refactor

- **手ぶれ補正を @stroke-stabilizer/core に置き換え**
  - `stabilizeStroke` の実装を `@stroke-stabilizer/core` の `smooth` + `gaussianKernel` に変更
  - 未使用だった `StabilizedPointer` クラスを削除
  - 約750行のコードを削減

### Dependencies

- `@stroke-stabilizer/core` ^0.2.0 を追加
- `@stroke-stabilizer/react` ^0.2.0 を追加

## [0.3.8] - 2026-01-14

### Fixes

- **ペンカーソルのアイコン位置を調整**
  - ペン先アイコン（MousePointer2）の左上端をブラシ円の中心に配置
  - どこから線が描かれるかが直感的にわかるように改善

### Refactor

- **StabilizedPointerのメソッド命名をDynamic Pipelineパターンに準拠**
  - `withXxxFilter()` → `addXxxFilter()` に変更
  - `withRafBatch()` → `addRafBatch()` に変更
  - `removeFilter(type)` と `removeRafBatch()` メソッドを追加
  - `setFilterEnabled` と `setRafBatchEnabled` メソッドを削除

## [0.3.7] - 2026-01-13

### Features

- **右側パネル（RightPanel）を追加**
  - LayerPanelを右側に配置してUIレイアウトを改善

### Fixes

- **消しゴムツールのバグ修正**
  - 消しゴムが灰色を塗るように見える問題を修正
  - destination-outで黒色を使用してRGB値の影響を排除
  - 消しゴムを含むレイヤーは中間キャンバスを使用するように修正

### Tests

- **Storybookテストの修正**
  - SaveImageDialogのファイル名変更テストを修正

## [0.3.6] - 2026-01-11

### Fixes

- **更新チェックの修正**
  - 「更新を確認」ボタンで正しく更新有無を判定するように修正
  - registration.update()後にwaiting/installingを確認して更新状態を判定

## [0.3.5] - 2026-01-11

### Fixes

- **ペンタブのバレルボタン対応**
  - ペンタブのバレルボタン（button=2）でスポイト動作を追加
  - 右クリックと同じ動作でどこでも色を取得可能に

### Performance

- **チェッカーボードパターンのキャッシュ**
  - createPattern APIを使用してパターンをキャッシュ
  - 毎フレーム約80,000回のfillRect呼び出しを1回に削減

- **レイヤー描画の最適化**
  - normalブレンドモード＋不透明度100%のレイヤーは中間キャンバスをスキップ
  - ツールフラグをuseMemoでメモ化してuseEffectの再実行を削減

- **コアレスポイントフィルタリングの最適化**
  - map + filterの2パス処理を単一ループに統合
  - 一時配列の生成を削減

- **スポイトのImageDataキャッシュ**
  - Canvas2D用にImageDataをキャッシュして連続色取得を高速化
  - レンダリング後に自動でキャッシュを無効化

### Style

- 手振れ補正アイコンをPenLineに変更

## [0.3.4] - 2026-01-11

### Features

- **新規キャンバス作成時の確認ダイアログ**
  - 未保存の編集がある状態で新規キャンバスを作成しようとした場合、確認ダイアログを表示
  - 編集内容を破棄するか、キャンセルするかを選択可能

### Tests

- **ツールビヘイビアのテストカバレッジを向上**
  - blurBehavior, eyedropperBehavior, zoomInBehavior, zoomOutBehaviorのテストを追加
  - rectangleSelectionBehavior, lassoSelectionBehaviorのcreateShapeメソッドのテストを追加
  - すべてのbehaviorファイルが100%カバレッジに

## [0.3.3] - 2026-01-11

### Features

- **ツール設定の保存・復元機能**
  - プロジェクトファイルにツール設定（ペン/ブラシ/消しゴムの幅、色、不透明度など）を保存
  - プロジェクト読み込み時にツール設定を復元するかどうかを選択可能

- **カーソルデザインの改善**
  - ブラシカーソル中央にMousePointer2アイコンを追加
  - スポイトカーソルを白塗り+黒影のスタイルに統一
  - 明るい背景/暗い背景の両方で視認性を向上

### Fixes

- プロジェクトファイル選択ダイアログで正しい拡張子(.usapo)がデフォルト表示されるように修正

## [0.3.2] - 2026-01-11

### Features

- **レイヤー結合機能**
  - レイヤーパネルで右クリック→「下のレイヤーと結合」で結合可能
  - キーボードショートカット Ctrl+E に対応
  - ブレンドモードと不透明度を正しく適用してレンダリング
  - Undo/Redo に対応

- **ぼかしツール**
  - エッジがぼけたストロークを描画できるツールを追加
  - キーボードショートカット U で選択
  - 輪郭ぼかしスライダーで強度を調整可能

- **変形操作のマウスクリック対応**
  - 変形中にキャンバス外をクリックで確定
  - 右クリックでキャンセル

### Fixes

- 変形ツール使用時にぼかし効果が消失する問題を修正

## [0.3.1] - 2026-01-11

### Features

- **復元ダイアログの改善**
  - 復元ボタンにautoFocusを追加（Enterですぐに復元可能）

- **全選択時の動作改善**
  - Ctrl+Aで全選択した後、自動的に選択ツールに切り替え
  - 右クリックコンテキストメニューがすぐに使用可能に

- **更新確認ダイアログにバージョン表示**
  - 「最新です」ダイアログに現在のバージョン番号を表示

### Style

- **ツールチップのライトモード対応**
  - ライトモードで白背景に黒文字に変更
  - ダークモードは従来通り黒背景に白文字

## [0.3.0] - 2026-01-11

### Features

- **IndexedDBを使った自動保存と復元機能**
  - 作業中のデータを自動保存（3秒デバウンス + 30秒定期保存）
  - ブラウザクラッシュ時にデータを復元可能
  - 起動時に復元可能なデータがある場合は確認ダイアログを表示

- **選択ツール右クリックでコンテキストメニューを表示**
  - 選択領域上で右クリックすると編集メニューを表示
  - コピー、切り取り、貼り付け、削除、塗りつぶし、変形操作が可能

### Refactor

- **App.tsxからカスタムフックを抽出**
  - useProjectHandlers: プロジェクト保存/読み込み/新規作成/復元
  - useSelectionHandlers: 選択/コピー/ペースト/削除/塗りつぶし
  - useTransformHandlers: 変形操作
  - useToolHandlers: ツール選択/サイズ/色

### Changes

- ブラシツールのデフォルトサイズを20に変更

### Fixes

- 復元後にIndexedDBからデータを削除しないように修正
  - 復元直後にブラウザを閉じてもデータが失われない

## [0.2.6] - 2026-01-10

### Features

- **更新確認時のダイアログ動作を改善**
  - ヘルプメニューの「更新を確認」クリック時に直接ダイアログを表示
  - 更新がある場合：更新確認ダイアログを直接表示（トースト経由ではなく）
  - 更新がない場合：「最新バージョンです」ダイアログを表示

### Changes

- `checkForUpdate`が更新状態を返すように変更（`{ updateAvailable: boolean }`）

## [0.2.5] - 2026-01-10

### Features

- **ヘルプメニューに更新確認機能を追加**
  - メニューバーに「ヘルプ」メニューを追加
  - 「更新を確認」メニュー項目で手動でService Worker更新をチェック可能
  - 更新がある場合、ヘルプメニューに赤いバッジを表示
  - 一度トーストをキャンセルしても、再度更新確認が可能

### Refactor

- **PWA更新状態をContextで管理**
  - PwaUpdateContext/PwaUpdateProviderを追加
  - アプリ全体で更新状態を共有可能に
  - ReloadPromptを新しいContextを使用するよう変更

### Storybook

- StorybookでPWAモックをサポート
  - virtual:pwa-register/reactのエイリアスを追加
  - PwaUpdateProviderをデコレータに追加

## [0.2.4] - 2026-01-10

### Features

- **上下反転機能を追加**
  - 編集メニューに「上下反転」を追加
  - 画像もストロークも垂直方向に反転可能
  - Undo/Redo対応

- **新規キャンバス作成時にプロジェクト名を入力可能に**
  - ダイアログにプロジェクト名入力フィールドを追加
  - 空の場合はnull、入力時はその名前でタイトルに反映

- **ブラウザタイトルのデフォルトファイル名をローカライズ**
  - 日本語: 「名称未設定」
  - 英語: 「untitled」

### Fixes

- **手ぶれ補正の終点ずれを修正**
  - 一方向フィルタから双方向ガウシアンフィルタに変更
  - 始点・終点両方にパディングを適用

### Changes

- **手ぶれ補正の内部最大値を0.2に変更**
  - UI上は0-100%表示を維持
  - より自然な補正強度に調整

### CI

- StorybookビルドステップをCIワークフローに追加
- test:fullコマンドにunitテストとStorybookテストの両方を追加

### Docs

- READMEの技術スタックにPWAを追加
- READMEを日本語に変更、英語版をdocs/README.en.mdに移動

## [0.2.3] - 2026-01-10

### Features

- **PWAサポートを追加**
  - vite-plugin-pwaによるService WorkerとPrecaching
  - 新しいバージョンが利用可能な場合にトースト通知を表示
  - 更新前に確認ダイアログを表示（未保存データの警告）

- **アクションボタン付きトースト（showActionToast）を追加**
  - Sonnerコンポーネントのストーリーを追加

### Refactor

- ReloadPromptをpwaフィーチャーに移動

### Fixed

- Prettierの改行コード設定を追加（Windowsでの改行コード問題を解決）

## [0.2.2] - 2026-01-09

### Features

- **プロジェクト読み込み時の確認ダイアログ**
  - 未保存の編集がある場合、プロジェクト読み込み前に確認ダイアログを表示

- **画像保存ダイアログでJPG/PNG形式を選択可能に**
  - PNG形式は透過PNGとして保存
  - JPG形式は白背景で保存

## [0.2.1] - 2026-01-09

### Features

- **選択範囲ツールを追加**
  - 矩形選択ツール（Mキー）とLasso選択ツール（Lキー）
  - 選択範囲の移動機能
  - コピー（Ctrl+C）、カット（Ctrl+X）、ペースト（Ctrl+V）
  - 削除（Delete/Backspace）、全選択（Ctrl+A）、選択解除（Escape/Ctrl+D）
  - マーチングアンツアニメーションによる選択領域の表示

### Fixes

- **選択領域の移動時の品質劣化を修正**
  - ImageDataキャッシュによる再エンコード防止
  - imageSmoothingEnabled=falseでボケを防止
  - 座標をMath.roundで整数に丸めてサブピクセルぼけを防止

- **選択領域の移動時に移動元が残る問題を修正**
  - 初回移動時のみレイヤーから選択領域をクリア
  - 選択解除時にのみレイヤーに反映する設計に統一

- **選択領域の移動時に内容が消える問題を修正**
  - SelectionOverlayでキャッシュされたImageDataを描画

- **選択範囲外クリックで選択解除時にピクセルが消える問題を修正**
  - 新しい選択開始前に既存のImageDataを保存するように修正

## [0.2.0] - 2026-01-09

### Features

- **Canvas 2Dレンダリングエンジンを追加**
  - PixiJSの代替としてCanvas 2D APIを使用したレンダリングエンジンを実装
  - デフォルトエンジンをCanvas 2Dに変更
  - Canvas 2D用にoverlay/darken/lightenブレンドモードを追加

- **レンダラー抽象化レイヤー**
  - RenderEngine/Rendererインターフェースで実装を切り替え可能に
  - 動的インポートによるコード分割（PixiJSは遅延読み込み）

### Fixes

- **Canvas 2Dエンジンのぼかし描画で半透明になるバグを修正**
  - 複数レイヤー描画方式をshadowBlur方式に変更
  - hardness（輪郭ぼかし）が1%以上でも100%不透明度が維持されるように

### Changes

- **カラーホイールからアルファスライダーを削除**
  - ツール毎の透明度設定に統一

- **ブレンドモード警告をPixiJSエンジン時のみ表示**
  - Canvas 2Dエンジンでは警告なしで直接ブレンドモードを変更可能

## [0.1.1] - 2026-01-08

### Features

- **カラーホイールをreact-hsv-ringライブラリに置き換え**
  - 自作のカラーホイール実装をreact-hsv-ringに移行
  - アルファスライダーを追加（8桁HEX対応）
  - hexColorSchema、normalizeHex、isValidHexを8桁HEX対応に拡張

### Refactor

- 不要になったカラーホイール関連コードを削除
  - useColorWheelフックを削除（react-hsv-ringが処理）
  - getColorNameヘルパーを削除（ライブラリ内で処理）
  - 不要な定数を削除（SQUARE_SIZE、HSV_MIN/MAX、角度変換定数など）

## [0.1.0] - 2026-01-08

### Refactor

- **ツールコンポーネントの統合**
  - PenTool, BrushTool, EraserToolの重複コードをDrawingToolButtonに統合
  - 各ツールコンポーネントを27行に簡素化（元：72行）

- **hardness計算関数の共通化**
  - renderDrawables.tsとrenderLayers.tsで重複していたgetHardness/calculateBlurStrengthを抽出
  - src/features/drawable/helpers/hardness.tsに共通化

- **ソフトエッジレンダリング関数の統合**
  - renderSoftEraserとrenderSoftStrokeを単一のrenderSoftEdge関数に統合
  - colorパラメータを追加して両方のケースを処理

- **App.tsxハンドラー関数の簡素化**
  - handleIncreaseToolSize/handleDecreaseToolSizeのif-elseチェーンを設定オブジェクトで置換
  - handleHardnessChange/handleBlurEnabledChangeも同様に簡素化

### Fixes

- **PixiJS Graphics APIの色型エラーを修正**
  - hexToNumber()ユーティリティ関数を追加して16進数文字列を数値に変換
  - renderStroke()でstyle.colorをhexToNumber()で変換
  - テストの期待値を数値カラーに更新

## [0.0.32] - 2026-01-02

### Refactor

- **i18nを@bf-i18n/reactに移行しシンプル化**
  - @bf-i18n/core, @bf-i18n/reactライブラリを導入
  - Rails形式のJSON翻訳ファイル（%{variable}プレースホルダー）に対応
  - カスタムのgetTranslation, getInitialLocale, LocaleContextを削除
  - ライブラリのuseLocale, useTranslation, detectBrowserLocaleを直接使用
  - 翻訳キー整合性テストを追加

## [0.0.31] - 2026-01-02

### Features

- **カラーホイールにアクセシビリティ対応を追加**
  - ARIA属性を追加（role="slider", aria-label, aria-valuenow等）
  - キーボード操作を追加（矢印キーで色相/彩度/明度を調整、Shiftで10刻み）
  - スクリーンリーダー向けに色名の読み上げに対応
  - 色相リングとSV正方形を直接フォーカス可能に変更
  - Tabキーで色相リング→SV正方形間をナビゲーション可能

## [0.0.29] - 2026-01-01

### Fixes

- **カラーホイールとスクロールバーのタブレットペン対応**
  - mouseイベントをpointerイベントに移行
  - touch-action: noneを追加してWindows Inkとの競合を解消
  - Windowsタブレットでカラーピッカーのドラッグが効かない問題を修正

- **DialogContentのアクセシビリティ警告を修正**
  - LayerPanelとSaveProjectDialogにDialogDescriptionを追加

## [0.0.28] - 2026-01-01

### Fixes

- **乗算・スクリーン合成モードが白背景に適用されない問題を修正**
  - 白背景を段階的合成に含めることでブレンドモードが正しく適用されるように

### Features

- **キャンバスサイズ入力に検証エラーメッセージを追加**
  - 最小値・最大値を超えた場合にトースト通知でエラーを表示
  - 無効な数値入力時にもエラーメッセージを表示

## [0.0.27] - 2026-01-01

### Features

- **プロジェクト保存・読み込み機能**
  - プロジェクトファイル（.usapo）の保存・読み込み機能を追加
  - File System Access APIを使用したファイルダイアログ
  - Zodによるプロジェクトファイルのバリデーション

- **入力検証の強化**
  - ファイル名検証（249文字制限、禁止文字チェック）
  - レイヤー名検証（50文字制限、空文字不可）
  - カラー入力フィールドにZod検証を追加
  - react-hook-formによるリアルタイムバリデーション

- **カラー操作の改善**
  - カラーコピー・ペースト時のトースト通知を追加

- **ブラウザタイトルの動的更新**
  - 未保存時は「untitled - Paint」を表示
  - 保存後は「プロジェクト名 - Paint」を表示

### Refactor

- canvas-resizeのtypesから関数をhelpersに移動

## [0.0.26] - 2026-01-01

### Docs

- **MIT LICENSEファイルを追加**
  - 公開フォークを推奨する注釈付き

### CI

- **日本語READMEのバージョンとスクリーンショットを自動更新**
  - prepare-release.ymlでdocs/README.ja.mdも更新対象に追加

## [0.0.25] - 2026-01-01

### Features

- **レイヤー合成モード・透明度機能** (#81)
  - レイヤーパネルに合成モード選択（通常/乗算/スクリーン）と透明度スライダーを追加
  - 段階的合成（Progressive Compositing）によるブレンドモードの正しい適用
  - 初回の合成モード変更時に警告ダイアログを表示（ブラウザ負荷の注意喚起）

### Docs

- **READMEを英語化**
  - README.mdを英語版に変更
  - 日本語版をdocs/README.ja.mdに配置
  - タイトルを「Paint (Tentative Name)」に変更

### Known Issues

- PixiJS 8のバグにより、overlay/darken/lighten合成モードは透明背景と誤って相互作用するため除外
  - https://github.com/pixijs/pixijs/issues/11206

## [0.0.24] - 2026-01-01

### Fixes

- **輪郭ぼかし無効ボタンが効かないバグを修正**
  - isBlurEnabled=false時にhardness=0（ぼかしなし）を適用するよう修正
  - ペン、ブラシ、消しゴムすべてのツールで修正
  - renderStrokeの条件判定を修正（hardness>0でソフトエッジ描画）

### Changes

- ツールチップのラベルを「ぼかし」から「輪郭ぼかし」に変更
  - 機能の意味をより明確に

## [0.0.23] - 2026-01-01

### Docs

- READMEのアーキテクチャ概念図をSVG画像に置き換え
  - mermaid記法からSVG画像に変更し、GitHubでの色付け問題を解消

## [0.0.22] - 2026-01-01

### Features

- **レイヤー管理機能** (#107)
  - レイヤーの追加・削除機能
  - レイヤー名の変更（ダブルクリックで編集）
  - レイヤーの並べ替え（ドラッグ＆ドロップ）

- **ツールサイズ変更のキーボードショートカット**
  - `]` キーでツールサイズを大きく
  - `[` キーでツールサイズを小さく
  - 対数スケールで自然な増減

- **ぼかし有効/無効スイッチの独立化**
  - スライダー値とスイッチを独立して管理
  - スライダーを最小にしても自動でスイッチがオンにならない

### Fixes

- ツール切り替え時のキャンバスちらつきを修正
  - DrawingCanvasの再マウントを防止

- 高DPIディスプレイでのピクセルぼけを修正
  - PixiJSのresolutionとautoDensity設定を追加

### Performance

- BrushCursorの位置更新を命令的ハンドルに変更
  - ポインター移動時のReact再レンダリングを削減

### Refactor

- スライダー関数を1ファイル1関数に分離
  - `valueToSlider.ts` / `sliderToValue.ts` / `getNextLogValue.ts`

## [0.0.21] - 2025-12-31

### Features

- **画像インポート機能** (#98)
  - ドラッグ＆ドロップで画像をキャンバスに追加
  - ファイル選択ダイアログからの画像インポート
  - PNG/JPEG/GIF/WebP形式に対応

- **画像の左右反転機能**
  - インポートした画像も含めて左右反転

- **ズームツール機能**
  - クリックでズームイン/アウト
  - Photoshopスタイルのズーム動作（カーソル位置を基準に拡大縮小）

- **JPEG保存時の50%縮小**
  - 保存時に自動で50%縮小して出力
  - 背景レイヤー対応

### Refactor

- スポイトツールをfeatures/eyedropperに分離
- キャンバスサイズ変更をfeatures/canvas-resizeに分離
- ImportButtonとSaveButtonを各featureに移動
- 定数をconstantsフォルダに整理・グローバル化

### Style

- キャンバスリサイズアイコンをExpandに変更
- ZoomResetButtonのアイコンをSquareDotに変更

## [0.0.20] - 2025-12-31

### Features

- **手ぶれ補正機能** (#91)
  - FIRガウシアンフィルタによるストローク平滑化
  - ツールバーに補正強度スライダーを追加（0〜100%）
  - 始点パディングによる遅延対策

- **消しゴムのソフトエッジ描画**
  - 8レイヤーの段階的ストロークでソフトエッジを実現
  - hardness値に応じてソフトエッジの範囲が変化
  - BlurFilterはeraseブレンドモードと両立不可のため代替実装

- **輪郭ぼかしのデフォルト値変更**
  - hardnessのデフォルト値を0から0.5に変更

- **ツール透明度機能** (#86)
  - ペン/ブラシ/消しゴムの透明度（opacity）を調整可能
  - OpacityPopoverコンポーネントを追加

- **ツールぼかし（hardness）機能** (#89)
  - ペン/ブラシの輪郭ぼかし度を調整可能
  - HardnessSliderコンポーネントを追加
  - BlurFilterによるぼかし効果

- **キャンバス左右反転機能** (#77)
  - Ctrl+H / Cmd+H で左右反転
  - 描画データのx座標を反転

- **ズームコントロール**
  - ズームイン/アウト/リセットボタンを追加
  - Ctrl++/- でズーム操作

- **ページ離脱確認ダイアログ**
  - 描画データがある場合、ページ離脱時に確認

- **クリアボタン改善**
  - OS別ショートカット表示（Ctrl+Delete / Cmd+Backspace）

### Fixes

- **HardnessSliderの非描画ツール選択時の動作改善**
  - 非描画ツール選択時に最後に選択した描画ツールのhardness値を保持
  - 初期状態ではデフォルト値（50%）を表示

## [0.0.19] - 2025-12-31

### Style

- **ツールパネルの余白調整**
  - カラー入力とスライダー間の余白を追加

## [0.0.18] - 2025-12-31

### Features

- **キャンバスリサイズ起点選択機能**
  - キャンバスリサイズ時の起点（アンカー）を9方向から選択可能
  - AnchorSelectorコンポーネント（3x3グリッド、Lucide square-arrowアイコン使用）
  - CanvasResizeMenuコンポーネント（Radix UI Popover使用）

- **ブラシツール追加**
  - ペンと消しゴムの間にブラシツールを追加
  - 将来の拡張に対応した設計（テクスチャ、不透明度、フロー等）

- **履歴機能拡張**
  - メタデータ変更（キャンバスサイズ、レイヤー表示/不透明度）のUndo/Redoに対応

- **レイヤー名変更機能**
  - レイヤー名の変更APIを追加（Undo/Redo対応）

### Fixes

- **スポイトツールの透明部分対応**
  - 透明部分で黒を取得する問題を修正

- **スライダークリックでツール選択**
  - ペン/ブラシ/消しゴムのスライダーをクリックするだけでツールが選択されるように修正

- **passive event listenerエラー修正**
  - キャンバスサイズ入力のホイールイベントをpassive: falseで登録

- **ブラシツールの色同期**
  - ブラシツールでパレットの色が反映されない問題を修正
  - カラーホイールとスポイトでペンとブラシの両方の色を更新

### Refactor

- **ヘルパー関数の分離**
  - 定数をconstants/ディレクトリに分離
  - ヘルパー関数をhelpers/に分離しユニットテストを追加
  - index.tsの整理

### Style

- **ツールパネルのUI改善**
  - ツールアイコンボタンを小さく（size-6）
  - ツール間の余白を詰める（gap-1）

- **ボタンのホバー効果を統一**
  - ThemeToggle、LayerPanel、ColorWheelのコピー/ペーストボタンにホバー効果を追加

- **アクティブレイヤーの目アイコン色を統一**
  - ダークモード時、アクティブレイヤーの目アイコンを文字色と同じ色に統一

- **リサイズボタンにツールチップ追加**

- **言語切り替えトグルのラベル変更**
  - 「日本語 | English」→「日あ | Aa」に変更

### Tests

- **Storybookテスト追加・更新**
  - BrushTool、CanvasResizeMenuツールチップ、LocaleToggleラベルのテスト

### Developer Experience

- **リリースコミットメッセージを修正**
  - "screenshot" → "screenshot's url" に変更

## [0.0.17] - 2025-12-31

### Fixes

- スクリーンショット404エラーを修正
  - deploy.ymlがREADMEからタイムスタンプを読み取って同じファイル名でスクリーンショットを生成
  - update-release-assets.ymlをprepare-release.ymlにリネーム・簡素化

### Refactor

- READMEから機能一覧セクションを削除

## [0.0.16] - 2025-12-31

### Developer Experience

- Update Release Assetsワークフローをmainブランチから手動実行可能に
  - 最新のリリースタグからバージョンを自動取得

## [0.0.15] - 2025-12-31

### Fixes

- スクリーンショット撮影時にペンツールを選択するよう修正
- スクリーンショットファイル名をタイムスタンプ埋め込み形式に変更（キャッシュ対策）

## [0.0.14] - 2025-12-31

### Features

- **リサイズ可能なキャンバス**
  - キャンバスサイズ入力（幅・高さ）を追加
  - サイズ変更時に中央基準で描画を保持
  - マウスホイールでサイズ値を調整可能
- **ハンドツール**
  - キャンバスをドラッグしてパン移動
  - キャンバス中央リセットボタンを追加
  - デフォルトツールをハンドツールに変更
- **スポイトツール**
  - キャンバス上の色を取得してペン色に設定
  - WebGLキャンバス（PixiJS）対応
- **カスタムスクロールバー**
  - キャンバスビューポートにスクロールバーを追加
- **UIテーマ改善**
  - Storybook風のUIテーマに変更
  - CSS変数 --panel, --control, --control-foreground を追加

### Refactor

- Undo/Redo/Clearボタンをアイコンに変更
- i18nをContext APIにリファクタ

### Fixes

- キャンバスサイズ変更時のちらつきを修正
- レンダリング前にrenderer初期化を確認
- refのレンダー中更新をuseEffectに移動

### Docs

- READMEから機能一覧を削除

## [0.0.13] - 2025-12-30

### Developer Experience

- **PR作成時にリリースアセットを自動更新**
  - release/\*\*ブランチからmainへのPR作成時にUpdate Release Assetsワークフローを実行
  - ブランチ名からバージョンを取得してpackage.jsonとREADMEを自動更新
  - PAT_TOKENを使用してpushし、CIをトリガー
- **revert/\*ブランチのmainマージを許可**

## [0.0.12] - 2025-12-30

### Developer Experience

- **リリースブランチでバッジとスクリーンショットを自動更新** (#52)
  - リリースブランチへのPRマージ時にREADMEのバージョンバッジとスクリーンショットタイムスタンプを自動更新
  - deploy.ymlからmainへの直接push処理を削除（ブランチ保護ルールに対応）

## [0.0.11] - 2025-12-30

### Features

- **レイヤー対応** (#46)
  - 3レイヤー固定構成とレイヤーパネルUIを追加
  - Undo/Redoをレイヤー横断の統合履歴に変更

### Refactor

- **ToolbarとToolPanelをchildren構成にリファクタ** (#48)
  - Toolbarをchildren構成に変更し、UndoButton, RedoButton, ClearButton, ToolbarDividerを分離
  - ToolPanelをchildren構成に変更し、PenTool, EraserTool, LayerPanelを分離
  - 各コンポーネントにStorybookファイルを追加

## [0.0.10] - 2025-12-30

### Features

- **PixiJS移行** (#7)
  - 描画エンジンをCanvas 2D APIからPixiJS Graphics APIへ移行
  - レイヤーのブレンドモード・不透明度をPixiJS Containerで実装
  - 消しゴム機能をRenderTexture + blendMode='erase'で実装

### Fixes

- **undo初回実行が無視されるバグ修正**
  - ストレージから直接状態を確認するよう変更
- **StrictModeでのストレージ問題修正**
  - 遅延初期化パターンで二重disposeを防止
- **キャンバス初期化時のちらつき抑制**
  - 背景色で初期化時の白フラッシュを防止
- **passive event listener警告修正**
  - wheelイベントのpassiveオプションを明示的に設定

### Refactor

- **共通ヘルパー関数の抽出**
  - `blendModeToPixi`: LayerBlendMode→BLEND_MODES変換を共通化
  - `isEraserStroke`: 消しゴム判定ロジックを共通化
- **RenderTextureパターンの統一**
  - renderDrawables/renderLayers/createCanvas2DRendererで統一
- **未使用の履歴アクション型を削除**
  - LayerVisibilityChangedAction, LayerOpacityChangedAction, LayerRenamedAction

## [0.0.9] - 2025-12-30

### Fixes

- **キャンバス未ホバー時のストローク開始位置修正** (#38)
  - キャンバス上で一度もホバーしていない状態でストロークを開始した場合に、開始位置がずれる問題を修正

### Refactor

- **マジックナンバーを定数・ヘルパー関数に置き換え**
  - `isPrimaryButton` / `isPrimaryButtonPressed` ヘルパー関数を追加
  - `hasMinimumPoints` 関数を追加
  - ブラシサイズ調整の定数化
  - ColorWheelのマジックナンバーを定数化

## [0.0.8] - 2025-12-24

### Fixes

- **ColorWheelドラッグ中のキャンバス描画防止** (#31)
  - ColorWheelで色を選択しながらキャンバスにドラッグした際に意図しない描画が開始される問題を修正
  - `colorWheelState`グローバル状態でドラッグ状態を追跡
- **キャンバス外からのストローク開始位置修正** (#29)
  - キャンバス外でマウスボタンを押しながらキャンバス内にドラッグした際、ストローク開始位置がずれる問題を修正
  - ウィンドウレベルでポインター位置を追跡

### Performance

- **UIパフォーマンス改善** (#30, #32)
  - 不要な再レンダリングを削減

### Refactor

- **booleanプロパティ名を動詞始まりに統一**
  - `visible` → `isVisible`、`readonly` → `isReadonly` 等

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
