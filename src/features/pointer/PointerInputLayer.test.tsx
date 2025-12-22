import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { PointerInputLayer } from './PointerInputLayer'

describe('PointerInputLayer', () => {
  const defaultProps = {
    onStart: vi.fn(),
    onMove: vi.fn(),
    onEnd: vi.fn(),
  }

  it('should render children', () => {
    render(
      <PointerInputLayer {...defaultProps}>
        <div data-testid="child">Child content</div>
      </PointerInputLayer>
    )

    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('should apply className to wrapper', () => {
    const { container } = render(
      <PointerInputLayer {...defaultProps} className="test-class">
        <div>Child</div>
      </PointerInputLayer>
    )

    expect(container.firstChild).toHaveClass('test-class')
  })

  it('should have touch-action none and cursor none styles', () => {
    const { container } = render(
      <PointerInputLayer {...defaultProps}>
        <div>Child</div>
      </PointerInputLayer>
    )

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.style.touchAction).toBe('none')
    expect(wrapper.style.cursor).toBe('none')
  })

  it('should not render cursor when cursor prop is not provided', () => {
    const { container } = render(
      <PointerInputLayer {...defaultProps}>
        <div>Child</div>
      </PointerInputLayer>
    )

    const cursor = container.querySelector('[style*="border-radius: 50%"]')
    expect(cursor).not.toBeInTheDocument()
  })
})
