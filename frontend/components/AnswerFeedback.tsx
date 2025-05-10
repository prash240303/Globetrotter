interface AnswerFeedbackProps {
  isCorrect: boolean;
  funFact: string;
  trivia: string;
}
function AnswerFeedback({ isCorrect, funFact, trivia }: AnswerFeedbackProps) {
  return (
    <div
      className={`feedback-container ${
        isCorrect ? "feedback-correct" : "feedback-incorrect"
      }`}
    >
      <div className="feedback-icon">{isCorrect ? "🎉" : "😢"}</div>
      <h3 className="feedback-title">
        {isCorrect ? "Correct!" : "Not quite right!"}
      </h3>
      <p className="feedback-text">
        {isCorrect
          ? "Great job! You've got a knack for geography!"
          : "Don't worry, even seasoned travelers get lost sometimes!"}
      </p>

      <div className="fact-container">
        <h4>{isCorrect ? "Fun Fact" : "Did you know?"}</h4>
        <p>{isCorrect ? funFact : trivia}</p>
      </div>
    </div>
  );
}

export default AnswerFeedback;
