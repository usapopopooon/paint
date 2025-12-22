import type { Drawable } from '@/features/drawable'
import { generateId } from '@/lib/id'

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

/**
 * 背景レイヤーを作成
 */
export const createBackgroundLayer = (): Layer => ({
  id: 'background',
  name: 'Background',
  type: 'background',
  visible: true,
  locked: true,
  opacity: 1,
  blendMode: 'normal',
  drawables: [],
})

/**
 * 描画レイヤーを作成
 */
export const createDrawingLayer = (id?: string, name?: string): Layer => ({
  id: id ?? generateId('layer'),
  name: name ?? 'Layer 1',
  type: 'drawing',
  visible: true,
  locked: false,
  opacity: 1,
  blendMode: 'normal',
  drawables: [],
})

/**
 * 背景＋描画レイヤー1つの初期レイヤー状態を作成
 */
export const createInitialLayerState = (): LayerState => ({
  layers: [createBackgroundLayer(), createDrawingLayer('drawing', 'Layer 1')],
  activeLayerId: 'drawing',
})
