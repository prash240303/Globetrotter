"use client";
import React, { useEffect, useState } from "react";
import ChallengeButton from "./ChallengeButton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, RotateCcw } from 'lucide-react';

interface Score {
  correct: number;
  incorrect: number;
  total: number;
}

interface ScoreUpdateResult {
  player_name: string;
  best_score: number;
  is_personal_best: boolean;
}

interface GameResultProps {
  score: Score;
  username: string;
  onPlayAgain: () => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

function GameResult({ score, username, onPlayAgain }: GameResultProps) {
  const [result, setResult] = useState<ScoreUpdateResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState<string>("");

  useEffect(() => {
    const saveScore = async () => {
      if (!username) {
        setLoading(false);
        return;
      }

      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/api/players/score`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            player_name: username,
            score: score.correct,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || `Failed to save score: ${response.status}`);
        }

        const data = await response.json();
        setResult(data);

        try {
          const profileResponse = await fetch(`${API_BASE_URL}/api/players/name/${username}`);
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            setReferralCode(profileData.referral_code);
          }
        } catch (profileError) {
          console.error("Error fetching player profile:", profileError);
        }
      } catch (error) {
        console.error("Error saving score:", error);
        setError(error instanceof Error ? error.message : "Failed to save score");
      } finally {
        setLoading(false);
      }
    };

    saveScore();
  }, [score, username]);

  useEffect(() => {
    if (result?.is_personal_best) {
      createConfetti();
    }
  }, [result]);

  const createConfetti = () => {
    const confettiCount = 200;
    const colors = ['#7B5BE6', '#00C2CB', '#FF7D54', '#4CD964', '#FFCF54', '#FF5757'];

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement("div");
      confetti.className = "confetti";
      confetti.style.left = `${Math.random() * 100}vw`;
      confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.width = `${Math.random() * 10 + 5}px`;
      confetti.style.height = `${Math.random() * 10 + 5}px`;
      confetti.style.position = "fixed";
      confetti.style.top = "0";
      confetti.style.zIndex = "1000";

      document.body.appendChild(confetti);

      setTimeout(() => {
        confetti.remove();
      }, 5000);
    }
  };

  return (
    <div className="flex justify-center items-center p-4">
      <Card className="w-full border-0 shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="text-center bg-gradient-to-r from-[#7B5BE6] to-[#9168F2] pb-6 pt-8">
          <div className="text-5xl mb-2">🏁</div>
          <CardTitle className="text-3xl text-white font-bold">Game Over!</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 p-8">
          <div className="text-center">
            <p className="text-[#8A8FB9] mb-2">Final Score</p>
            <p className="text-6xl font-bold text-[#4CD964]">{score.correct}</p>
          </div>

          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4 mx-auto" />
            </div>
          ) : error ? (
            <Alert variant="destructive" className="bg-[#FFF1F1] border-[#FF5757] text-[#D93636]">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
              <Button className="mt-4 bg-white text-[#FF5757] border border-[#FF5757] hover:bg-[#FFF1F1]" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </Alert>
          ) : result ? (
            <div className="text-center space-y-4 bg-[#F5F6FF] p-6 rounded-xl">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FFCF54] text-white mb-2">
                <Trophy className="h-8 w-8" />
              </div>
              <p className="text-[#8A8FB9]">Your Best Score:</p>
              <p className="text-3xl font-bold text-[#7B5BE6]">{result.best_score}</p>
              {result.is_personal_best && (
                <p className="text-[#4CD964] font-bold text-lg mt-2 bg-[#EEFFF1] py-2 px-4 rounded-full inline-block">
                  🎉 New High Score! 🎉
                </p>
              )}
            </div>
          ) : null}

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button 
              className="flex-1 bg-[#FF5757] hover:bg-[#E04A4A] text-white font-medium py-3 rounded-xl shadow-md flex items-center justify-center gap-2"
              onClick={onPlayAgain} 
              disabled={loading}
            >
              <RotateCcw className="h-4 w-4" /> Play Again
            </Button>

            {result && referralCode && (
              <div className="flex-1">
                <ChallengeButton
                  username={username}
                  highScore={result.best_score}
                  referralCode={referralCode}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default GameResult;
