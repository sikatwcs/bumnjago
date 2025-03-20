import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Radar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js'

// Register ChartJS components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
)

interface UserAnalyticsData {
  userId: number
  userName: string
  overallScore: number
  subjectScores: {
    subject: string
    score: number
  }[]
  recentTryouts: {
    name: string
    score: number
    date: string
  }[]
  weakestTopics: {
    topic: string
    correctRate: number
  }[]
}

interface UserAnalyticsProps {
  data: UserAnalyticsData
}

export function UserAnalytics({ data }: UserAnalyticsProps) {
  const radarData = {
    labels: data.subjectScores.map(item => item.subject),
    datasets: [
      {
        label: 'Nilai per Mata Pelajaran',
        data: data.subjectScores.map(item => item.score),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }
    ]
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Analisis Peserta: {data.userName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <div>
              <p className="text-sm font-medium">Nilai Keseluruhan</p>
              <div className="flex items-center space-x-4">
                <Progress value={data.overallScore} className="flex-1" />
                <span className="text-2xl font-bold">
                  {data.overallScore}
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-4">
                Performa per Mata Pelajaran
              </p>
              <div className="h-[300px]">
                <Radar 
                  data={radarData}
                  options={{
                    scales: {
                      r: {
                        beginAtZero: true,
                        max: 100
                      }
                    }
                  }}
                />
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-4">Tryout Terakhir</p>
              <div className="space-y-4">
                {data.recentTryouts.map((tryout, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{tryout.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(tryout.date).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <span className="text-lg font-bold">
                      {tryout.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-4">Topik yang Perlu Diperbaiki</p>
              <div className="space-y-4">
                {data.weakestTopics.map((topic, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between">
                      <span>{topic.topic}</span>
                      <span>{topic.correctRate}%</span>
                    </div>
                    <Progress value={topic.correctRate} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 