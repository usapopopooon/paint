import { useState, useCallback } from 'react'
import { DEFAULT_STABILIZATION, MIN_STABILIZATION, MAX_STABILIZATION } from '../constants'

/**
 * 手ぶれ補正の強度を管理するフック
 */
export const useStabilization = () => {
  const [stabilization, setStabilizationState] = useState(DEFAULT_STABILIZATION)

  const setStabilization = useCallback((value: number) => {
    const clamped = Math.max(MIN_STABILIZATION, Math.min(MAX_STABILIZATION, value))
    setStabilizationState(clamped)
  }, [])

  return {
    stabilization,
    setStabilization,
  } as const
}
