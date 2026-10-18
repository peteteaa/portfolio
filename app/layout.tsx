import type React from "react"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import PlazaStrip from "@/components/plaza/PlazaStrip"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" />
        <title>pthambundit.dev</title>
        {/* runs before first paint: if the boot intro will play, keep the page black until it appears */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(location.pathname==="/"&&sessionStorage.getItem("eva-boot-seen")!=="1")document.documentElement.classList.add("eva-boot-pending")}catch(e){}`,
          }}
        />
      </head>
      <body className="font-retro">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} themes={["light", "dark"]}>
          {children}
          <PlazaStrip />
        </ThemeProvider>
      </body>
    </html>
  )
}
