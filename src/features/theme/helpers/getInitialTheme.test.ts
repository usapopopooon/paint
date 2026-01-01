import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { getInitialTheme } from './getInitialTheme'

// モック
vi.mock('@/lib/storage', () => ({
  getStorageItem: vi.fn(),
}))

import { getStorageItem } from '@/lib/storage'

describe('getInitialTheme', () => {
  const mockGetStorageItem = vi.mocked(getStorageItem)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('localStorageに保存されたテーマを返す（ダーク）', () => {
    mockGetStorageItem.mockReturnValue('dark')

    const result = getInitialTheme()

    expect(result).toBe('dark')
  })

  test('localStorageに保存されたテーマを返す（ライト）', () => {
    mockGetStorageItem.mockReturnValue('light')

    const result = getInitialTheme()

    expect(result).toBe('light')
  })

  test('保存値がなくシステム設定がダークの場合はdarkを返す', () => {
    mockGetStorageItem.mockReturnValue(null)
    const mockMatchMedia = vi.fn().mockReturnValue({ matches: true })
    vi.stubGlobal('matchMedia', mockMatchMedia)

    const result = getInitialTheme()

    expect(result).toBe('dark')
    expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)')
  })

  test('保存値がなくシステム設定がライトの場合はlightを返す', () => {
    mockGetStorageItem.mockReturnValue(null)
    const mockMatchMedia = vi.fn().mockReturnValue({ matches: false })
    vi.stubGlobal('matchMedia', mockMatchMedia)

    const result = getInitialTheme()

    expect(result).toBe('light')
  })
})
