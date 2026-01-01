import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { getInitialLocale } from './getInitialLocale'

// モック
vi.mock('@/lib/storage', () => ({
  getStorageItem: vi.fn(),
}))

import { getStorageItem } from '@/lib/storage'

describe('getInitialLocale', () => {
  const mockGetStorageItem = vi.mocked(getStorageItem)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('localStorageに保存されたロケールを返す（日本語）', () => {
    mockGetStorageItem.mockReturnValue('ja')

    const result = getInitialLocale()

    expect(result).toBe('ja')
  })

  test('localStorageに保存されたロケールを返す（英語）', () => {
    mockGetStorageItem.mockReturnValue('en')

    const result = getInitialLocale()

    expect(result).toBe('en')
  })

  test('保存値がなくブラウザ言語が日本語の場合はjaを返す', () => {
    mockGetStorageItem.mockReturnValue(null)
    vi.stubGlobal('navigator', { language: 'ja-JP' })

    const result = getInitialLocale()

    expect(result).toBe('ja')
  })

  test('保存値がなくブラウザ言語が英語の場合はenを返す', () => {
    mockGetStorageItem.mockReturnValue(null)
    vi.stubGlobal('navigator', { language: 'en-US' })

    const result = getInitialLocale()

    expect(result).toBe('en')
  })

  test('保存値がなくその他の言語の場合はenを返す', () => {
    mockGetStorageItem.mockReturnValue(null)
    vi.stubGlobal('navigator', { language: 'fr-FR' })

    const result = getInitialLocale()

    expect(result).toBe('en')
  })
})
