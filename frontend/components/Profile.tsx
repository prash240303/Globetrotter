"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

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

const UserProfile = ({
  onProfileSubmit,
  existingUsername,
}: UserProfileProps) => {
  const [username, setUsername] = useState<string>(existingUsername || "");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const storedUsername = localStorage.getItem("globetrotter_username");
    if (storedUsername && !existingUsername) {
      setUsername(storedUsername);
      fetchExistingPlayer(storedUsername);
    }
  }, []);

  const fetchExistingPlayer = async (playerName: string) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/players/name/${playerName}`
      );
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
      setError("Please enter a username");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const existingPlayer = await fetchExistingPlayer(username);

      if (!existingPlayer) {
        const response = await fetch("http://localhost:8000/api/players", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ player_name: username }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.detail || "Something went wrong");
        }

        const data = await response.json();
        onProfileSubmit(data);
        localStorage.setItem("globetrotter_username", username);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-10 shadow-lg">
      <CardHeader>
        <CardTitle className="text-center text-xl">Enter Your Explorer Name</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username">Name</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your name"
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <p className="text-destructive text-sm font-medium">{error}</p>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Submitting..." : "Start Exploring"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserProfile;
