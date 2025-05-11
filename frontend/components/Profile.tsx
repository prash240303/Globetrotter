"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Globe } from "lucide-react"

interface UserProfileProps {
  onProfileSubmit: (profile: UserProfileData) => void
  existingUsername?: string
}

interface UserProfileData {
  id: number
  player_name: string
  referral_code: string
  best_score: number
}

const UserProfile = ({ onProfileSubmit, existingUsername }: UserProfileProps) => {
  const [username, setUsername] = useState<string>(existingUsername || "")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const storedUsername = localStorage.getItem("globetrotter_username")
    if (storedUsername && !existingUsername) {
      setUsername(storedUsername)
      fetchExistingPlayer(storedUsername)
    }
  }, [])

  const fetchExistingPlayer = async (playerName: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/players/name/${playerName}`)
      if (response.ok) {
        const data = await response.json()
        onProfileSubmit(data)
        return true
      }
      return false
    } catch (error) {
      console.error("Error fetching player:", error)
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username.trim()) {
      setError("Please enter a username")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const existingPlayer = await fetchExistingPlayer(username)

      if (!existingPlayer) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/players`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ player_name: username }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.detail || "Something went wrong")
        }

        const data = await response.json()
        onProfileSubmit(data)
        localStorage.setItem("globetrotter_username", username)
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 rounded-full bg-[#F5F6FF] flex items-center justify-center">
          <Globe className="h-10 w-10 text-[#7B5BE6]" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="username" className="text-[#7B5BE6] font-medium">
            Explorer Name
          </Label>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your name"
            disabled={isSubmitting}
            className="border-[#E0E3FF] focus:border-[#7B5BE6] rounded-xl py-6 px-4 text-lg"
          />
        </div>

        {error && <p className="text-[#FF5757] text-sm font-medium">{error}</p>}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#7B5BE6] hover:bg-[#6A4DD3] text-white font-medium py-6 rounded-xl shadow-md"
        >
          {isSubmitting ? "Submitting..." : "Start Exploring"}
        </Button>
      </form>
    </div>
  )
}

export default UserProfile
