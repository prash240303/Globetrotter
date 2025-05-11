"use client"
import React, { useEffect, useState } from 'react';
import ChallengeButton from './ChallengeButton';

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

// Get API base URL from environment variable or use a default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

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
        // Update the player's score using the PUT endpoint
        const response = await fetch(`${API_BASE_URL}/players/score`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            player_name: username,
            score: score.correct
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || `Failed to save score: ${response.status}`);
        }
        
        const data = await response.json();
        setResult(data);
        
        // Fetch the player's full profile to get the referral code
        try {
          const profileResponse = await fetch(`${API_BASE_URL}/players/name/${username}`);
          if (!profileResponse.ok) {
            console.warn('Could not fetch player profile');
            return;
          }
          
          const profileData = await profileResponse.json();
          setReferralCode(profileData.referral_code);
        } catch (profileError) {
          console.error('Error fetching player profile:', profileError);
          // Don't set main error state since this is secondary
        }
      } catch (error) {
        console.error('Error saving score:', error);
        setError(error instanceof Error ? error.message : 'Failed to save score');
      } finally {
        setLoading(false);
      }
    };
    
    saveScore();
  }, [score, username]);

  // Create confetti effect for new high score
  useEffect(() => {
    if (result?.is_personal_best) {
      createConfetti();
    }
  }, [result]);

  const createConfetti = () => {
    const confettiCount = 200;
    const colors = ['#9d4edd', '#7b2cbf', '#2cb199', '#00b4d8', '#e63946', '#ffbe0b'];
    
    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = `${Math.random() * 100}vw`;
      confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.width = `${Math.random() * 10 + 5}px`;
      confetti.style.height = `${Math.random() * 10 + 5}px`;
      
      document.body.appendChild(confetti);
      
      // Remove confetti after animation completes
      setTimeout(() => {
        if (document.body.contains(confetti)) {
          document.body.removeChild(confetti);
        }
      }, 5000);
    }
  };

  return (
    <div className="game-container">
      <div className="feedback-container feedback-incorrect">
        <div className="feedback-icon">🏁</div>
        <h3 className="feedback-title">Game Over!</h3>
        
        <div className="score-container" style={{ marginTop: '1rem' }}>
          <div className="score-item">
            <p className="score-label">Final Score</p>
            <p className="score-value correct">{score.correct}</p>
          </div>
        </div>
        
        {loading ? (
          <p>Saving your score...</p>
        ) : error ? (
          <div className="error-message">
            <p>Error: {error}</p>
            <button 
              className="retry-button" 
              onClick={() => window.location.reload()}
              style={{ marginTop: '0.5rem' }}
            >
              Retry
            </button>
          </div>
        ) : result ? (
          <div className="fact-container">
            <h4>Your Best Score: {result.best_score}</h4>
            {result.is_personal_best && (
              <p className="feedback-text" style={{ color: 'var(--success)', fontWeight: 'bold' }}>
                🎉 New High Score! 🎉
              </p>
            )}
          </div>
        ) : null}
        
        <button 
          className="next-button" 
          onClick={onPlayAgain} 
          style={{ marginTop: '1.5rem' }}
          disabled={loading}
        >
          Play Again
        </button>
        
        {result && referralCode && (
          <div style={{ marginTop: '1.5rem' }}>
            <ChallengeButton
              username={username}
              highScore={result.best_score}
              referralCode={referralCode}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default GameResult;