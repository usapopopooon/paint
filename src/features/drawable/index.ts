// 型
export type { Point, DrawableId, DrawableMetadata, StrokeDrawable, Drawable } from './types'

// ドメイン（エンティティファクトリ）
export { generateDrawableId, createStrokeDrawable } from './domain'

// ヘルパー（型ガード）
export { isStrokeDrawable } from './helpers'

// アダプター（Canvas2Dレンダリング）
export { renderDrawable } from './adapters'
