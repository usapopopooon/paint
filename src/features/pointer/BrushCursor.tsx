type BrushCursorProps = {
  readonly x: number
  readonly y: number
  readonly size: number
  readonly color: string
  readonly outline?: string
}

export const BrushCursor = ({ x, y, size, color, outline }: BrushCursorProps) => {
  // アウトライン色が指定されている場合はbox-shadowでアウトライン効果を適用
  const boxShadow = outline ? `0 0 0 1px ${outline}` : undefined

  return (
    <div
      style={{
        position: 'absolute',
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        borderRadius: '50%',
        border: `1px solid ${color}`,
        boxShadow,
        pointerEvents: 'none',
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
