import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Score {
  correct: number;
  incorrect: number;
  total: number;
}

interface ScoreTrackerProps {
  score: Score;
}

const ScoreTracker = ({ score }: ScoreTrackerProps) => {
  return (
    <Card className="w-full max-w-sm shadow-md">
      <CardHeader>
        <CardTitle className="text-center">Your Score</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-between text-center">
        <div className="flex-1">
          <p className="text-muted-foreground text-sm">Correct</p>
          <p className="text-green-600 font-bold text-lg">{score.correct}</p>
        </div>
        <div className="flex-1">
          <p className="text-muted-foreground text-sm">Incorrect</p>
          <p className="text-red-600 font-bold text-lg">{score.incorrect}</p>
        </div>
        <div className="flex-1">
          <p className="text-muted-foreground text-sm">Total</p>
          <p className="text-blue-600 font-bold text-lg">{score.total}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScoreTracker;
