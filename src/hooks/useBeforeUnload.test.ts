import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useBeforeUnload } from './useBeforeUnload'

describe('useBeforeUnload', () => {
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>
  let removeEventListenerSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
  })

  afterEach(() => {
    addEventListenerSpy.mockRestore()
    removeEventListenerSpy.mockRestore()
  })

  test('マウント時にbeforeunloadイベントリスナーを追加', () => {
    const { unmount } = renderHook(() => useBeforeUnload())

    expect(addEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function))
    unmount()
  })

  test('アンマウント時にイベントリスナーを削除', () => {
    const { unmount } = renderHook(() => useBeforeUnload())

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function))
  })

  test('enabled=falseの場合はイベントリスナーを追加しない', () => {
    const { unmount } = renderHook(() => useBeforeUnload(false))

    expect(addEventListenerSpy).not.toHaveBeenCalledWith('beforeunload', expect.any(Function))
    unmount()
  })

  test('beforeunloadイベント発火時にpreventDefaultを呼ぶ', () => {
    const { unmount } = renderHook(() => useBeforeUnload())

    const event = new Event('beforeunload', { cancelable: true })
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault')

    window.dispatchEvent(event)

    expect(preventDefaultSpy).toHaveBeenCalled()
    unmount()
  })

  test('enabled切り替えでリスナーが適切に追加・削除される', () => {
    const { rerender, unmount } = renderHook(({ enabled }) => useBeforeUnload(enabled), {
      initialProps: { enabled: true },
    })

    expect(addEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function))

    rerender({ enabled: false })

    expect(removeEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function))

    unmount()
  })
})
