import type { StrokeStyle } from '@/features/brush'

export type Point = {
  readonly x: number
  readonly y: number
}

export type Stroke = {
  readonly points: readonly Point[]
  readonly style: StrokeStyle
}

export type CanvasHistory = {
  readonly past: readonly (readonly Stroke[])[]
  readonly present: readonly Stroke[]
  readonly future: readonly (readonly Stroke[])[]
}
