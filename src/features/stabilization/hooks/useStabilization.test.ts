import { describe, test, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useStabilization } from './useStabilization'
import { DEFAULT_STABILIZATION } from '../constants'

describe('useStabilization', () => {
  test('デフォルト値で初期化される', () => {
    const { result } = renderHook(() => useStabilization())

    expect(result.current.stabilization).toBe(DEFAULT_STABILIZATION)
  })

  test('setStabilizationで値を更新できる', () => {
    const { result } = renderHook(() => useStabilization())

    act(() => {
      result.current.setStabilization(0.3)
    })

    expect(result.current.stabilization).toBe(0.3)
  })

  test('0未満の値は0にクランプされる', () => {
    const { result } = renderHook(() => useStabilization())

    act(() => {
      result.current.setStabilization(-0.1)
    })

    expect(result.current.stabilization).toBe(0)
  })

  test('0.4より大きい値は0.4にクランプされる', () => {
    const { result } = renderHook(() => useStabilization())

    act(() => {
      result.current.setStabilization(0.5)
    })

    expect(result.current.stabilization).toBe(0.4)
  })

  test('境界値を正しく設定できる', () => {
    const { result } = renderHook(() => useStabilization())

    act(() => {
      result.current.setStabilization(0)
    })
    expect(result.current.stabilization).toBe(0)

    act(() => {
      result.current.setStabilization(0.4)
    })
    expect(result.current.stabilization).toBe(0.4)
  })
})
