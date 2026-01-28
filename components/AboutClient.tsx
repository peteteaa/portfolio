"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "next-themes"
import PokemonAnimation from "@/components/PokemonAnimation"

export default function AboutClient() {
  const [currentTime, setCurrentTime] = useState("")
  const [currentDate, setCurrentDate] = useState("")
  const { theme } = useTheme()

  useEffect(() => {
    updateDateTime()
    const interval = setInterval(updateDateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  const updateDateTime = () => {
    const now = new Date()
    const hours = now.getHours().toString().padStart(2, "0")
    const minutes = now.getMinutes().toString().padStart(2, "0")
    setCurrentTime(`${hours}:${minutes}`)

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const month = now.getMonth() + 1
    const day = now.getDate()
    const dayName = days[now.getDay()]
    setCurrentDate(`${month}/${day} (${dayName})`)
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#1a1a1a] font-retro text-white dark:bg-[#1a1a1a] light:bg-[#f8f8f8]">
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

        <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-4">
          <h1 className="text-xl font-bold text-white">About</h1>
        </div>
      </div>

      <div className="relative flex flex-1 flex-col bg-gradient-to-b from-[#3b5998] to-[#192a56] dark:from-[#3b5998] dark:to-[#192a56] light:from-[#a0d8ef] light:to-[#87ceeb]">
        <div className="flex-1 overflow-auto p-4">
          <div className="mb-4 flex items-center">
            <Link href="/">
              <Button
                variant="ghost"
                size="icon"
                className="mr-2 h-8 w-8 rounded-full bg-[#333]/50 dark:bg-[#333]/50 light:bg-[#333]/20"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h2 className="text-lg font-bold dark:text-white light:text-white">About Me</h2>
          </div>

          <div className="mb-4 flex flex-col items-center">
            <div className="relative mb-2 h-32 w-32 overflow-hidden rounded-full border-4 border-[#333] transform transition-transform duration-500 scale-100 opacity-100">
              <Image
                src="/images/pete.jpg"
                width={128}
                height={128}
                alt="Developer avatar"
                className="pixelated object-contain"
              />
            </div>
            <h3 className="text-lg font-bold dark:text-white light:text-[#333] transition-opacity duration-300">Pete</h3>
            <p className="text-xs text-gray-300 dark:text-gray-300 light:text-[#333]/80 transition-opacity duration-300">CS Major @USFCA</p>
          </div>

          <div className="opacity-100 transition-opacity duration-500">
            <Card className="mb-4 border-2 border-[#333] bg-[#192a56]/80 p-4 dark:bg-[#192a56]/80 light:bg-[#4169e1]/60">
              <h3 className="mb-2 text-sm font-bold text-white">Background</h3>
              <div>
                <p className="mb-2 text-xs text-white">I'm a Computer Science major with a passion for creating engaging digital experiences. I enjoy going to hackathons,where I can make new friends, while also building cool projects!</p>
                <p className="text-xs text-white">Currently, I'm focused on full-stack web development, UI/UX Design, and AI/ML as well as exploring the intersection of art and technology. When I'm not coding, you can find me in the gym, practicing Muay Thai, collecting Pokemon cards, or Bouldering.</p>
              </div>
            </Card>
          </div>

          <div className="opacity-100 transition-opacity duration-500">
            <Card className="border-2 border-[#333] bg-[#192a56]/80 p-4 dark:bg-[#192a56]/80 light:bg-[#4169e1]/60">
              <h3 className="mb-2 text-sm font-bold text-white">Interests & Hobbies</h3>
              <div className="flex flex-wrap gap-2">
                <Link href="/interests/pokemon-cards" className="inline-block">
                  <Badge className="border-2 border-[#333] bg-[#4169e1] text-xs text-white">Pokemon Cards</Badge>
                </Link>
                <Link href="/interests/bouldering" className="inline-block">
                  <Badge className="border-2 border-[#333] bg-[#9932cc] text-xs text-white">Bouldering</Badge>
                </Link>
                <Link href="/interests/muay-thai" className="inline-block">
                  <Badge className="border-2 border-[#333] bg-[#ff6347] text-xs text-white">Muay Thai</Badge>
                </Link>
                <Link href="/interests/web-development" className="inline-block">
                  <Badge className="border-2 border-[#333] bg-[#32cd32] text-xs text-white">Web Development</Badge>
                </Link>
                <Link href="/interests/ai-ml" className="inline-block">
                  <Badge className="border-2 border-[#333] bg-[#ffd700] text-xs text-white">AI & ML</Badge>
                </Link>
                <Link href="/interests/running" className="inline-block">
                  <Badge className="border-2 border-[#333] bg-[#4682b4] text-xs text-white">Running</Badge>
                </Link>
              </div>
            </Card>
          </div>
        </div>

        <div className="border-t-2 border-[#333] bg-[#4682b4] p-2 text-center text-sm dark:bg-[#4682b4] light:bg-[#87ceeb] dark:border-[#333] light:border-[#4169e1]">
          <p></p>
        </div>
      </div>
    </div>
  )
}
