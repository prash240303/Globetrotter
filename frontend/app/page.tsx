"use client";
import { useState, useEffect } from "react";
import Game from "../components/Game";
import ScoreTracker from "../components/ScoreTracker";
import GameResult from "../components/GameResult";
import UserProfile from "../components/Profile";
import ChallengeButton from "../components/ChallengeButton";
import { Globe, RotateCcw, Trophy } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type Score = {
  correct: number;
  incorrect: number;
  total: number;
};

type UserProfileType = {
  id: number;
  player_name: string;
  referral_code: string;
  best_score: number;
};

function App() {
  const [score, setScore] = useState<Score>({
    correct: 0,
    incorrect: 0,
    total: 0,
  });

  const [gameOver, setGameOver] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [userProfile, setUserProfile] = useState<UserProfileType | null>(null);
  const [invitedBy, setInvitedBy] = useState<UserProfileType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedUsername = localStorage.getItem("globetrotter_username");
    if (storedUsername) {
      setUsername(storedUsername);
      fetchUserProfile(storedUsername);
    } else {
      setLoading(false);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const referralCode = urlParams.get("code");
    if (referralCode) {
      fetchInviterProfile(referralCode);
    }
  }, []);

  const fetchUserProfile = async (playerName: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/players/name/${playerName}`
      );
      if (response.ok) {
        const data: UserProfileType = await response.json();
        setUserProfile(data);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInviterProfile = async (referralCode: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/players/code/${referralCode}`
      );
      if (response.ok) {
        const data: UserProfileType = await response.json();
        setInvitedBy(data);
      }
    } catch (error) {
      console.error("Error fetching inviter profile:", error);
    }
  };

  const handleAnswer = (isCorrect: boolean) => {
    setScore((prevScore) => ({
      correct: isCorrect ? prevScore.correct + 1 : prevScore.correct,
      incorrect: isCorrect ? prevScore.incorrect : prevScore.incorrect + 1,
      total: prevScore.total + 1,
    }));

    if (!isCorrect) {
      setGameOver(true);
    }
  };

  const handleProfileSubmit = (profile: UserProfileType) => {
    setUsername(profile.player_name);
    setUserProfile(profile);
  };

  const handlePlayAgain = () => {
    setScore({ correct: 0, incorrect: 0, total: 0 });
    setGameOver(false);

    if (userProfile && score.correct > userProfile.best_score) {
      updateUserScore(userProfile.player_name, score.correct);
    }
  };

  const updateUserScore = async (playerName: string, newScore: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/players/score`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ player_name: playerName, score: newScore }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (userProfile) {
          setUserProfile({ ...userProfile, best_score: data.best_score });
        }
      }
    } catch (error) {
      console.error("Error updating score:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F0F1FF]">
        <div className="animate-pulse flex flex-col items-center">
          <Globe className="h-16 w-16 text-[#6AB999] animate-spin" />
          <p className="mt-4 text-lg font-medium text-[#6AB999]">
            Loading your adventure...
          </p>
        </div>
      </div>
    );
  }

  if (!username) {
    return (
      <div className="relative flex flex-col items-center  py-0 justify-center min-h-screen px-4 bg-[url('/map-texture.jpg')] bg-cover bg-center before:absolute before:inset-0 before:bg-[#6AB999]/50 before:z-0">
        <div className="relative z-10 w-full max-w-md">
          <Card className="shadow-2xl border-0 rounded-3xl overflow-hidden transform transition-all hover:scale-105 hover:shadow-2xl duration-300">
            <CardHeader className="pb-4 pt-6 bg-gradient-to-r from-[#6AB999] via-[#23676A] to-[#4CD964] rounded-t-3xl">
              <CardTitle className="text-center text-5xl font-bold text-white animate-pulse">
                Globetrotter Challenge
              </CardTitle>
              <p className="text-center text-lg text-white mt-2">
                Test your geography knowledge and explore the world!
              </p>
            </CardHeader>
            <CardContent className="p-8 bg-[#F1F5F8] rounded-b-3xl">
              <UserProfile onProfileSubmit={handleProfileSubmit} />
              {invitedBy && (
                <Alert className="mt-12 border-[#FFCF54] bg-[#FFFBEB] rounded-xl animate-bounce">
                  <AlertTitle className="font-bold text-[#B5952B] text-lg">
                    You've been challenged by {invitedBy.player_name}!
                  </AlertTitle>
                  <AlertDescription className="text-[#6B5F2E] text-base">
                    Their high score:{" "}
                    <span className="font-semibold text-[#FF5757]">
                      {invitedBy.best_score}
                    </span>{" "}
                    — can you beat it?
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex justify-center text-lg text-[#8A8FB9] pb-4">
              <span className="text-xl font-semibold text-[#6AB999]">
                Challenge friends and become a geography master!
              </span>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex  flex-col items-center justify-start min-h-screen p-4 bg-[url('/map-texture.jpg')] bg-cover bg-center ">
      <div className="relative z-10 w-full max-w-4xl">
        <Card className="shadow-2xl border-2 border-yellow-700 rounded-2xl bg-[#fffaf0]/90">
          <div className="px-6 flex flex-row justify-between items-center">
            <div className="text-3xl py-6 gap-6 md:text-4xl font-bold text-[#6AB999]">
              Globetrotter Challenge
            </div>
            {userProfile && (
              <div className="flex items-center bg-[#feeca1] px-6 py-1 rounded-full text-[#B5952B]">
                <Trophy className="h-5 w-5 mr-3" />
                <span className="font-bold text-3xl">
                  {userProfile.best_score}
                </span>
              </div>
            )}
          </div>

          <CardContent className="py-0 my-0">
            <div className="flex justify-between items-center mb-4">
              <p className="text-2xl text-[#6AB999] font-medium">
                Explorer: <span className="font-semibold">{username}</span>
              </p>
              <ScoreTracker score={score} />
            </div>

            <div className="bg-[#fff8e1] border-yellow-600 border-2 rounded-xl shadow-inner">
              <div className="text-center py-4">
                <h2 className="text-4xl font-semibold text-yellow-800">
                  Your Quest Awaits!
                </h2>
              </div>
              <div className="p-4">
                {gameOver ? (
                  <GameResult
                    score={score}
                    username={username}
                    onPlayAgain={handlePlayAgain}
                  />
                ) : (
                  <Game onAnswer={handleAnswer} />
                )}
              </div>
            </div>

            <div className="my-4 flex justify-center gap-4">
              <Button
                variant="outline"
                className="bg-[#6AB999] hover:scale-105 cursor-pointer hover:bg-[#4f9f80] text-white hover:text-white border-0 px-8 py-6 flex items-center gap-4 shadow-lg transition-all duration-200"
                onClick={handlePlayAgain}
              >
                <RotateCcw className="h-5 w-5" />
                <span className="font-semibold text-xl">Play Again</span>
              </Button>

              {userProfile && (
                <ChallengeButton
                  username={username}
                  highScore={userProfile.best_score}
                  referralCode={userProfile.referral_code}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;
