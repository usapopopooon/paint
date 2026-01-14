import { forwardRef, useImperativeHandle, useRef } from 'react'
import { MousePointer2 } from 'lucide-react'

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
        <MousePointer2
          size={12}
          strokeWidth={2}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            // アイコンの左上端（ペン先）を円の中心に配置
            marginLeft: 0,
            marginTop: 0,
            color: 'white',
            filter: 'drop-shadow(1px 0 0 rgba(0,0,0,0.5))',
          }}
        />
      </div>
    )
  }
)

BrushCursor.displayName = 'BrushCursor'
