import { useCallback, useEffect, useRef, useState } from 'react'
import { hexToHsv, hsvToHex, type HSV } from '../helpers'
import { colorWheelState } from './colorWheelState'

/** カラーホイールのサイズ（ピクセル） */
export const WHEEL_SIZE = 200
/** 色相リングの幅（ピクセル） */
export const RING_WIDTH = 16
/** 彩度・明度選択の正方形の余白（ピクセル） */
const SQUARE_MARGIN = 4
/** 彩度・明度選択の正方形サイズ（ピクセル） */
export const SQUARE_SIZE = (WHEEL_SIZE / 2 - RING_WIDTH) * Math.sqrt(2) - SQUARE_MARGIN

/** HSV値の最小値（パーセンテージ） */
const HSV_MIN = 0
/** HSV値の最大値（パーセンテージ） */
const HSV_MAX = 100
/** 角度変換: ラジアンから度への係数 */
const RADIANS_TO_DEGREES = 180 / Math.PI
/** 角度変換: 度からラジアンへの係数 */
const DEGREES_TO_RADIANS = Math.PI / 180
/** 円の全周（度） */
const FULL_CIRCLE_DEGREES = 360
/** 色相の開始オフセット角度（上方向を0度とするため） */
const HUE_ANGLE_OFFSET = 90
/** クリック判定の拡張パディング（ピクセル） */
const CLICK_PADDING = 8

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
   * マウスイベントからカラーホイール内の位置を取得
   * @param event - マウスイベント
   * @returns 中心からの相対座標と距離、またはnull
   */
  const getPositionFromEvent = useCallback((event: React.MouseEvent | MouseEvent) => {
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
   * マウスダウン時のハンドラ
   * @param event - マウスイベント
   */
  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
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
   * 彩度・明度インジケーターのマウスダウンハンドラ
   * @param event - マウスイベント
   */
  const handleSvIndicatorMouseDown = useCallback((event: React.MouseEvent) => {
    event.stopPropagation()
    // ドラッグ開始時にrectをキャッシュ
    const container = containerRef.current
    if (container) {
      cachedRectRef.current = container.getBoundingClientRect()
    }
    setDragMode('sv')
  }, [])

  /**
   * 色相インジケーターのマウスダウンハンドラ
   * @param event - マウスイベント
   */
  const handleHueIndicatorMouseDown = useCallback((event: React.MouseEvent) => {
    event.stopPropagation()
    // ドラッグ開始時にrectをキャッシュ
    const container = containerRef.current
    if (container) {
      cachedRectRef.current = container.getBoundingClientRect()
    }
    setDragMode('hue')
  }, [])

  /**
   * マウス移動時のハンドラ
   * @param event - マウスイベント
   */
  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
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

  /** マウスアップ時のハンドラ */
  const handleMouseUp = useCallback(() => {
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

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      colorWheelState.isDragging = false
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragMode, handleMouseMove, handleMouseUp])

  /**
   * 外部からHex色を設定
   * @param hex - Hex形式の色コード
   */
  const setColor = useCallback((hex: string) => {
    setHsv(hexToHsv(hex))
  }, [])

  // インジケーター位置を計算
  const hueAngle = hsv.h - HUE_ANGLE_OFFSET
  const ringMiddle = WHEEL_SIZE / 2 - RING_WIDTH / 2
  const hueIndicatorX = WHEEL_SIZE / 2 + Math.cos(hueAngle * DEGREES_TO_RADIANS) * ringMiddle
  const hueIndicatorY = WHEEL_SIZE / 2 + Math.sin(hueAngle * DEGREES_TO_RADIANS) * ringMiddle

  const svIndicatorX = (hsv.s / HSV_MAX) * SQUARE_SIZE
  const svIndicatorY = (1 - hsv.v / HSV_MAX) * SQUARE_SIZE

  return {
    containerRef,
    hsv,
    setColor,
    handleMouseDown,
    handleSvIndicatorMouseDown,
    handleHueIndicatorMouseDown,
    hueIndicatorX,
    hueIndicatorY,
    svIndicatorX,
    svIndicatorY,
  }
}
