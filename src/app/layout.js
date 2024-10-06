import '@mantine/core/styles.css';
import { MantineProvider, ColorSchemeScript } from '@mantine/core';

const theme = {
  colorScheme: 'dark',
  colors: {
    dark: [
      '#FFFFFF',
      '#A6A7AB',
      '#909296',
      '#5C5F66',
      '#373A40',
      '#2C2E33',
      '#25262B',
      '#1A1B1E',
      '#141517',
      '#101113',
    ],
  },
};

export const metadata = {
  title: 'Audio Cutter',
  description: 'Free editor to trim and cut any audio file online',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}