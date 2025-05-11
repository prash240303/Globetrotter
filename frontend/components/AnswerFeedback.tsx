import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BadgeCheck, XCircle } from "lucide-react";

interface AnswerFeedbackProps {
  isCorrect: boolean;
  funFact: string;
  trivia: string;
}

function AnswerFeedback({ isCorrect, funFact, trivia }: AnswerFeedbackProps) {
  return (
    <Alert variant={isCorrect ? "default" : "destructive"} className="my-4">
      <div className="flex items-center gap-2">
        {isCorrect ? (
          <BadgeCheck className="text-green-600" />
        ) : (
          <XCircle className="text-red-600" />
        )}
        <AlertTitle>
          {isCorrect ? "Correct!" : "Not quite right!"}
        </AlertTitle>
      </div>
      <AlertDescription className="mt-2">
        <p>
          {isCorrect
            ? "Great job! You've got a knack for geography!"
            : "Don't worry, even seasoned travelers get lost sometimes!"}
        </p>
        <div className="mt-3">
          <h4 className="font-semibold">
            {isCorrect ? "Fun Fact" : "Did you know?"}
          </h4>
          <p>{isCorrect ? funFact : trivia}</p>
        </div>
      </AlertDescription>
    </Alert>
  );
}

export default AnswerFeedback;