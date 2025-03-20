import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface Question {
  id: number
  question: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  image?: string
}

interface QuestionCardProps {
  question: Question
  currentNumber: number
  totalQuestions: number
  onAnswer: (answerId: string) => void
  onNext: () => void
  onPrevious: () => void
  selectedAnswer?: string
}

export function QuestionCard({
  question,
  currentNumber,
  totalQuestions,
  onAnswer,
  onNext,
  onPrevious,
  selectedAnswer,
}: QuestionCardProps) {
  const [answer, setAnswer] = useState<string>(selectedAnswer || '')

  const handleAnswerChange = (value: string) => {
    setAnswer(value)
    onAnswer(value)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Soal {currentNumber} dari {totalQuestions}</span>
          <span className="text-sm text-muted-foreground">
            {Math.round((currentNumber / totalQuestions) * 100)}% Selesai
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {question.image && (
          <div className="w-full flex justify-center">
            <img 
              src={question.image} 
              alt="Soal" 
              className="max-h-60 object-contain"
            />
          </div>
        )}
        
        <div className="text-lg font-medium">
          {question.question}
        </div>

        <RadioGroup
          value={answer}
          onValueChange={handleAnswerChange}
          className="space-y-3"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="A" id="A" />
            <Label htmlFor="A">{question.optionA}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="B" id="B" />
            <Label htmlFor="B">{question.optionB}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="C" id="C" />
            <Label htmlFor="C">{question.optionC}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="D" id="D" />
            <Label htmlFor="D">{question.optionD}</Label>
          </div>
        </RadioGroup>

        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={currentNumber === 1}
          >
            Sebelumnya
          </Button>
          <Button
            onClick={onNext}
            disabled={currentNumber === totalQuestions && !answer}
          >
            {currentNumber === totalQuestions ? 'Selesai' : 'Selanjutnya'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 