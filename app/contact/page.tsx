"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useTheme } from "next-themes"
import PokemonAnimation from "@/components/PokemonAnimation"

export default function ContactPage() {
  const [currentTime, setCurrentTime] = useState("")
  const [currentDate, setCurrentDate] = useState("")
  const { theme } = useTheme()

  useEffect(() => {
    // Set initial time and date
    updateDateTime()

    // Update time every minute
    const interval = setInterval(updateDateTime, 60000)

    return () => clearInterval(interval)
  }, [])

  const updateDateTime = () => {
    const now = new Date()

    // Format time as HH:MM
    const hours = now.getHours().toString().padStart(2, "0")
    const minutes = now.getMinutes().toString().padStart(2, "0")
    setCurrentTime(`${hours}:${minutes}`)

    // Format date as M/D (Day)
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const month = now.getMonth() + 1
    const day = now.getDate()
    const dayName = days[now.getDay()]
    setCurrentDate(`${month}/${day} (${dayName})`)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground font-retro">
      {/* 3DS Top Screen */}
      <div className="relative h-[35vh] w-full overflow-hidden border-b-4 border-[#333333] dark:border-[#333333] light:border-[#87ceeb]">
        <div className="absolute inset-0">
          <Image
            src={theme === "dark" ? "/images/night.gif" : "/images/cloud.gif"}
            alt="Sky Background"
            width={800}
            height={400}
            className="h-full w-full object-cover pixelated"
            priority
          />
          <PokemonAnimation />
        </div>

        {/* Status Bar */}
        <div className="absolute left-0 right-0 top-0 flex items-center justify-between bg-[#0066cc]/80 p-2 text-xs text-white dark:bg-[#0066cc]/80 light:bg-[#87ceeb]/80">
          <div className="flex items-center gap-1">
            <div className="h-4 w-4 bg-[#33ccff] dark:bg-[#33ccff] light:bg-[#4169e1]"></div>
            <span>Internet</span>
          </div>
          <div className="flex items-center gap-2">
            <span>⭐ 800</span>
            <span>{currentDate}</span>
            <span>{currentTime}</span>
            <div className="h-4 w-8 bg-[#ffcc00]"></div>
          </div>
        </div>

        {/* Page Title */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-4">
          <h1 className="text-xl font-bold text-white">Contact</h1>
        </div>
      </div>

      {/* 3DS Bottom Screen */}
      <div className="relative flex flex-1 flex-col bg-background">
        {/* Main Content Area */}
        <div className="flex-1 overflow-auto p-4">
          <div className="mb-4 flex items-center">
            <Link href="/">
              <Button
                variant="ghost"
                size="icon"
                className="mr-2 h-8 w-8 rounded-full bg-muted"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h2 className="text-lg font-bold dark:text-white light:text-[#333]">Contact Me</h2>
          </div>

          <Card className="mb-4 border border-border bg-card p-4">
            <form 
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                // Form submission logic can be added here if needed
              }}
            >
              <div className="space-y-1">
                <label htmlFor="name" className="block text-xs font-medium text-foreground">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  className="w-full rounded border border-input bg-background p-2 text-xs text-foreground focus:border-ring focus:outline-none"
                  placeholder="Your Name"
                />
              </div>
  
              <div className="space-y-1">
                <label htmlFor="message" className="block text-xs font-medium text-foreground">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className="w-full rounded border border-input bg-background p-2 text-xs text-foreground focus:border-ring focus:outline-none"
                  placeholder="Hi, I'd like to discuss a project..."
                ></textarea>
              </div>
              <Button className="w-full px-4 py-1 text-xs">
                Send Message
              </Button>
            </form>
          </Card>

          <Card className="border border-border bg-card p-4">
            <h3 className="mb-3 text-sm font-bold text-foreground">Connect With Me</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-transparent">
                  <Image src="/images/mail-icon.png" width={24} height={24} alt="Email" className="pixelated" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-xs font-medium text-foreground">pthambundit@icloud.com</p>
                </div>
              </div>
              <a 
                href="https://github.com/peteteaa" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 transition-opacity hover:opacity-80"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-transparent">
                  <Image src="/images/github-icon.png" width={24} height={24} alt="GitHub" className="pixelated" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">GitHub</p>
                  <p className="text-xs font-medium text-foreground">github.com/peteteaa</p>
                </div>
              </a>
              <a 
                href="https://www.linkedin.com/in/pete-thambundit-91b740324" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 transition-opacity hover:opacity-80"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-transparent">
                  <Image src="/images/linkedin-icon.png" width={24} height={24} alt="LinkedIn" className="pixelated" />
                </div>
                <div>
                  <p className="text-xs text-gray-300 dark:text-gray-300 light:text-gray-100">LinkedIn</p>
                  <p className="text-xs font-medium dark:text-white light:text-white">LinkedIn</p>
                </div>
              </a>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-transparent">
                  <Image
                    src="/images/instagram-icon.png"
                    width={24}
                    height={24}
                    alt="Instagram"
                    className="pixelated"
                  />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Instagram</p>
                  <p className="text-xs font-medium text-foreground">instagram.com/peteteaa</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Bottom Status Bar - Empty as requested */}
        <div className="border-t border-border bg-background p-2 text-center text-sm">
          <p></p>
        </div>
      </div>
    </div>
  )
}
