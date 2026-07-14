import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import { Toaster } from 'sonner'
import { GoogleOAuthProvider } from '@react-oauth/google'

export const metadata: Metadata = {
  title: 'AnswerBase',
  description: 'Instant answers for your customers.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased font-sans">
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'placeholder'}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </GoogleOAuthProvider>
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e2353',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#ffffff',
            },
          }}
        />
      </body>
    </html>
  )
}
