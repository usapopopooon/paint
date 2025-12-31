import { forwardRef, useImperativeHandle, useRef } from 'react'

/**
 * BrushCursorコンポーネントのプロパティ
 */
type BrushCursorProps = {
  readonly size: number
  readonly color: string
  readonly outline?: string
}

/**
 * BrushCursorの命令的なメソッド
 */
export type BrushCursorHandle = {
  updatePosition: (x: number, y: number) => void
  show: () => void
  hide: () => void
}

/**
 * ブラシサイズと色を示すカスタムカーソルコンポーネント
 * パフォーマンスのためにrefで直接位置を更新
 * @param props - BrushCursorコンポーネントのプロパティ
 */
export const BrushCursor = forwardRef<BrushCursorHandle, BrushCursorProps>(
  ({ size, color, outline }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)

    useImperativeHandle(ref, () => ({
      updatePosition: (x: number, y: number) => {
        if (containerRef.current) {
          containerRef.current.style.transform = `translate(${x - size / 2}px, ${y - size / 2}px)`
        }
      },
      show: () => {
        if (containerRef.current) {
          containerRef.current.style.display = 'block'
        }
      },
      hide: () => {
        if (containerRef.current) {
          containerRef.current.style.display = 'none'
        }
      },
    }))

    // アウトライン色が指定されている場合はbox-shadowでアウトライン効果を適用
    const boxShadow = outline ? `0 0 0 1px ${outline}` : undefined

    return (
      <div
        ref={containerRef}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: size,
          height: size,
          borderRadius: '50%',
          border: `1px solid ${color}`,
          boxShadow,
          pointerEvents: 'none',
          display: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 2,
            height: 2,
            marginLeft: -1,
            marginTop: -1,
            borderRadius: '50%',
            backgroundColor: color,
          }}
        />
      </div>
    )
  }
)

BrushCursor.displayName = 'BrushCursor'
