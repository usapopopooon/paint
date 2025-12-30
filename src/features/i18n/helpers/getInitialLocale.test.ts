import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
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

  it('should return stored locale from localStorage', () => {
    mockGetStorageItem.mockReturnValue('ja')

    const result = getInitialLocale()

    expect(result).toBe('ja')
  })

  it('should return english locale from localStorage', () => {
    mockGetStorageItem.mockReturnValue('en')

    const result = getInitialLocale()

    expect(result).toBe('en')
  })

  it('should return ja when browser language is Japanese and no stored value', () => {
    mockGetStorageItem.mockReturnValue(null)
    vi.stubGlobal('navigator', { language: 'ja-JP' })

    const result = getInitialLocale()

    expect(result).toBe('ja')
  })

  it('should return en when browser language is English and no stored value', () => {
    mockGetStorageItem.mockReturnValue(null)
    vi.stubGlobal('navigator', { language: 'en-US' })

    const result = getInitialLocale()

    expect(result).toBe('en')
  })

  it('should return en for other languages and no stored value', () => {
    mockGetStorageItem.mockReturnValue(null)
    vi.stubGlobal('navigator', { language: 'fr-FR' })

    const result = getInitialLocale()

    expect(result).toBe('en')
  })
})
