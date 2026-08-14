import './globals.css'
import CookieConsent from '@/components/CookieConsent'

export const metadata = {
  title: 'Ndarinzwe Health',
  description: 'Empowering Safe Motherhood Through Digital Support',
  icons: { icon: '/images/favicon.png' },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <CookieConsent />
      </body>
    </html>
  )
}
