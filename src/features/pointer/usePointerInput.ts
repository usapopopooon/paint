import { useCallback, useRef, useState } from 'react'
import type { PointerPoint, PointerType } from './types'
import { getPointerType, getPointerPoint } from './pointerUtils'

type UsePointerInputOptions = {
  onStart: (point: PointerPoint) => void
  onMove: (point: PointerPoint) => void
  onEnd: () => void
  onWheel?: (deltaY: number) => void
}

type PointerInputProps = {
  onPointerDown: (event: React.PointerEvent<HTMLElement>) => void
  onPointerMove: (event: React.PointerEvent<HTMLElement>) => void
  onPointerUp: (event: React.PointerEvent<HTMLElement>) => void
  onPointerCancel: (event: React.PointerEvent<HTMLElement>) => void
  onPointerLeave: (event: React.PointerEvent<HTMLElement>) => void
  onPointerEnter: (event: React.PointerEvent<HTMLElement>) => void
  onWheel: (event: React.WheelEvent<HTMLElement>) => void
  onContextMenu: (event: React.MouseEvent<HTMLElement>) => void
}

type UsePointerInputReturn = {
  pointerProps: PointerInputProps
  pointerPosition: { x: number; y: number } | null
  isDrawing: boolean
  activePointerType: PointerType | null
}

const extractPointerPoint = (
  event: React.PointerEvent<HTMLElement>,
  element: HTMLElement
): PointerPoint => {
  const rect = element.getBoundingClientRect()
  const pointerType = getPointerType(event.pointerType)
  return getPointerPoint(event.clientX, event.clientY, rect, event.pressure, pointerType)
}

export const usePointerInput = ({
  onStart,
  onMove,
  onEnd,
  onWheel,
}: UsePointerInputOptions): UsePointerInputReturn => {
  // マルチポインターの競合を防ぐためアクティブなポインターIDを追跡
  const activePointerIdRef = useRef<number | null>(null)
  const activePointerTypeRef = useRef<PointerType | null>(null)
  const [pointerPosition, setPointerPosition] = useState<{ x: number; y: number } | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  const endStroke = useCallback(() => {
    if (activePointerIdRef.current !== null) {
      activePointerIdRef.current = null
      activePointerTypeRef.current = null
      setIsDrawing(false)
      onEnd()
    }
  }, [onEnd])

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      // 別のポインターで描画中の場合は無視（マルチタッチの競合を防止）
      if (activePointerIdRef.current !== null) {
        return
      }

      // プライマリボタンのみ処理（左マウスボタン、タッチ、またはペン接触）
      if (event.button !== 0) {
        return
      }

      const element = event.currentTarget

      // 要素を離れてもイベントを受信するためポインターをキャプチャ
      try {
        element.setPointerCapture(event.pointerId)
      } catch {
        // setPointerCaptureはエッジケースで失敗することがある、続行
      }

      activePointerIdRef.current = event.pointerId
      activePointerTypeRef.current = getPointerType(event.pointerType)
      setIsDrawing(true)

      const point = extractPointerPoint(event, element)
      setPointerPosition({ x: point.x, y: point.y })
      onStart(point)
    },
    [onStart]
  )

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      const element = event.currentTarget
      const point = extractPointerPoint(event, element)
      setPointerPosition({ x: point.x, y: point.y })

      // アクティブなポインターのムーブイベントのみ処理
      if (activePointerIdRef.current !== event.pointerId) {
        return
      }

      onMove(point)
    },
    [onMove]
  )

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      // アクティブなポインターのみ処理
      if (activePointerIdRef.current !== event.pointerId) {
        return
      }

      const element = event.currentTarget

      // ポインターキャプチャを解放
      try {
        element.releasePointerCapture(event.pointerId)
      } catch {
        // キャプチャが既に解放されている場合は失敗することがある
      }

      endStroke()
    },
    [endStroke]
  )

  const handlePointerCancel = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      // 中断されたポインターを処理（例：システムジェスチャー、パームリジェクション）
      if (activePointerIdRef.current !== event.pointerId) {
        return
      }

      endStroke()
    },
    [endStroke]
  )

  const handlePointerLeave = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      // ポインターキャプチャがある場合はイベントを受信し続けるのでストロークを終了しない
      // キャプチャされていないポインターの位置のみクリア
      if (activePointerIdRef.current !== event.pointerId) {
        setPointerPosition(null)
        return
      }

      // アクティブなポインターの場合、まだキャプチャがあるか確認
      // ない場合（通常は起こらないはず）、ストロークを終了
      try {
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
          setPointerPosition(null)
          endStroke()
        }
      } catch {
        setPointerPosition(null)
        endStroke()
      }
    },
    [endStroke]
  )

  const handlePointerEnter = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      const element = event.currentTarget
      const point = extractPointerPoint(event, element)
      setPointerPosition({ x: point.x, y: point.y })
    },
    []
  )

  const handleWheel = useCallback(
    (event: React.WheelEvent<HTMLElement>) => {
      if (onWheel) {
        event.preventDefault()
        onWheel(event.deltaY)
      }
    },
    [onWheel]
  )

  const handleContextMenu = useCallback((event: React.MouseEvent<HTMLElement>) => {
    // 右クリックまたは長押しでコンテキストメニューを防止
    event.preventDefault()
  }, [])

  return {
    pointerProps: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerCancel,
      onPointerLeave: handlePointerLeave,
      onPointerEnter: handlePointerEnter,
      onWheel: handleWheel,
      onContextMenu: handleContextMenu,
    },
    pointerPosition,
    isDrawing,
    activePointerType: activePointerTypeRef.current,
  }
}
