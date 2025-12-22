export type PointerType = 'mouse' | 'touch' | 'pen'

export type PointerPoint = {
  x: number
  y: number
  pressure?: number
  pointerType: PointerType
}

export type PointerInputHandlers = {
  onPointerDown: (point: PointerPoint) => void
  onPointerMove: (point: PointerPoint) => void
  onPointerUp: () => void
  onPointerLeave?: () => void
  onWheel?: (deltaY: number) => void
}
