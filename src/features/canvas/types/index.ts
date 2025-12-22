export type Point = {
  readonly x: number
  readonly y: number
}

export type Stroke = {
  readonly points: readonly Point[]
  readonly width: number
  readonly color: string
  readonly isEraser?: boolean
}

export type CanvasHistory = {
  readonly past: readonly (readonly Stroke[])[]
  readonly present: readonly Stroke[]
  readonly future: readonly (readonly Stroke[])[]
}
