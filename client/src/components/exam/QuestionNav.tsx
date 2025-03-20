import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface QuestionNavProps {
  totalQuestions: number
  currentQuestion: number
  answeredQuestions: Set<number>
  onQuestionClick: (number: number) => void
}

export function QuestionNav({
  totalQuestions,
  currentQuestion,
  answeredQuestions,
  onQuestionClick,
}: QuestionNavProps) {
  return (
    <div className="grid grid-cols-5 gap-2 p-4 bg-white rounded-lg shadow">
      {Array.from({ length: totalQuestions }, (_, i) => i + 1).map((number) => (
        <Button
          key={number}
          variant="outline"
          className={cn(
            'h-10 w-10',
            currentQuestion === number && 'border-primary',
            answeredQuestions.has(number) && 'bg-primary text-primary-foreground'
          )}
          onClick={() => onQuestionClick(number)}
        >
          {number}
        </Button>
      ))}
    </div>
  )
} 