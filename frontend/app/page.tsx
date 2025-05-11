"use client"
import { useState, useEffect } from "react"
import Game from "../components/Game"
import ScoreTracker from "../components/ScoreTracker"
import GameResult from "../components/GameResult"
import UserProfile from "../components/Profile"
import ChallengeButton from "../components/ChallengeButton"
import { Globe, RotateCcw, Trophy } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

type Score = {
  correct: number
  incorrect: number
  total: number
}

type UserProfileType = {
  id: number
  player_name: string
  referral_code: string
  best_score: number
}

function App() {
  const [score, setScore] = useState<Score>({
    correct: 0,
    incorrect: 0,
    total: 0,
  })

  const [gameOver, setGameOver] = useState<boolean>(false)
  const [username, setUsername] = useState<string>("")
  const [userProfile, setUserProfile] = useState<UserProfileType | null>(null)
  const [invitedBy, setInvitedBy] = useState<UserProfileType | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const storedUsername = localStorage.getItem("globetrotter_username")
    if (storedUsername) {
      setUsername(storedUsername)
      fetchUserProfile(storedUsername)
    } else {
      setLoading(false)
    }

    const urlParams = new URLSearchParams(window.location.search)
    const referralCode = urlParams.get("code")
    if (referralCode) {
      fetchInviterProfile(referralCode)
    }
  }, [])

  const fetchUserProfile = async (playerName: string) => {
    try {
      setLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/players/name/${playerName}`)
      if (response.ok) {
        const data: UserProfileType = await response.json()
        setUserProfile(data)
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchInviterProfile = async (referralCode: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/players/code/${referralCode}`)
      if (response.ok) {
        const data: UserProfileType = await response.json()
        setInvitedBy(data)
      }
    } catch (error) {
      console.error("Error fetching inviter profile:", error)
    }
  }

  const handleAnswer = (isCorrect: boolean) => {
    setScore((prevScore) => ({
      correct: isCorrect ? prevScore.correct + 1 : prevScore.correct,
      incorrect: isCorrect ? prevScore.incorrect : prevScore.incorrect + 1,
      total: prevScore.total + 1,
    }))

    if (!isCorrect) {
      setGameOver(true)
    }
  }

  const handleProfileSubmit = (profile: UserProfileType) => {
    setUsername(profile.player_name)
    setUserProfile(profile)
  }

  const handlePlayAgain = () => {
    setScore({ correct: 0, incorrect: 0, total: 0 })
    setGameOver(false)

    if (userProfile && score.correct > userProfile.best_score) {
      updateUserScore(userProfile.player_name, score.correct)
    }
  }

  const updateUserScore = async (playerName: string, newScore: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/players/score`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player_name: playerName, score: newScore }),
      })

      if (response.ok) {
        const data = await response.json()
        if (userProfile) {
          setUserProfile({ ...userProfile, best_score: data.best_score })
        }
      }
    } catch (error) {
      console.error("Error updating score:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F0F1FF]">
        <div className="animate-pulse flex flex-col items-center">
          <Globe className="h-16 w-16 text-[#7B5BE6] animate-spin" />
          <p className="mt-4 text-lg font-medium text-[#7B5BE6]">Loading your adventure...</p>
        </div>
      </div>
    )
  }

  if (!username) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#F0F1FF]">
        <Card className="w-full max-w-md shadow-xl border-0 rounded-2xl overflow-hidden">
          <CardHeader className="pb-2 pt-8">
            <CardTitle className="text-center text-3xl font-bold text-[#7B5BE6]">Globetrotter Challenge</CardTitle>
            <p className="text-center text-sm text-[#8A8FB9] mt-2">
              Test your geography knowledge and explore the world!
            </p>
          </CardHeader>
          <CardContent className="p-8">
            <UserProfile onProfileSubmit={handleProfileSubmit} />
            {invitedBy && (
              <Alert className="mt-8 border-[#FFCF54] bg-[#FFFBEB] rounded-xl">
                <AlertTitle className="font-bold text-[#B5952B]">
                  You've been challenged by {invitedBy.player_name}!
                </AlertTitle>
                <AlertDescription className="text-[#6B5F2E]">
                  Their high score: <span className="font-semibold">{invitedBy.best_score}</span> — can you beat it?
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex justify-center text-xs text-[#8A8FB9] pb-8">
            Challenge friends and become a geography master!
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 bg-[#F0F1FF]">
      <Card className="w-full max-w-4xl shadow-xl border-0 rounded-2xl overflow-hidden">
        <CardHeader className="pb-2 pt-6 px-6 flex flex-row justify-between items-center">
          <CardTitle className="text-2xl md:text-3xl font-bold text-[#7B5BE6]">Globetrotter Challenge</CardTitle>
          {userProfile && (
            <div className="flex items-center bg-[#FFFBEB] px-4 py-2 rounded-full text-[#B5952B]">
              <Trophy className="h-4 w-4 mr-2" />
              <span className="font-bold">{userProfile.best_score}</span>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-[#7B5BE6] font-medium">
              Explorer: <span className="font-semibold">{username}</span>
            </p>
            <ScoreTracker score={score} />
          </div>

          {gameOver ? (
            <GameResult score={score} username={username} onPlayAgain={handlePlayAgain} />
          ) : (
            <>
              <Game onAnswer={handleAnswer} />
              <div className="mt-8 flex justify-center gap-4">
                <Button
                  variant="outline"
                  className="bg-[#FF5757] hover:bg-[#E04A4A] text-white border-0 rounded-full px-6 py-2 flex items-center gap-2 shadow-md"
                  onClick={handlePlayAgain}
                >
                  <RotateCcw className="h-4 w-4" /> Play Again
                </Button>
                {userProfile && (
                  <ChallengeButton
                    username={username}
                    highScore={userProfile.best_score}
                    referralCode={userProfile.referral_code}
                  />
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default App
