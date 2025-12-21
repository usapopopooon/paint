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

export type CanvasState = {
  readonly strokes: readonly Stroke[]
  readonly currentStroke: Stroke | null
  readonly strokeWidth: number
  readonly strokeColor: string
  readonly tool: Tool
}

export type CanvasHistory = {
  readonly past: readonly (readonly Stroke[])[]
  readonly present: readonly Stroke[]
  readonly future: readonly (readonly Stroke[])[]
}

export type CanvasAction =
  | { readonly type: 'START_STROKE'; readonly point: Point }
  | { readonly type: 'ADD_POINT'; readonly point: Point }
  | { readonly type: 'END_STROKE' }
  | { readonly type: 'SET_STROKE_WIDTH'; readonly width: number }
  | { readonly type: 'SET_STROKE_COLOR'; readonly color: string }
  | { readonly type: 'UNDO' }
  | { readonly type: 'REDO' }
  | { readonly type: 'CLEAR' }
