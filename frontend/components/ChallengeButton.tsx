"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ChallengeButtonProps {
  username: string;
  highScore: number;
  referralCode: string;
}

const ChallengeButton: React.FC<ChallengeButtonProps> = ({
  username,
  highScore,
  referralCode,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleChallenge = () => {
    const challengeUrl = `${window.location.origin}?code=${referralCode}`;

    navigator.clipboard
      .writeText(challengeUrl)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 3000);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);

        const textArea = document.createElement("textarea");
        textArea.value = challengeUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);

        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 3000);
      });
  };

  return (
    <div className="flex flex-col items-center gap-2 mt-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button onClick={handleChallenge} variant="outline">
            {isCopied ? "Link Copied!" : "Challenge Friends"}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-sm text-center">
          <p>
            Share this link to challenge friends to beat your score of{" "}
            <strong>{highScore}</strong>!
          </p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default ChallengeButton;
