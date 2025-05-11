import { Card, CardContent } from "@/components/ui/card"
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
    <Card className="border-0 shadow-md bg-white rounded-full overflow-hidden">
      <CardContent className="flex justify-between items-center p-2 px-4">
        <div className="flex items-center gap-2 px-2">
          <CheckCircle className="h-4 w-4 text-[#4CD964]" />
          <p className="font-bold text-[#4CD964]">{score.correct}</p>
        </div>
        <div className="h-6 w-px bg-[#E0E3FF]"></div>
        <div className="flex items-center gap-2 px-2">
          <XCircle className="h-4 w-4 text-[#FF5757]" />
          <p className="font-bold text-[#FF5757]">{score.incorrect}</p>
        </div>
        <div className="h-6 w-px bg-[#E0E3FF]"></div>
        <div className="flex items-center gap-2 px-2">
          <Hash className="h-4 w-4 text-[#7B5BE6]" />
          <p className="font-bold text-[#7B5BE6]">{score.total}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default ScoreTracker
