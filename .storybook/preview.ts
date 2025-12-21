import type { Preview } from '@storybook/react-vite'
import '../src/index.css'

const preview: Preview = {
  parameters: {
    options: {
      storySort: {
        order: ['UI'],
      },
    },
  },
}

export default preview