export type PointerType = 'mouse' | 'touch' | 'pen'

export type PointerPoint = {
  x: number
  y: number
  pressure?: number
  pointerType: PointerType
}
