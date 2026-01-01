import { useCallback, useEffect, useRef, useState } from 'react'
import { hexToHsv, hsvToHex, type HSV } from '../helpers'
import { colorWheelState } from './colorWheelState'
import {
  WHEEL_SIZE,
  RING_WIDTH,
  SQUARE_SIZE,
  HSV_MIN,
  HSV_MAX,
  RADIANS_TO_DEGREES,
  DEGREES_TO_RADIANS,
  FULL_CIRCLE_DEGREES,
  HUE_ANGLE_OFFSET,
  CLICK_PADDING,
  KEYBOARD_STEP,
  KEYBOARD_STEP_LARGE,
} from '../constants'

/** ドラッグモードの型 */
type DragMode = 'none' | 'hue' | 'sv'

/**
 * useColorWheelフックのプロパティ
 */
type UseColorWheelProps = {
  color: string
  onChange: (color: string) => void
}

/**
 * カラーホイールのインタラクションを管理するフック
 * @param props - 現在の色とコールバック
 * @returns カラーホイール操作用のメソッドと状態
 */
export const useColorWheel = ({ color, onChange }: UseColorWheelProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hsv, setHsv] = useState<HSV>(() => hexToHsv(color))
  const [dragMode, setDragMode] = useState<DragMode>('none')
  /** ドラッグ中のgetBoundingClientRect()結果をキャッシュ */
  const cachedRectRef = useRef<DOMRect | null>(null)

  /**
   * ポインターイベントからカラーホイール内の位置を取得
   * @param event - ポインターイベント
   * @returns 中心からの相対座標と距離、またはnull
   */
  const getPositionFromEvent = useCallback((event: React.PointerEvent | PointerEvent) => {
    const container = containerRef.current
    if (!container) return null

    // ドラッグ中はキャッシュを使用、それ以外は新規取得
    const rect = cachedRectRef.current ?? container.getBoundingClientRect()
    const centerX = WHEEL_SIZE / 2
    const centerY = WHEEL_SIZE / 2
    const x = event.clientX - rect.left - centerX
    const y = event.clientY - rect.top - centerY
    const distance = Math.sqrt(x * x + y * y)

    return { x, y, distance }
  }, [])

  /**
   * 彩度・明度を更新
   * @param x - X座標（中心からの相対位置）
   * @param y - Y座標（中心からの相対位置）
   */
  const updateSV = useCallback(
    (x: number, y: number) => {
      const squareHalf = SQUARE_SIZE / 2
      const s = Math.max(HSV_MIN, Math.min(HSV_MAX, ((x + squareHalf) / SQUARE_SIZE) * HSV_MAX))
      const v = Math.max(HSV_MIN, Math.min(HSV_MAX, (1 - (y + squareHalf) / SQUARE_SIZE) * HSV_MAX))
      const newHsv = { h: hsv.h, s: Math.round(s), v: Math.round(v) }
      setHsv(newHsv)
      onChange(hsvToHex(newHsv.h, newHsv.s, newHsv.v))
    },
    [hsv.h, onChange]
  )

  /**
   * 色相を更新
   * @param x - X座標（中心からの相対位置）
   * @param y - Y座標（中心からの相対位置）
   */
  const updateHue = useCallback(
    (x: number, y: number) => {
      const angle = Math.atan2(y, x) * RADIANS_TO_DEGREES
      const hue = (angle + HUE_ANGLE_OFFSET + FULL_CIRCLE_DEGREES) % FULL_CIRCLE_DEGREES
      const newHsv = { h: Math.round(hue), s: hsv.s, v: hsv.v }
      setHsv(newHsv)
      onChange(hsvToHex(newHsv.h, newHsv.s, newHsv.v))
    },
    [hsv.s, hsv.v, onChange]
  )

  /**
   * ポインターダウン時のハンドラ
   * @param event - ポインターイベント
   */
  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      // ドラッグ開始時にrectをキャッシュ
      const container = containerRef.current
      if (container) {
        cachedRectRef.current = container.getBoundingClientRect()
      }

      const pos = getPositionFromEvent(event)
      if (!pos) return

      const { x, y, distance } = pos
      const squareHalf = SQUARE_SIZE / 2
      const innerRadius = WHEEL_SIZE / 2 - RING_WIDTH

      if (Math.abs(x) <= squareHalf + CLICK_PADDING && Math.abs(y) <= squareHalf + CLICK_PADDING) {
        setDragMode('sv')
        updateSV(x, y)
      } else if (
        distance >= innerRadius - CLICK_PADDING &&
        distance <= WHEEL_SIZE / 2 + CLICK_PADDING
      ) {
        setDragMode('hue')
        updateHue(x, y)
      }
    },
    [getPositionFromEvent, updateSV, updateHue]
  )

  /**
   * 彩度・明度インジケーターのポインターダウンハンドラ
   * @param event - ポインターイベント
   */
  const handleSvIndicatorPointerDown = useCallback((event: React.PointerEvent) => {
    event.stopPropagation()
    // ドラッグ開始時にrectをキャッシュ
    const container = containerRef.current
    if (container) {
      cachedRectRef.current = container.getBoundingClientRect()
    }
    setDragMode('sv')
  }, [])

  /**
   * 色相インジケーターのポインターダウンハンドラ
   * @param event - ポインターイベント
   */
  const handleHueIndicatorPointerDown = useCallback((event: React.PointerEvent) => {
    event.stopPropagation()
    // ドラッグ開始時にrectをキャッシュ
    const container = containerRef.current
    if (container) {
      cachedRectRef.current = container.getBoundingClientRect()
    }
    setDragMode('hue')
  }, [])

  /**
   * ポインター移動時のハンドラ
   * @param event - ポインターイベント
   */
  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      if (dragMode === 'none') return

      const pos = getPositionFromEvent(event)
      if (!pos) return

      const { x, y } = pos

      if (dragMode === 'sv') {
        updateSV(x, y)
      } else if (dragMode === 'hue') {
        updateHue(x, y)
      }
    },
    [dragMode, getPositionFromEvent, updateSV, updateHue]
  )

  /** ポインターアップ時のハンドラ */
  const handlePointerUp = useCallback(() => {
    setDragMode('none')
    // ドラッグ終了時にキャッシュをクリア
    cachedRectRef.current = null
  }, [])

  useEffect(() => {
    if (dragMode === 'none') {
      colorWheelState.isDragging = false
      return
    }

    colorWheelState.isDragging = true

    document.addEventListener('pointermove', handlePointerMove)
    document.addEventListener('pointerup', handlePointerUp)
    document.addEventListener('pointercancel', handlePointerUp)

    return () => {
      colorWheelState.isDragging = false
      document.removeEventListener('pointermove', handlePointerMove)
      document.removeEventListener('pointerup', handlePointerUp)
      document.removeEventListener('pointercancel', handlePointerUp)
    }
  }, [dragMode, handlePointerMove, handlePointerUp])

  /**
   * 外部からHex色を設定
   * @param hex - Hex形式の色コード
   */
  const setColor = useCallback((hex: string) => {
    setHsv(hexToHsv(hex))
  }, [])

  // 外部からのcolor propの変更を検知してhsvを更新
  useEffect(() => {
    setHsv(hexToHsv(color))
  }, [color])

  // インジケーター位置を計算
  const hueAngle = hsv.h - HUE_ANGLE_OFFSET
  const ringMiddle = WHEEL_SIZE / 2 - RING_WIDTH / 2
  const hueIndicatorX = WHEEL_SIZE / 2 + Math.cos(hueAngle * DEGREES_TO_RADIANS) * ringMiddle
  const hueIndicatorY = WHEEL_SIZE / 2 + Math.sin(hueAngle * DEGREES_TO_RADIANS) * ringMiddle

  const svIndicatorX = (hsv.s / HSV_MAX) * SQUARE_SIZE
  const svIndicatorY = (1 - hsv.v / HSV_MAX) * SQUARE_SIZE

  /**
   * 色相リングのキーボード操作ハンドラ
   * @param event - キーボードイベント
   */
  const handleHueKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const step = event.shiftKey ? KEYBOARD_STEP_LARGE : KEYBOARD_STEP
      let newHue = hsv.h

      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowDown':
          newHue = (hsv.h - step + FULL_CIRCLE_DEGREES) % FULL_CIRCLE_DEGREES
          break
        case 'ArrowRight':
        case 'ArrowUp':
          newHue = (hsv.h + step) % FULL_CIRCLE_DEGREES
          break
        default:
          return
      }

      event.preventDefault()
      const newHsv = { h: newHue, s: hsv.s, v: hsv.v }
      setHsv(newHsv)
      onChange(hsvToHex(newHsv.h, newHsv.s, newHsv.v))
    },
    [hsv, onChange]
  )

  /**
   * 彩度・明度スクエアのキーボード操作ハンドラ
   * @param event - キーボードイベント
   */
  const handleSvKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const step = event.shiftKey ? KEYBOARD_STEP_LARGE : KEYBOARD_STEP
      let newS = hsv.s
      let newV = hsv.v

      switch (event.key) {
        case 'ArrowLeft':
          newS = Math.max(HSV_MIN, hsv.s - step)
          break
        case 'ArrowRight':
          newS = Math.min(HSV_MAX, hsv.s + step)
          break
        case 'ArrowUp':
          newV = Math.min(HSV_MAX, hsv.v + step)
          break
        case 'ArrowDown':
          newV = Math.max(HSV_MIN, hsv.v - step)
          break
        default:
          return
      }

      event.preventDefault()
      const newHsv = { h: hsv.h, s: newS, v: newV }
      setHsv(newHsv)
      onChange(hsvToHex(newHsv.h, newHsv.s, newHsv.v))
    },
    [hsv, onChange]
  )

  return {
    containerRef,
    hsv,
    setColor,
    handlePointerDown,
    handleSvIndicatorPointerDown,
    handleHueIndicatorPointerDown,
    handleHueKeyDown,
    handleSvKeyDown,
    hueIndicatorX,
    hueIndicatorY,
    svIndicatorX,
    svIndicatorY,
  }
}
