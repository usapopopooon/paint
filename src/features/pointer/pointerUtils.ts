import type { PointerType, PointerPoint } from './types'

export const getPointerType = (pointerType: string): PointerType => {
  switch (pointerType) {
    case 'pen':
      return 'pen'
    case 'touch':
      return 'touch'
    default:
      return 'mouse'
  }
}

export const getPointerPoint = (
  clientX: number,
  clientY: number,
  rect: DOMRect,
  pressure: number,
  pointerType: PointerType
): PointerPoint => ({
  x: clientX - rect.left,
  y: clientY - rect.top,
  pressure,
  pointerType,
})
