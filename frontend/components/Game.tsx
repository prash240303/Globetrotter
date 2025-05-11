"use client";
import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LightbulbIcon, Eye } from "lucide-react";
import AnswerFeedback from "./AnswerFeedback";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

interface LocationOption {
  id: number;
  location_name: string;
  nation: string;
}

interface QuizQuestion {
  id: number;
  hints: string[];
  options: LocationOption[];
  correct_id: number;
  interesting_fact: string;
  knowledge_bit: string;
}

interface Feedback {
  isCorrect: boolean;
  interestingFact: string;
  knowledgeBit: string;
}

interface GameProps {
  onAnswer: (isCorrect: boolean) => void;
}

const Game: React.FC<GameProps> = ({ onAnswer }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [gameData, setGameData] = useState<QuizQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [showSecondClue, setShowSecondClue] = useState<boolean>(false);

  const fetchQuestion = async () => {
    setLoading(true);
    setSelectedAnswer(null);
    setFeedback(null);
    setShowSecondClue(false);

    try {
      const response = await fetch(`${API_URL}/quiz/question`);
      if (!response.ok) throw new Error("Failed to fetch");
      const data: QuizQuestion = await response.json();
      setGameData(data);
    } catch (error) {
      console.error("Error fetching question:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestion();
  }, []);

  const handleOptionSelect = async (optionId: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(optionId);

    try {
      const response = await fetch(
        `${API_URL}/quiz/verify/${gameData?.id}/${optionId}`
      );
      const result = await response.json();
      const isCorrect = result.is_correct;
      onAnswer(isCorrect);

      if (gameData) {
        setFeedback({
          isCorrect,
          interestingFact: gameData.interesting_fact || "",
          knowledgeBit: gameData.knowledge_bit || "",
        });
      }

      if (isCorrect) createConfetti();  // Trigger confetti for correct answers
    } catch (error) {
      console.error("Error verifying answer:", error);
    }
  };

  const createConfetti = () => {
    const confettiCount = 100;
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
      confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
      confetti.style.animation =
        "fall ${Math.random() * 3 + 2}s linear forwards";

      document.body.appendChild(confetti);
      setTimeout(() => {
        if (document.body.contains(confetti))
          document.body.removeChild(confetti);
      }, 5000);
    }
  };

  const handleNextQuestion = () => {
    if (feedback?.isCorrect) fetchQuestion();
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-[#E0E3FF]"></div>
          <div className="h-4 w-32 bg-[#E0E3FF] mt-4 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="bg-gradient-to-r from-[#6AB999] to-[#23676A] py-4 px-6 rounded-lg">
        <div className="flex items-center gap-2 text-white">
          <LightbulbIcon className="h-5 w-5" />{" "}
          <span className="text-2xl font-semibold">
            Clue {showSecondClue ? "2" : "1"}
          </span>
        </div>
      </div>

      <div className="bg-[#FFFBEB] border-l-4 border-[#FFCF54] p-6 rounded-lg mt-4">
        {gameData?.hints && gameData.hints.length > 0 && (
          <p className="text-[#6B5F2E] font-medium text-2xl">
            {
              gameData.hints[
                showSecondClue && gameData.hints.length > 1 ? 1 : 0
              ]
            }
          </p>
        )}
      </div>

      {gameData?.hints && gameData.hints.length > 1 && (
        <Button
          variant="ghost"
          onClick={() => setShowSecondClue((prev) => !prev)}
          className={`mx-auto flex cursor-pointer items-center gap-2 text-[#6AB999] hover:bg-[#F5F6FF] transition-all duration-200 px-4 py-2 rounded-lg ${
            showSecondClue
              ? "bg-[#F5F6FF] border-[#6AB999] text-[#6AB999]"
              : "border-2"
          }`}
        >
          <Eye className="h-4 w-4" />
          {showSecondClue ? "Hide Clue" : "Show Second Clue"}
        </Button>
      )}

      <div className="grid grid-cols-2 gap-8 mt-6">
        {gameData?.options.map((option, index) => (
          <Button
            key={option.id}
            variant="outline"
            className={`flex cursor-pointer relative flex-col items-center justify-center px-6 py-4 h-fit rounded-xl border-2 ${
              selectedAnswer === option.id
                ? selectedAnswer === gameData.correct_id
                  ? "border-[#4CD964] bg-[#EEFFF1] animate-pulse"
                  : "border-[#FF5757] bg-[#FFF1F1] animate-shake"
                : "border-[#E0E3FF] hover:border-[#6AB999] hover:bg-[#F5F6FF]"
            } transition-all`}
            onClick={() => handleOptionSelect(option.id)}
            disabled={selectedAnswer !== null}
          >
            <span className="absolute border border-neutral-400 py-4  -top-6 left-1/2 transform -translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-[#F5F6FF] text-[#6AB999] font-bold mb-2">
              {index + 1}
            </span>
            <div className="flex flex-col gap-2">
              <span className="font-medium text-lg text-[#333]">
                {option.location_name}
              </span>
              <span className="text-sm text-[#8A8FB9] mt-1">
                {option.nation}
              </span>
            </div>
          </Button>
        ))}
      </div>

      {feedback && (
        <AnswerFeedback
          isCorrect={feedback.isCorrect}
          funFact={feedback.interestingFact}
          trivia={feedback.knowledgeBit}
        />
      )}

      {selectedAnswer !== null && feedback?.isCorrect && (
        <Button
          className="w-full mt-6 text-2xl cursor-pointer bg-[#6AB999] hover:bg-[#76e6b9] text-white font-medium py-6 rounded-xl shadow-md"
          onClick={handleNextQuestion}
        >
          Next Destination
        </Button>
      )}
    </div>
  );
};

export default Game;
