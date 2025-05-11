"use client"
import React, { useState, useEffect } from 'react';
import AnswerFeedback from './AnswerFeedback';

const API_URL = 'http://localhost:8000/api';

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

  const fetchQuestion = async () => {
    setLoading(true);
    setSelectedAnswer(null);
    setFeedback(null);
    
    try {
      const response = await fetch(`${API_URL}/quiz/question`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data: QuizQuestion = await response.json();
      setGameData(data);
    } catch (error) {
      console.error('Error fetching question:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestion();
  }, []);

  const handleOptionSelect = async (optionId: number) => {
    if (selectedAnswer !== null) return; // Prevent multiple selections
    
    setSelectedAnswer(optionId);
    
    try {
      // Verify the answer with the backend
      const response = await fetch(`${API_URL}/quiz/verify/${gameData?.id}/${optionId}`);
      const result = await response.json();
      const isCorrect = result.is_correct;
      
      // Call the onAnswer callback to update the score
      onAnswer(isCorrect);
      
      // Set feedback data
      if (gameData) {
        setFeedback({
          isCorrect,
          interestingFact: gameData.interesting_fact || '',
          knowledgeBit: gameData.knowledge_bit || ''
        });
      }
      
      // If answer is correct, you could add confetti effect
      if (isCorrect) {
        createConfetti();
      }
    } catch (error) {
      console.error('Error verifying answer:', error);
    }
  };

  const createConfetti = () => {
    const confettiCount = 100;
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

  const handleNextQuestion = () => {
    // Only allow proceeding to next destination if answer was correct
    if (feedback && feedback.isCorrect) {
      fetchQuestion();
    }
  };

  if (loading) {
    return (
      <div className="game-container">
        <p className="loading">Loading destination...</p>
      </div>
    );
  }

  return (
    <div className="game-container">
      <div className="clue-container">
        <h3>Where am I?</h3>
        {gameData?.hints.map((hint, index) => (
          <p key={index} className="clue-item">{hint}</p>
        ))}
      </div>
      
      <div className="options-container">
        {gameData?.options.map((option) => (
          <button
            key={option.id}
            className="option-button"
            onClick={() => handleOptionSelect(option.id)}
            disabled={selectedAnswer !== null}
          >
            {option.location_name}
            <span className="country">{option.nation}</span>
          </button>
        ))}
      </div>
      
      {feedback && (
        <AnswerFeedback 
          isCorrect={feedback.isCorrect}
          funFact={feedback.interestingFact}
          trivia={feedback.knowledgeBit}
        />
      )}
      
      {selectedAnswer !== null && feedback && feedback.isCorrect && (
        <button className="next-button" onClick={handleNextQuestion}>
          Next Destination
        </button>
      )}
    </div>
  );
}

export default Game;