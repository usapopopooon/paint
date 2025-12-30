// Canvas型は最小限 - ほとんどの型は専用フィーチャーに移動:
// - Point, Drawable, StrokeDrawable -> @/features/drawable
// - StrokeStyle, BrushTip -> @/features/brush
// - Layer, LayerState -> @/features/layer
// - HistoryAction, HistoryStorage -> @/features/history

// 便宜上よく使う型を再エクスポート
export type { Point, Drawable, StrokeDrawable } from '@/features/drawable'

// リサイズアンカー
export * from './resizeAnchor'
