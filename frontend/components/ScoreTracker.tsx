import { CheckCircle, XCircle, Hash } from "lucide-react"

interface Score {
  correct: number
  incorrect: number
  total: number
}

interface ScoreTrackerProps {
  score: Score
}

const ScoreTracker = ({ score }: ScoreTrackerProps) => {
  return (
    <div className="border-0 shadow-md bg-white rounded-full overflow-hidden">
      <div className="flex justify-between items-center p-2 px-4">
        <div className="flex items-center gap-2 px-2">
          <CheckCircle className="h-6 w-6 text-[#4CD964]" />
          <p className="font-bold text-3xl text-[#4CD964]">{score.correct}</p>
        </div>
        <div className="h-6 w-px bg-[#E0E3FF]"></div>
        <div className="flex items-center gap-2 px-2">
          <XCircle className="h-6 w-6 text-[#FF5757]" />
          <p className="font-bold text-3xl text-[#FF5757]">{score.incorrect}</p>
        </div>
        <div className="h-6 w-px bg-[#E0E3FF]"></div>
        <div className="flex items-center gap-2 px-2">
          <Hash className="h-6 w-6 text-[#7B5BE6]" />
          <p className="font-bold text-3xl text-[#7B5BE6]">{score.total}</p>
        </div>
      </div>
    </div>
  )
}

export default ScoreTracker
