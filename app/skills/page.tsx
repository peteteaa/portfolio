"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useTheme } from "next-themes"

export default function SkillsPage() {
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
    <div className="flex min-h-screen flex-col bg-[#1a1a1a] font-retro text-white dark:bg-[#1a1a1a] light:bg-[#f8f8f8]">
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
          <h1 className="text-xl font-bold text-white">Skills</h1>
        </div>
      </div>

      {/* 3DS Bottom Screen */}
      <div className="relative flex flex-1 flex-col bg-gradient-to-b from-[#3b5998] to-[#192a56] dark:from-[#3b5998] dark:to-[#192a56] light:from-[#a0d8ef] light:to-[#87ceeb]">
        {/* Main Content Area */}
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
            <h2 className="text-lg font-bold dark:text-white light:text-[#333]">My Skills</h2>
          </div>

          <div className="grid gap-6">
            {[
              {
                category: "Languages",
                skills: ["JavaScript", "TypeScript", "Python", "Java", "C++", "HTML/CSS"],
                color: "#4169e1",
              },
              {
                category: "Frontend",
                skills: ["React", "Next.js", "Vue.js", "Tailwind CSS", "GSAP", "Three.js"],
                color: "#9932cc",
              },
              {
                category: "Backend",
                skills: ["Node.js", "Express", "Django", "Firebase", "MongoDB", "PostgreSQL"],
                color: "#ff6347",
              },
              {
                category: "Tools",
                skills: ["Git", "Docker", "AWS", "Figma", "Aseprite", "Unity"],
                color: "#32cd32",
              },
            ].map((category, index) => (
              <Card
                key={index}
                className="border-2 border-[#333] bg-[#192a56]/80 p-3 dark:bg-[#192a56]/80 light:bg-[#4169e1]/60"
              >
                <div className="mb-2 flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md" style={{ backgroundColor: category.color }}></div>
                  <h3 className="text-sm font-bold dark:text-white light:text-white">{category.category}</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {category.skills.map((skill, skillIndex) => (
                    <div key={skillIndex} className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-white"></div>
                      <span className="text-xs dark:text-white light:text-white">{skill}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Bottom Status Bar - Empty as requested */}
        <div className="border-t-2 border-[#333] bg-[#4682b4] p-2 text-center text-sm dark:bg-[#4682b4] light:bg-[#87ceeb] dark:border-[#333] light:border-[#4169e1]">
          <p></p>
        </div>
      </div>
    </div>
  )
}
