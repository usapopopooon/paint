// Canvas types are now minimal - most types moved to dedicated features:
// - Point, Drawable, StrokeDrawable -> @/features/drawable
// - StrokeStyle, BrushTip -> @/features/brush
// - Layer, LayerState -> @/features/layer
// - HistoryAction, HistoryStorage -> @/features/history

// Re-export commonly used types for convenience
export type { Point, Drawable, StrokeDrawable } from '@/features/drawable'
