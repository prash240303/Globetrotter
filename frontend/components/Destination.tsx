import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface DestinationCardProps {
  destination: {
    city: string;
    country: string;
    clues: string[];
    fun_fact: string[];
  };
}

const DestinationCard = ({ destination }: DestinationCardProps) => {
  return (
    <Card className="w-full max-w-md mx-auto mb-6 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl">
          {destination.city}, {destination.country}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <h4 className="text-lg font-semibold">Clues:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            {destination.clues.map((clue, index) => (
              <li key={index}>{clue}</li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold">Fun Facts:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            {destination.fun_fact.map((fact, index) => (
              <li key={index}>{fact}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default DestinationCard;
