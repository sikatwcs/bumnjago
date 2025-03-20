import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface ResultCardProps {
  totalQuestions: number
  correctAnswers: number
  score: number
  timeTaken: string
}

export function ResultCard({
  totalQuestions,
  correctAnswers,
  score,
  timeTaken,
}: ResultCardProps) {
  const percentage = (correctAnswers / totalQuestions) * 100

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Hasil Tryout</CardTitle>
        <CardDescription>
          Berikut adalah hasil dari tryout yang telah kamu kerjakan
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Skor</span>
            <span className="font-medium">{score}</span>
          </div>
          <Progress value={score} className="h-2" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Jawaban Benar</p>
            <p className="text-2xl font-bold">
              {correctAnswers} / {totalQuestions}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Persentase Benar</p>
            <p className="text-2xl font-bold">{percentage.toFixed(1)}%</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Waktu Pengerjaan</p>
            <p className="text-2xl font-bold">{timeTaken}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 