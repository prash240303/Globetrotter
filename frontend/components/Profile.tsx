"use client"
import React, { useState, useEffect } from 'react';

interface UserProfileProps {
  onProfileSubmit: (profile: UserProfileData) => void;
  existingUsername?: string;
}

interface UserProfileData {
  id: number;
  player_name: string;
  referral_code: string;
  best_score: number;
}

const UserProfile = ({ onProfileSubmit, existingUsername }: UserProfileProps) => {
  const [username, setUsername] = useState<string>(existingUsername || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  useEffect(() => {
    // Check for stored username on component mount
    const storedUsername = localStorage.getItem('globetrotter_username');
    if (storedUsername && !existingUsername) {
      setUsername(storedUsername);
      fetchExistingPlayer(storedUsername);
    }
  }, []);

  const fetchExistingPlayer = async (playerName: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/players/name/${playerName}`);
      if (response.ok) {
        const data = await response.json();
        onProfileSubmit(data);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error fetching player:", error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // First check if user exists
      const existingPlayer = await fetchExistingPlayer(username);
      
      if (!existingPlayer) {
        // If player doesn't exist, create a new one
        const response = await fetch('http://localhost:8000/api/players', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ player_name: username }),
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.detail || 'Something went wrong');
        }
        
        const data = await response.json();
        onProfileSubmit(data);
        localStorage.setItem('globetrotter_username', username);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="game-container">
      <h2>Enter Your Explorer Name</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your name"
            className="option-button"
            style={{ width: '100%', textAlign: 'center' }}
            disabled={isSubmitting}
          />
        </div>
        
        {error && <p style={{ color: 'var(--error)', marginBottom: '1rem' }}>{error}</p>}
        
        <button
          type="submit"
          className="next-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Start Exploring'}
        </button>
      </form>
    </div>
  );
}

export default UserProfile;