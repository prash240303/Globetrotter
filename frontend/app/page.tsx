import React, { useState, useEffect } from 'react';
import Game from '../components/Game';
import ScoreTracker from '../components/ScoreTracker';
import GameResult from '../components/GameResult';
import ChallengeButton from '../components/ChallengeButton';
import './index.css';

interface Score {
  correct: number;
  incorrect: number;
  total: number;
}

interface UserProfileData {
  username: string;
  high_score: number;
}

interface AppProps {}

const App: React.FC<AppProps> = () => {
  const [score, setScore] = useState<Score>({
    correct: 0,
    incorrect: 0,
    total: 0
  });
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [invitedBy, setInvitedBy] = useState<UserProfileData | null>(null);

  useEffect(() => {
    // Check for stored username
    const storedUsername = localStorage.getItem('globetrotter_username');
    if (storedUsername) {
      setUsername(storedUsername);
      fetchUserProfile(storedUsername);
    }

    // Check for invitation parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const inviteParam = urlParams.get('invite');
    if (inviteParam) {
      fetchInviterProfile(inviteParam);
    }
  }, []);

  const fetchUserProfile = async (username: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/user-profile/${username}`);
      if (response.ok) {
        const data: UserProfileData = await response.json();
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchInviterProfile = async (inviteUsername: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/user-profile/${inviteUsername}`);
      if (response.ok) {
        const data: UserProfileData = await response.json();
        setInvitedBy(data);
      }
    } catch (error) {
      console.error('Error fetching inviter profile:', error);
    }
  };

  const handleAnswer = (isCorrect: boolean) => {
    setScore((prevScore) => ({
      correct: isCorrect ? prevScore.correct + 1 : prevScore.correct,
      incorrect: isCorrect ? prevScore.incorrect : prevScore.incorrect + 1,
      total: prevScore.total + 1
    }));

    // If answer is incorrect, end the game
    if (!isCorrect) {
      setGameOver(true);
    }
  };

  const handleProfileSubmit = (profile: UserProfileData) => {
    setUsername(profile.username);
    setUserProfile(profile);
  };

  const handlePlayAgain = () => {
    setScore({
      correct: 0,
      incorrect: 0,
      total: 0
    });
    setGameOver(false);
  };

  // Show user profile form if no username is set
  if (!username) {
    return (
      <div className="app-container">
        <header className="app-header">
          <h1>🌍 Globetrotter</h1>
          <p>Unravel the Clues, Discover the World!</p>
        </header>

        {invitedBy && (
          <div className="challenge-banner">
            <h3>You've been challenged by {invitedBy.username}!</h3>
            <p>Their high score: {invitedBy.high_score}</p>
            <p>Can you beat it?</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🌍 Globetrotter</h1>
        <p>Unravel the Clues, Discover the World!</p>
        {username && <p className="welcome-text">Explorer: {username}</p>}
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
          highScore={userProfile.high_score}
        />
      )}
    </div>
  );
};

export default App;
