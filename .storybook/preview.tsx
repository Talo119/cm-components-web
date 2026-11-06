import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import type { Preview } from '@storybook/react-vite'
import { CmThemeProvider } from '../src/index.ts'

const preview: Preview = {
  tags: ['autodocs'],
  decorators: [
    (Story, { parameters }) =>
      parameters.withoutThemeProvider ? (
        <Story />
      ) : (
        <CmThemeProvider baseline>
          <Story />
        </CmThemeProvider>
      ),
  ],
}

export default preview
