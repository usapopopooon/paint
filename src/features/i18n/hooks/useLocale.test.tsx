import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useLocale } from './useLocale'
import { LocaleProvider } from './LocaleProvider'
import type { ReactNode } from 'react'

// Mock storage
vi.mock('@/lib/storage', () => ({
  getStorageItem: vi.fn(() => null),
  setStorageItem: vi.fn(),
}))

describe('useLocale', () => {
  it('should throw error when used outside of LocaleProvider', () => {
    expect(() => {
      renderHook(() => useLocale())
    }).toThrow('useLocale must be used within a LocaleProvider')
  })

  it('should return locale context when used within LocaleProvider', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <LocaleProvider defaultLocale="en">{children}</LocaleProvider>
    )

    const { result } = renderHook(() => useLocale(), { wrapper })

    expect(result.current.locale).toBe('en')
    expect(typeof result.current.setLocale).toBe('function')
    expect(typeof result.current.toggleLocale).toBe('function')
    expect(typeof result.current.t).toBe('function')
  })

  it('should return Japanese locale when defaultLocale is ja', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <LocaleProvider defaultLocale="ja">{children}</LocaleProvider>
    )

    const { result } = renderHook(() => useLocale(), { wrapper })

    expect(result.current.locale).toBe('ja')
  })

  it('should translate keys correctly based on locale', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <LocaleProvider defaultLocale="en">{children}</LocaleProvider>
    )

    const { result } = renderHook(() => useLocale(), { wrapper })

    expect(result.current.t('tools.pen')).toBe('Pen')
    expect(result.current.t('tools.eraser')).toBe('Eraser')
  })

  it('should translate keys to Japanese when locale is ja', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <LocaleProvider defaultLocale="ja">{children}</LocaleProvider>
    )

    const { result } = renderHook(() => useLocale(), { wrapper })

    expect(result.current.t('tools.pen')).toBe('ペン')
    expect(result.current.t('tools.eraser')).toBe('消しゴム')
  })
})
