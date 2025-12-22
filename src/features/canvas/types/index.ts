export type Point = {
  readonly x: number
  readonly y: number
}

export type Tool = 'pen' | 'eraser'

export type Stroke = {
  readonly points: readonly Point[]
  readonly width: number
  readonly color: string
}

export type CanvasHistory = {
  readonly past: readonly (readonly Stroke[])[]
  readonly present: readonly Stroke[]
  readonly future: readonly (readonly Stroke[])[]
}
