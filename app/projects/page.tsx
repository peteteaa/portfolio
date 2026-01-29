"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { useTheme } from "next-themes"
import PokemonAnimation from "@/components/PokemonAnimation"

export default function ProjectsPage() {
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
          <h1 className="text-xl font-bold text-white">Projects</h1>
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
            <h2 className="text-lg font-bold text-foreground">My Projects</h2>
          </div>

          <div className="grid gap-4">
            {[
              {
                title: "LaunchPad",
                description: "LaunchPad uses AI to turn GitHub repos into onboarding videos, built with Gemini, Tavus, GitHub API, Node.js, Python, and TSX.",
                image: "/images/poketracker.png",
                winner: true,
                winnerDescription: "2x Winner At Creators Corner NVIDIA GTC Hack-Windsurf 2nd Place, Tavus 3rd Place"
              },
              {
                title: "LoveBubbles",
                description: "Lovebubbles is a Valentine's-themed collage generator that uses a Python backend, JS frontend, and Black Forest Labs' Flux 1.1 Ultra model, built with Windsurf IDE and Codeiume",
                image: "/images/pixel-generator.png",
                winner: true,
                winnerDescription: "Winner at AGI House Romantic Hacker-Windsurf 3rd Place"
              },
              {
                title: "LeetRizz",
                description: "Leetrizz is Leetcode-style game created using tsx with a python backend which rates a users 'rizz'  or charisma",
                image: "/images/retro-game.png",
                winner: true,
                winnerDescription: "USFCA Bloom-People's Choice"
              },
              {
                title: " Course Planner",
                description: "A tool to help  students plan their course schedule efficiently",
                image: "/images/course-planner.png",
                winner: false
              },
            ].map((project, index) => (
              <Card
                key={index}
                className="overflow-hidden border border-border bg-card relative"
              >
                <div className="flex items-start gap-3 p-3">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                    <Image
                      src={project.image || "/placeholder.svg"}
                      width={64}
                      height={64}
                      alt={project.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">{project.title}</h3>
                      {project.winner && (
                        <div className="tooltip-container">
                          <Badge className="bg-green-500 text-white text-xs px-2 py-0.5 border border-[#333] cursor-help">
                            Winner 🏆
                          </Badge>
                          <style jsx>{`
                            .tooltip-container {
                              position: relative;
                              display: inline-block;
                            }
                            .tooltip-container:hover .tooltip {
                              visibility: visible;
                              opacity: 1;
                            }
                            .tooltip {
                              visibility: hidden;
                              position: absolute;
                              z-index: 100;
                              left: 0;
                              top: 100%;
                              margin-top: 5px;
                              width: auto;
                              min-width: 700px;
               
                              white-space: normal;
                              background-color: rgba(0, 0, 0, 0.9);
                              color: white;
                              text-align: left;
                              padding: 8px;
                              border-radius: 6px;
                              border: 1px solid #333;
                              font-size: 0.75rem;
                              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                              opacity: 0;
                              transition: opacity 0.3s;
                            }
                          `}</style>
                          <div className="tooltip">
                            {project.winnerDescription || "This project won recognition at a hackathon or competition for its innovation and execution."}
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{project.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Bottom Status Bar - Empty as requested */}
        <div className="border-t border-border bg-background p-2 text-center text-sm">
          <p></p>
        </div>
      </div>
    </div>
  )
}
