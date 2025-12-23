import { useCallback, useEffect, useRef, useState } from 'react'
import type { PointerPoint, PointerType } from '../types'
import { getPointerType, getPointerPoint } from '../helpers'
import { colorWheelState } from '@/features/color/hooks/colorWheelState'

/** キャンバス外でのポインター位置を追跡するための型 */
type PendingStrokeStart = {
  x: number
  y: number
  pressure: number
  pointerType: PointerType
}

/**
 * usePointerInputフックのオプション
 */
type UsePointerInputOptions = {
  onStart: (point: PointerPoint) => void
  onMove: (point: PointerPoint) => void
  onEnd: () => void
  onWheel?: (deltaY: number) => void
}

/**
 * ポインターイベントハンドラのプロパティ
 */
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

/**
 * usePointerInputフックの戻り値
 */
type UsePointerInputReturn = {
  pointerProps: PointerInputProps
  pointerPosition: { x: number; y: number } | null
  isDrawing: boolean
  activePointerType: PointerType | null
}

/**
 * ポインターイベントからPointerPointを抽出
 * @param event - ポインターイベント
 * @param element - 対象のHTML要素
 * @returns ローカル座標のPointerPoint
 */
const extractPointerPoint = (
  event: React.PointerEvent<HTMLElement>,
  element: HTMLElement
): PointerPoint => {
  const rect = element.getBoundingClientRect()
  const pointerType = getPointerType(event.pointerType)
  return getPointerPoint(event.clientX, event.clientY, rect, event.pressure, pointerType)
}

/**
 * ポインター入力を統一的に処理するフック
 * マウス、タッチ、ペン入力を抽象化
 * @param options - コールバック関数のオプション
 * @returns ポインターイベントプロパティと状態
 */
export const usePointerInput = ({
  onStart,
  onMove,
  onEnd,
  onWheel,
}: UsePointerInputOptions): UsePointerInputReturn => {
  // マルチポインターの競合を防ぐためアクティブなポインターIDを追跡
  const activePointerIdRef = useRef<number | null>(null)
  const [activePointerType, setActivePointerType] = useState<PointerType | null>(null)
  const [pointerPosition, setPointerPosition] = useState<{ x: number; y: number } | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  // キャンバス外でボタンが押された時の位置を保存
  const pendingStrokeStartRef = useRef<PendingStrokeStart | null>(null)
  // キャンバス要素の参照を保持
  const canvasElementRef = useRef<HTMLElement | null>(null)

  /** ストロークを終了してポインター状態をリセット */
  const endStroke = useCallback(() => {
    if (activePointerIdRef.current !== null) {
      activePointerIdRef.current = null
      setActivePointerType(null)
      setIsDrawing(false)
      onEnd()
    }
  }, [onEnd])

  /**
   * ポインターダウン時のハンドラ
   * @param event - ポインターイベント
   */
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
      setActivePointerType(getPointerType(event.pointerType))
      setIsDrawing(true)

      const point = extractPointerPoint(event, element)
      setPointerPosition({ x: point.x, y: point.y })
      onStart(point)
    },
    [onStart]
  )

  /**
   * ポインター移動時のハンドラ
   * @param event - ポインターイベント
   */
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

  /**
   * ポインターアップ時のハンドラ
   * @param event - ポインターイベント
   */
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

  /**
   * ポインターキャンセル時のハンドラ
   * @param event - ポインターイベント
   */
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

  /**
   * ポインターが要素を離れた時のハンドラ
   * @param event - ポインターイベント
   */
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

  /**
   * ポインターが要素に入った時のハンドラ
   * キャンバス外でボタンを押しながら入った場合はストロークを開始
   * @param event - ポインターイベント
   */
  const handlePointerEnter = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      const element = event.currentTarget
      canvasElementRef.current = element
      const point = extractPointerPoint(event, element)
      setPointerPosition({ x: point.x, y: point.y })

      // 別のポインターで描画中の場合は無視
      if (activePointerIdRef.current !== null) {
        return
      }

      // ColorWheelドラッグ中はストロークを開始しない
      if (colorWheelState.isDragging) {
        return
      }

      // プライマリボタン（左クリック）が押されている場合はストロークを開始
      // buttons: 1 = 左ボタン
      if (event.buttons === 1) {
        try {
          element.setPointerCapture(event.pointerId)
        } catch {
          // setPointerCaptureはエッジケースで失敗することがある
        }

        activePointerIdRef.current = event.pointerId
        setActivePointerType(getPointerType(event.pointerType))
        setIsDrawing(true)

        // キャンバス外で追跡していた位置があればそこから開始
        const pending = pendingStrokeStartRef.current
        if (pending) {
          onStart(pending)
          pendingStrokeStartRef.current = null
        } else {
          onStart(point)
        }
      }
    },
    [onStart]
  )

  /**
   * ホイールイベントのハンドラ
   * @param event - ホイールイベント
   */
  const handleWheel = useCallback(
    (event: React.WheelEvent<HTMLElement>) => {
      if (onWheel) {
        event.preventDefault()
        onWheel(event.deltaY)
      }
    },
    [onWheel]
  )

  /**
   * コンテキストメニューのハンドラ（右クリック無効化）
   * @param event - マウスイベント
   */
  const handleContextMenu = useCallback((event: React.MouseEvent<HTMLElement>) => {
    // 右クリックまたは長押しでコンテキストメニューを防止
    event.preventDefault()
  }, [])

  // ウィンドウレベルでポインター位置を追跡（キャンバス外でもボタンが押されたら位置を記録）
  useEffect(() => {
    const handleWindowPointerMove = (event: PointerEvent) => {
      // 描画中またはキャンバス要素がない場合は無視
      if (activePointerIdRef.current !== null || !canvasElementRef.current) {
        return
      }

      // ColorWheelドラッグ中はキャンバスイベントを無視
      if (colorWheelState.isDragging) {
        pendingStrokeStartRef.current = null
        return
      }

      // 左ボタンが押されている場合、キャンバス相対座標で位置を保存
      if (event.buttons === 1) {
        const rect = canvasElementRef.current.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top

        pendingStrokeStartRef.current = {
          x,
          y,
          pressure: event.pressure,
          pointerType: getPointerType(event.pointerType),
        }
      } else {
        // ボタンが離されたらクリア
        pendingStrokeStartRef.current = null
      }
    }

    const handleWindowPointerUp = () => {
      pendingStrokeStartRef.current = null
    }

    window.addEventListener('pointermove', handleWindowPointerMove)
    window.addEventListener('pointerup', handleWindowPointerUp)

    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove)
      window.removeEventListener('pointerup', handleWindowPointerUp)
    }
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
    activePointerType,
  }
}
