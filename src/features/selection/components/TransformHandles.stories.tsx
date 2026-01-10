import type { Meta, StoryObj } from '@storybook/react-vite'
import { TransformHandles } from './TransformHandles'
import type { TransformState } from '../types'

const meta = {
  title: 'Features/Selection/TransformHandles',
  component: TransformHandles,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div
        style={{
          position: 'relative',
          width: 400,
          height: 300,
          backgroundColor: '#f0f0f0',
          border: '1px solid #ccc',
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TransformHandles>

export default meta
type Story = StoryObj<typeof TransformHandles>

/**
 * テスト用のImageDataを作成
 */
const createTestImageData = (width: number, height: number): ImageData => {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  // グラデーション背景
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#4a90d9')
  gradient.addColorStop(1, '#67b26f')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  return ctx.getImageData(0, 0, width, height)
}

const baseTransformState: TransformState = {
  mode: 'free-transform',
  center: { x: 150, y: 125 },
  scale: { x: 1, y: 1 },
  rotation: 0,
  originalBounds: { x: 50, y: 50, width: 200, height: 150 },
  originalImageData: null,
}

export const FreeTransform: Story = {
  args: {
    width: 400,
    height: 300,
    transformState: {
      ...baseTransformState,
      mode: 'free-transform',
    },
  },
}

export const ScaleOnly: Story = {
  args: {
    width: 400,
    height: 300,
    transformState: {
      ...baseTransformState,
      mode: 'scale',
    },
  },
}

export const RotateOnly: Story = {
  args: {
    width: 400,
    height: 300,
    transformState: {
      ...baseTransformState,
      mode: 'rotate',
    },
  },
}

export const Scaled: Story = {
  args: {
    width: 400,
    height: 300,
    transformState: {
      ...baseTransformState,
      mode: 'free-transform',
      scale: { x: 1.5, y: 1.5 },
    },
  },
}

export const ScaledDown: Story = {
  args: {
    width: 400,
    height: 300,
    transformState: {
      ...baseTransformState,
      mode: 'free-transform',
      scale: { x: 0.5, y: 0.5 },
    },
  },
}

export const Rotated45: Story = {
  args: {
    width: 400,
    height: 300,
    transformState: {
      ...baseTransformState,
      mode: 'free-transform',
      rotation: Math.PI / 4, // 45度
    },
  },
}

export const Rotated90: Story = {
  args: {
    width: 400,
    height: 300,
    transformState: {
      ...baseTransformState,
      mode: 'free-transform',
      rotation: Math.PI / 2, // 90度
    },
  },
}

export const ScaledAndRotated: Story = {
  args: {
    width: 400,
    height: 300,
    transformState: {
      ...baseTransformState,
      mode: 'free-transform',
      scale: { x: 1.3, y: 0.8 },
      rotation: Math.PI / 6, // 30度
    },
  },
}

export const WithPreviewImage: Story = {
  args: {
    width: 400,
    height: 300,
    transformState: {
      ...baseTransformState,
      mode: 'free-transform',
    },
    previewImageData: createTestImageData(200, 150),
  },
}

export const WithPreviewImageRotated: Story = {
  args: {
    width: 400,
    height: 300,
    transformState: {
      ...baseTransformState,
      mode: 'free-transform',
      rotation: Math.PI / 4,
    },
    previewImageData: createTestImageData(200, 150),
  },
}

export const WithPreviewImageScaled: Story = {
  args: {
    width: 400,
    height: 300,
    transformState: {
      ...baseTransformState,
      mode: 'free-transform',
      scale: { x: 1.5, y: 1.5 },
    },
    previewImageData: createTestImageData(200, 150),
  },
}

export const ZoomedIn: Story = {
  args: {
    width: 400,
    height: 300,
    transformState: baseTransformState,
    scale: 2,
    offset: { x: -100, y: -75 },
  },
}

export const ZoomedOut: Story = {
  args: {
    width: 400,
    height: 300,
    transformState: baseTransformState,
    scale: 0.5,
    offset: { x: 100, y: 75 },
  },
}

export const NonUniformScale: Story = {
  args: {
    width: 400,
    height: 300,
    transformState: {
      ...baseTransformState,
      mode: 'free-transform',
      scale: { x: 2, y: 0.5 },
    },
  },
}

export const FlippedHorizontal: Story = {
  args: {
    width: 400,
    height: 300,
    transformState: {
      ...baseTransformState,
      mode: 'free-transform',
      scale: { x: -1, y: 1 },
    },
    previewImageData: createTestImageData(200, 150),
  },
}

export const FlippedVertical: Story = {
  args: {
    width: 400,
    height: 300,
    transformState: {
      ...baseTransformState,
      mode: 'free-transform',
      scale: { x: 1, y: -1 },
    },
    previewImageData: createTestImageData(200, 150),
  },
}
