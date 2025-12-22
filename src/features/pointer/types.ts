/**
 * ポインターデバイスの種類
 */
export type PointerType = 'mouse' | 'touch' | 'pen'

/**
 * ポインター座標とメタデータ
 */
export type PointerPoint = {
  x: number
  y: number
  pressure?: number
  pointerType: PointerType
}
