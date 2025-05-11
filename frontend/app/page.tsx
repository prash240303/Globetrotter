"use client";
import React, { useState, useEffect } from "react";
import Game from "../components/Game";
import ScoreTracker from "../components/ScoreTracker";
import GameResult from "../components/GameResult";
import UserProfile from "../components/Profile";
import ChallengeButton from "../components/ChallengeButton";
import { Globe } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
      const response = await fetch(`http://localhost:8000/api/players/name/${playerName}`);
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
      const response = await fetch(`http://localhost:8000/api/players/code/${referralCode}`);
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
      const response = await fetch("http://localhost:8000/api/players/score", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player_name: playerName, score: newScore }),
      });

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <Globe className="h-16 w-16 text-primary animate-spin" />
          <p className="mt-4 text-lg font-medium">Loading your adventure...</p>
        </div>
      </div>
    );
  }

  if (!username) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-sky-50 to-blue-100 dark:from-slate-900 dark:to-slate-800">
        <Card className="w-full max-w-md shadow-lg border-t-4 border-t-primary">
          <CardHeader className="pb-2">
            <div className="flex justify-center mb-4">
              <Globe className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-center text-3xl font-bold">GeoGuess</CardTitle>
            <p className="text-center text-sm text-muted-foreground mt-1">
              Unravel the Clues, Discover the World!
            </p>
          </CardHeader>
          <CardContent>
            <UserProfile onProfileSubmit={handleProfileSubmit} />
            {invitedBy && (
              <Alert className="mt-6 border-primary/50 bg-primary/5">
                <AlertTitle className="font-bold">
                  You've been challenged by {invitedBy.player_name}!
                </AlertTitle>
                <AlertDescription>
                  Their high score: <span className="font-semibold">{invitedBy.best_score}</span> — can you beat it?
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex justify-center text-xs text-muted-foreground">
            Test your geography knowledge with friends!
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 space-y-6 bg-gradient-to-b from-sky-50 to-blue-100 dark:from-slate-900 dark:to-slate-800">
      <Card className="w-full max-w-3xl shadow-lg border-t-4 border-t-primary">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Globe className="h-8 w-8 text-primary mr-2" />
              <CardTitle className="text-2xl md:text-3xl font-bold">GeoGuess</CardTitle>
            </div>
            {userProfile && (
              <div className="flex items-center bg-primary/10 px-3 py-1 rounded-full text-sm">
                <span className="font-medium mr-1">Best:</span>
                <span className="font-bold">{userProfile.best_score}</span>
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">Unravel the Clues, Discover the World!</p>
          <Separator className="my-3" />
          <div className="flex justify-between items-center">
            <p className="text-sm">
              Explorer: <span className="font-semibold text-primary">{username}</span>
            </p>
            <ScoreTracker score={score} />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {gameOver ? (
            <GameResult
              score={score}
              username={username}
              onPlayAgain={handlePlayAgain}
            />
          ) : (
            <Game onAnswer={handleAnswer} />
          )}

          {userProfile && !gameOver && (
            <div className="mt-6 flex justify-center">
              <ChallengeButton
                username={username}
                highScore={userProfile.best_score}
                referralCode={userProfile.referral_code}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default App;