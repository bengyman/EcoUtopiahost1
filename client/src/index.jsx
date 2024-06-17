import React from 'react'
import ReactDOM from 'react-dom/client'
import '@mantine/core/styles.css';
import { MantineProvider, createTheme, rem } from '@mantine/core'
import App from './pages/App.jsx'

const theme = createTheme({
  //primaryColor: 'violet'
  colors: {
    /* Add your custom colors here */
    deepBlue: [
      '#eef3ff',
      '#dce4f5',
      '#b9c7e2',
      '#94a8d0',
      '#748dc1',
      '#5f7cb8',
      '#5474b4',
      '#44639f',
      '#39588f',
      '#2d4b81',
    ],
  },

  shadows: {
    md: '1px 1px 3px rgba(0, 0, 0, .25)',
    xl: '5px 5px 3px rgba(0, 0, 0, .25)',
  },

  headings: {
    fontFamily: 'Roboto, sans-serif',
    sizes: {
      h1: { fontSize: rem(36) },
    },
  },
})

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <MantineProvider theme={theme} defaultColorScheme='auto'>
      <App />
    </MantineProvider>
  </React.StrictMode>
)
