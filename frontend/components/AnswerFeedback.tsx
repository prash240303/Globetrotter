import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BadgeCheck, XCircle } from "lucide-react";

interface AnswerFeedbackProps {
  isCorrect: boolean;
  funFact: string;
  trivia: string;
}

function AnswerFeedback({ isCorrect, funFact, trivia }: AnswerFeedbackProps) {
  return (
    <Alert variant={isCorrect ? "default" : "destructive"} className="my-4 px-4 py-3 rounded-lg">
      <div className="flex items-center gap-3">
        {isCorrect ? (
          <BadgeCheck className="text-green-600 w-6 h-6" />
        ) : (
          <XCircle className="text-red-600 w-6 h-6" />
        )}
        <AlertTitle className="text-xl font-semibold">
          {isCorrect ? "Correct!" : "Not quite right!"}
        </AlertTitle>
      </div>
      <AlertDescription className="mt-3 text-base">
        <p className="text-lg">
          {isCorrect
            ? "Great job! You've got a knack for geography!"
            : "Don't worry, even seasoned travelers get lost sometimes!"}
        </p>
        <div className="mt-4">
          <h4 className="font-semibold text-2xl">
            {isCorrect ? "Fun Fact" : "Did you know?"}
          </h4>
          <p className="text-lg">{isCorrect ? funFact : trivia}</p>
        </div>
      </AlertDescription>
    </Alert>
  );
}

export default AnswerFeedback;
