import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Varientropy | Divergence Gate',
  description: 'A fallible scientific agent for hypothesis generation.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
