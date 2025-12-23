import type { Drawable } from '@/features/drawable'

/**
 * レイヤー識別子
 */
export type LayerId = string

/**
 * レイヤータイプ
 * - background: 背景レイヤー（常に最背面）
 * - drawing: 通常の描画レイヤー
 */
export type LayerType = 'background' | 'drawing'

/**
 * レイヤーブレンドモード
 * Canvas 2DとPixiJSの両方と互換性あり
 */
export type LayerBlendMode = 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten'

/**
 * レイヤー状態
 */
export type Layer = {
  readonly id: LayerId
  readonly name: string
  readonly type: LayerType
  readonly visible: boolean
  readonly locked: boolean
  readonly opacity: number // 0-1
  readonly blendMode: LayerBlendMode
  readonly drawables: readonly Drawable[]
}

/**
 * 完全なレイヤー構造の状態
 */
export type LayerState = {
  readonly layers: readonly Layer[]
  readonly activeLayerId: LayerId
}
