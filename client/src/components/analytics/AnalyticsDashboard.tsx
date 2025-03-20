import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
} from 'chart.js'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement
)

interface AnalyticsData {
  dailyRevenue: {
    date: string
    amount: number
  }[]
  subjectPerformance: {
    subject: string
    averageScore: number
    totalAttempts: number
  }[]
  userGrowth: {
    date: string
    count: number
  }[]
  tryoutCompletion: {
    tryoutName: string
    completionRate: number
    averageScore: number
  }[]
}

interface AnalyticsDashboardProps {
  data: AnalyticsData
}

export function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  const revenueData = {
    labels: data.dailyRevenue.map(item => item.date),
    datasets: [
      {
        label: 'Pendapatan Harian',
        data: data.dailyRevenue.map(item => item.amount),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  }

  const subjectData = {
    labels: data.subjectPerformance.map(item => item.subject),
    datasets: [
      {
        label: 'Rata-rata Nilai',
        data: data.subjectPerformance.map(item => item.averageScore),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      }
    ]
  }

  const userGrowthData = {
    labels: data.userGrowth.map(item => item.date),
    datasets: [
      {
        label: 'Pertumbuhan Pengguna',
        data: data.userGrowth.map(item => item.count),
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1
      }
    ]
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pendapatan Harian</CardTitle>
          </CardHeader>
          <CardContent>
            <Line 
              data={revenueData}
              options={{
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value) => `Rp ${value.toLocaleString()}`
                    }
                  }
                }
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performa per Mata Pelajaran</CardTitle>
          </CardHeader>
          <CardContent>
            <Bar 
              data={subjectData}
              options={{
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100
                  }
                }
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pertumbuhan Pengguna</CardTitle>
          </CardHeader>
          <CardContent>
            <Line 
              data={userGrowthData}
              options={{
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tingkat Penyelesaian Tryout</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.tryoutCompletion.map((tryout, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{tryout.tryoutName}</span>
                    <span>{tryout.completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${tryout.completionRate}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Rata-rata nilai: {tryout.averageScore}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 