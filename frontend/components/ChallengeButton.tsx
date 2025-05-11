"use client"
import React, { useState } from 'react';

interface ChallengeButtonProps {
  username: string;
  highScore: number;
  referralCode: string;
}

const ChallengeButton: React.FC<ChallengeButtonProps> = ({ 
  username, 
  highScore,
  referralCode 
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleChallenge = () => {
    // Create a challenge URL with the player's referral code
    const challengeUrl = `${window.location.origin}?code=${referralCode}`;
    
    // Copy the URL to clipboard
    navigator.clipboard.writeText(challengeUrl)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 3000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        // Fallback for browsers that don't support clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = challengeUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 3000);
      });
  };

  return (
    <div className="challenge-container">
      <button 
        className="challenge-button"
        onClick={handleChallenge}
      >
        {isCopied ? 'Challenge Link Copied!' : 'Challenge Friends'}
      </button>
      {isCopied && (
        <p className="challenge-tooltip">
          Share this link with friends to challenge them to beat your score of {highScore}!
        </p>
      )}
    </div>
  );
};

export default ChallengeButton;