import type { Drawable } from '@/features/drawable'
import type { Layer } from '@/features/layer'

/**
 * レンダラーエンジンの種類
 */
export type RendererEngine = 'pixi' | 'canvas'

/**
 * レンダラーの初期化オプション
 */
export type RendererOptions = {
  /** キャンバスの幅 */
  readonly width: number
  /** キャンバスの高さ */
  readonly height: number
  /** アンチエイリアスを有効にするか */
  readonly antialias?: boolean
  /** 描画バッファを保持するか（スポイトツールなどで必要） */
  readonly preserveDrawingBuffer?: boolean
}

/**
 * 内部エンジンインターフェース（外部には公開しない）
 * PixiJSやCanvas 2Dなどの具体的な実装が準拠する
 */
export interface RenderEngine {
  init(options: RendererOptions): Promise<void>
  dispose(): void
  resize(width: number, height: number): void
  getCanvas(): HTMLCanvasElement
  renderDrawables(drawables: readonly Drawable[]): Promise<void>
  renderLayers(layers: readonly Layer[]): Promise<void>
  clear(): void
  clearImageCache(): void
  readonly isInitialized: boolean
}

/**
 * レンダラーインターフェース
 * PixiJSやCanvas 2Dなどの実装を切り替え可能にするための抽象化
 */
export interface IRenderer {
  /**
   * レンダラーを初期化
   * @param options - 初期化オプション
   */
  init(options: RendererOptions): Promise<void>

  /**
   * レンダラーを破棄してリソースを解放
   */
  dispose(): void

  /**
   * キャンバスサイズを変更
   * @param width - 新しい幅
   * @param height - 新しい高さ
   */
  resize(width: number, height: number): void

  /**
   * 描画先のキャンバス要素を取得
   */
  getCanvas(): HTMLCanvasElement

  /**
   * 描画要素の配列をレンダリング（単一レイヤーモード）
   * @param drawables - 描画要素の配列
   */
  renderDrawables(drawables: readonly Drawable[]): Promise<void>

  /**
   * レイヤーの配列をレンダリング（マルチレイヤーモード）
   * @param layers - レイヤーの配列
   */
  renderLayers(layers: readonly Layer[]): Promise<void>

  /**
   * ステージをクリア
   */
  clear(): void

  /**
   * 画像キャッシュをクリア
   */
  clearImageCache(): void

  /**
   * レンダラーが初期化済みかどうか
   */
  readonly isInitialized: boolean

  /**
   * 現在使用しているエンジンの種類
   */
  readonly engineType: RendererEngine
}
