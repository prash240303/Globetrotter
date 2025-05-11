"use client";
import React, { useEffect, useState } from "react";
import ChallengeButton from "./ChallengeButton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

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
    const colors = ["#9d4edd", "#7b2cbf", "#2cb199", "#00b4d8", "#e63946", "#ffbe0b"];

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
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="text-4xl">🏁</div>
          <CardTitle className="text-2xl">Game Over!</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-muted-foreground">Final Score</p>
            <p className="text-5xl font-bold text-green-600">{score.correct}</p>
          </div>

          {loading ? (
            <Skeleton className="h-6 w-full" />
          ) : error ? (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
              <Button className="mt-2" variant="outline" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </Alert>
          ) : result ? (
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">Your Best Score:</p>
              <p className="text-2xl font-semibold">{result.best_score}</p>
              {result.is_personal_best && (
                <p className="text-green-700 font-bold text-lg">🎉 New High Score! 🎉</p>
              )}
            </div>
          ) : null}

          <Button className="w-full" onClick={onPlayAgain} disabled={loading}>
            Play Again
          </Button>

          {result && referralCode && (
            <div className="mt-4">
              <ChallengeButton
                username={username}
                highScore={result.best_score}
                referralCode={referralCode}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default GameResult;
