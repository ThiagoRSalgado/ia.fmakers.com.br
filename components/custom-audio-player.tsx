"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CustomAudioPlayerProps {
  src: string
  className?: string
  variant?: "user" | "bot"
}

export function CustomAudioPlayer({ src, className = "", variant = "user" }: CustomAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [audioData, setAudioData] = useState<number[]>([])
  const audioRef = useRef<HTMLAudioElement>(null)

  // Generate mock waveform data (in a real app, you'd analyze the audio file)
  useEffect(() => {
    const generateWaveform = () => {
      const bars = 40
      const data = Array.from({ length: bars }, () => Math.random() * 0.8 + 0.2)
      setAudioData(data)
    }
    generateWaveform()
  }, [src])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => setIsPlaying(false)

    audio.addEventListener("timeupdate", updateTime)
    audio.addEventListener("loadedmetadata", updateDuration)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("timeupdate", updateTime)
      audio.removeEventListener("loadedmetadata", updateDuration)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [])

  const togglePlayPause = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const progress = duration > 0 ? currentTime / duration : 0

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-2xl ${
        variant === "user" ? "bg-[#12444B] text-white" : "bg-gray-100 text-gray-800"
      } ${className}`}
    >
      <audio ref={audioRef} src={src} preload="metadata" />

      <Button
        variant="ghost"
        size="sm"
        onClick={togglePlayPause}
        className={`w-8 h-8 rounded-full p-0 ${
          variant === "user" ? "bg-white/20 hover:bg-white/30 text-white" : "bg-white hover:bg-gray-50 text-gray-800"
        }`}
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
      </Button>

      <div className="flex-1 flex items-center gap-2">
        <div className="flex items-end gap-0.5 h-6 flex-1">
          {audioData.map((height, index) => {
            const isActive = progress > index / audioData.length
            return (
              <div
                key={index}
                className={`w-1 rounded-full transition-all duration-150 ${
                  variant === "user"
                    ? isActive
                      ? "bg-white"
                      : "bg-white/40"
                    : isActive
                      ? "bg-[#12444B]"
                      : "bg-gray-300"
                }`}
                style={{
                  height: `${Math.max(height * 100, 20)}%`,
                  minHeight: "2px",
                }}
              />
            )
          })}
        </div>

        <span className={`text-xs font-medium ${variant === "user" ? "text-white/80" : "text-gray-500"}`}>
          {formatTime(duration)}
        </span>
      </div>
    </div>
  )
}
