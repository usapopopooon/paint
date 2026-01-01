import { renderHook } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { useLocale } from './useLocale'
import { LocaleProvider } from './LocaleProvider'
import type { ReactNode } from 'react'

// Mock storage
vi.mock('@/lib/storage', () => ({
  getStorageItem: vi.fn(() => null),
  setStorageItem: vi.fn(),
}))

describe('useLocale', () => {
  test('LocaleProvider外で使用するとエラーをスローする', () => {
    expect(() => {
      renderHook(() => useLocale())
    }).toThrow('useLocale must be used within a LocaleProvider')
  })

  test('LocaleProvider内で使用するとロケールコンテキストを返す', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <LocaleProvider defaultLocale="en">{children}</LocaleProvider>
    )

    const { result } = renderHook(() => useLocale(), { wrapper })

    expect(result.current.locale).toBe('en')
    expect(typeof result.current.setLocale).toBe('function')
    expect(typeof result.current.toggleLocale).toBe('function')
    expect(typeof result.current.t).toBe('function')
  })

  test('defaultLocaleがjaの場合は日本語ロケールを返す', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <LocaleProvider defaultLocale="ja">{children}</LocaleProvider>
    )

    const { result } = renderHook(() => useLocale(), { wrapper })

    expect(result.current.locale).toBe('ja')
  })

  test('ロケールに基づいてキーを正しく翻訳する', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <LocaleProvider defaultLocale="en">{children}</LocaleProvider>
    )

    const { result } = renderHook(() => useLocale(), { wrapper })

    expect(result.current.t('tools.pen')).toBe('Pen')
    expect(result.current.t('tools.eraser')).toBe('Eraser')
  })

  test('ロケールがjaの場合は日本語でキーを翻訳する', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <LocaleProvider defaultLocale="ja">{children}</LocaleProvider>
    )

    const { result } = renderHook(() => useLocale(), { wrapper })

    expect(result.current.t('tools.pen')).toBe('ペン')
    expect(result.current.t('tools.eraser')).toBe('消しゴム')
  })
})
