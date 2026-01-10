import { describe, test, expect, afterEach, vi } from 'vitest'
import { isIndexedDBAvailable } from './indexedDB'

describe('isIndexedDBAvailable', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  test('indexedDBが定義されている場合はtrueを返す', () => {
    vi.stubGlobal('indexedDB', {})
    expect(isIndexedDBAvailable()).toBe(true)
  })

  test('indexedDBが未定義の場合はfalseを返す', () => {
    vi.stubGlobal('indexedDB', undefined)
    expect(isIndexedDBAvailable()).toBe(false)
  })
})

// Note: IndexedDBの実際の操作（saveToIndexedDB, loadFromIndexedDB, clearFromIndexedDB）は
// fake-indexeddbなどのモックライブラリが必要なため、統合テストで実施
