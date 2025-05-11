"use client";
import React, { useState, useEffect } from "react";
import Game from "../components/Game";
import ScoreTracker from "../components/ScoreTracker";
import GameResult from "../components/GameResult";
import UserProfile from "../components/Profile";
import ChallengeButton from "../components/ChallengeButton";

type Score = {
  correct: number;
  incorrect: number;
  total: number;
};

// Updated to match the backend model
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

  useEffect(() => {
    const storedUsername = localStorage.getItem("globetrotter_username");
    if (storedUsername) {
      setUsername(storedUsername);
      fetchUserProfile(storedUsername);
    }

    // Check for referral code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const referralCode = urlParams.get("code");
    if (referralCode) {
      fetchInviterProfile(referralCode);
    }
  }, []);

  const fetchUserProfile = async (playerName: string) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/players/name/${playerName}`
      );
      if (response.ok) {
        const data: UserProfileType = await response.json();
        setUserProfile(data);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const fetchInviterProfile = async (referralCode: string) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/players/code/${referralCode}`
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
    setScore({
      correct: 0,
      incorrect: 0,
      total: 0,
    });
    setGameOver(false);

    // Update the score in the backend if needed
    if (userProfile && score.correct > userProfile.best_score) {
      updateUserScore(userProfile.player_name, score.correct);
    }
  };

  const updateUserScore = async (playerName: string, newScore: number) => {
    try {
      const response = await fetch("http://localhost:8000/api/players/score", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          player_name: playerName,
          score: newScore,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update the local user profile with the new best score
        if (userProfile) {
          setUserProfile({
            ...userProfile,
            best_score: data.best_score,
          });
        }
      }
    } catch (error) {
      console.error("Error updating score:", error);
    }
  };

  if (!username) {
    return (
      <div className="app-container">
        <header className="app-header">
          <h1>🌍 GeoGuess</h1>
          <p>Unravel the Clues, Discover the World!</p>
        </header>
        <UserProfile onProfileSubmit={handleProfileSubmit} />
        {invitedBy && (
          <div className="challenge-banner">
            <h3>You've been challenged by {invitedBy.player_name}!</h3>
            <p>Their high score: {invitedBy.best_score}</p>
            <p>Can you beat it?</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🌍 GeoGuess</h1>
        <p>Unravel the Clues, Discover the World!</p>
        <p className="welcome-text">Explorer: {username}</p>
      </header>

      <ScoreTracker score={score} />

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
        <ChallengeButton
          username={username}
          highScore={userProfile.best_score}
          referralCode={userProfile.referral_code}
        />
      )}
    </div>
  );
}

export default App;
