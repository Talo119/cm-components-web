import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
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
