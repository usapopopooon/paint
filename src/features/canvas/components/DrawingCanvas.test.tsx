import { render } from '@testing-library/react'
import { describe, it, expect, vi, beforeAll } from 'vitest'
import { DrawingCanvas } from './DrawingCanvas'

// Mock ResizeObserver
beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
  }
})

describe('DrawingCanvas', () => {
  it('should render canvas element', () => {
    const { container } = render(<DrawingCanvas strokes={[]} />)
    const canvas = container.querySelector('canvas')
    expect(canvas).toBeInTheDocument()
  })

  it('should use default dimensions', () => {
    const { container } = render(<DrawingCanvas strokes={[]} />)
    const canvas = container.querySelector('canvas')
    expect(canvas).toHaveAttribute('width', '800')
    expect(canvas).toHaveAttribute('height', '600')
  })

  it('should use custom dimensions', () => {
    const { container } = render(<DrawingCanvas strokes={[]} width={400} height={300} />)
    const canvas = container.querySelector('canvas')
    expect(canvas).toHaveAttribute('width', '400')
    expect(canvas).toHaveAttribute('height', '300')
  })

  it('should apply className to canvas', () => {
    const { container } = render(<DrawingCanvas strokes={[]} className="custom-class" />)
    const canvas = container.querySelector('canvas')
    expect(canvas).toHaveClass('custom-class')
  })

  it('should render in fillContainer mode', () => {
    const { container } = render(<DrawingCanvas strokes={[]} fillContainer />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('w-full', 'h-full')
  })
})
