import './globals.css'
import { Onest } from 'next/font/google'
import { PopupProvider } from '@/app/(public)/context/PopupContext';
import MaintenanceWrapper from './MaintenanceWrapper'; // ⭐ new client component
export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = 0

const onest = Onest({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-onest",
});

export const metadata = {
  title: 'Current',
  description: 'Stay current with campus life!',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={onest.className}>
        <PopupProvider>
          <MaintenanceWrapper>{children}</MaintenanceWrapper>
        </PopupProvider>
      </body>
    </html>
  )
}
