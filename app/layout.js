import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
})

export const metadata = {
  title: 'Kurdish Table Manager | وەجهەی مەلازم',
  description: 'Kurdish table management system for organizing student and personnel data',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ku" dir="rtl">
      <body className={inter.className} style={{ fontFamily: 'Tahoma, Arial, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}