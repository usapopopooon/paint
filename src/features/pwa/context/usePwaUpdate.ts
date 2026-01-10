import { useContext } from 'react'
import { PwaUpdateContext, type PwaUpdateContextValue } from './pwaUpdateTypes'

/**
 * PWA更新状態を取得するフック
 */
export const usePwaUpdate = (): PwaUpdateContextValue => {
  const context = useContext(PwaUpdateContext)
  if (!context) {
    throw new Error('usePwaUpdate must be used within a PwaUpdateProvider')
  }
  return context
}
