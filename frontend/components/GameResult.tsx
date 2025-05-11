"use client";
import React, { useEffect, useState } from "react";
import ChallengeButton from "./ChallengeButton";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, RotateCcw } from "lucide-react";

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
          throw new Error(
            errorData?.message || `Failed to save score: ${response.status}`
          );
        }

        const data = await response.json();
        setResult(data);

        try {
          const profileResponse = await fetch(
            `${API_BASE_URL}/api/players/name/${username}`
          );
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            setReferralCode(profileData.referral_code);
          }
        } catch (profileError) {
          console.error("Error fetching player profile:", profileError);
        }
      } catch (error) {
        console.error("Error saving score:", error);
        setError(
          error instanceof Error ? error.message : "Failed to save score"
        );
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
    const colors = [
      "#6AB999",
      "#00C2CB",
      "#FF7D54",
      "#4CD964",
      "#FFCF54",
      "#FF5757",
    ];

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement("div");
      confetti.className = "confetti";
      confetti.style.left = `${Math.random() * 100}vw`;
      confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
      confetti.style.backgroundColor =
        colors[Math.floor(Math.random() * colors.length)];
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
    <div className="flex justify-center items-center p-4 md:p-8">
      <div className="w-full max-w-4xl bg-white border-0 shadow-md rounded-xl overflow-hidden">
        <div className="text-center flex justify-center items-center gap-2 bg-gradient-to-r from-[#6AB999] to-[#256668] pb-3 pt-4">
          <div className="text-5xl mb-2">🏁</div>
          <h1 className="text-3xl md:text-4xl text-white font-bold">
            Game Over!
          </h1>
        </div>

        <div className="space-y-6 p-8">
          <div className="text-center">
            <p className="text-[#8A8FB9] text-xl">Final Score</p>
            <p className="text-6xl font-bold text-[#4CD964]">{score.correct}</p>
          </div>

          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-3/4 mx-auto" />
            </div>
          ) : error ? (
            <Alert
              variant="destructive"
              className="bg-[#FFF1F1] border-[#FF5757] text-[#D93636]"
            >
              <AlertTitle className="text-xl">Error</AlertTitle>
              <AlertDescription className="text-lg">{error}</AlertDescription>
              <Button
                className="mt-4 bg-white text-[#FF5757] border border-[#FF5757] hover:bg-[#FFF1F1]"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </Alert>
          ) : result ? (
            <div className="text-center space-y-4 bg-[#F5F6FF] p-6 rounded-xl">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FFCF54] text-white mb-3">
                <Trophy className="h-8 w-8" />
              </div>
              <p className="text-[#8A8FB9] text-xl">Your Best Score:</p>
              <p className="text-3xl font-bold text-[#6AB999]">
                {result.best_score}
              </p>
              {result.is_personal_best && (
                <p className="text-[#2F6C4E] font-bold text-lg mt-3 bg-[#C9F4D3] py-2 px-4 rounded-full inline-block">
                  🎉 New High Score! 🎉
                </p>
              )}
            </div>
          ) : null}

          <div className="flex w-full items-center justify-center gap-4">
            <Button
              className=" bg-[#FF5757] w-48 text-xl hover:bg-[#E04A4A] text-white font-semibold py-6 rounded-lg shadow-md flex items-center justify-center gap-3 transition-all duration-300 ease-in-out"
              onClick={onPlayAgain}
              disabled={loading}
            >
              <RotateCcw className="h-5 w-5" /> Play Again
            </Button>

            {result && referralCode && (
              <div className="">
                <ChallengeButton
                  username={username}
                  highScore={result.best_score}
                  referralCode={referralCode}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameResult;
