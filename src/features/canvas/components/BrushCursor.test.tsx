import { composeStories } from '@storybook/react'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import * as stories from './BrushCursor.stories'

const { Small, Medium, Large, Eraser } = composeStories(stories)

describe('BrushCursor', () => {
  it('renders small cursor', () => {
    const { container } = render(<Small />)
    const cursor = container.querySelector('div > div')
    expect(cursor).toBeInTheDocument()
    expect(cursor).toHaveStyle({ width: '10px', height: '10px' })
  })

  it('renders medium cursor', () => {
    const { container } = render(<Medium />)
    const cursor = container.querySelector('div > div')
    expect(cursor).toHaveStyle({ width: '30px', height: '30px' })
  })

  it('renders large cursor', () => {
    const { container } = render(<Large />)
    const cursor = container.querySelector('div > div')
    expect(cursor).toHaveStyle({ width: '100px', height: '100px' })
  })

  it('renders eraser cursor with gray color', () => {
    const { container } = render(<Eraser />)
    const cursor = container.querySelector('div > div')
    expect(cursor).toHaveStyle({ border: '1px solid #888888' })
  })

  it('positions cursor correctly', () => {
    const { container } = render(<Small />)
    const cursor = container.querySelector('div > div')
    // x=100, y=100, size=10 -> left=95, top=95
    expect(cursor).toHaveStyle({ left: '95px', top: '95px' })
  })

  it('renders center dot', () => {
    const { container } = render(<Small />)
    const centerDot = container.querySelector('div > div > div')
    expect(centerDot).toBeInTheDocument()
    expect(centerDot).toHaveStyle({ width: '2px', height: '2px' })
  })
})
