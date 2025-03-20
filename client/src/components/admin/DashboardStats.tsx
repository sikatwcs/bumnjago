import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Users, BookOpen, CreditCard, Clock } from 'lucide-react'

interface Stats {
  totalUsers: number
  totalTryouts: number
  totalTransactions: number
  averageCompletionTime: number
  recentTransactions: {
    id: number
    user: {
      name: string
    }
    tryoutList: {
      name: string
    }
    amount: number
    status: string
    createdAt: string
  }[]
}

interface DashboardStatsProps {
  stats: Stats
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pengguna
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Pengguna terdaftar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Tryout
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTryouts}</div>
            <p className="text-xs text-muted-foreground">
              Paket tryout tersedia
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Transaksi
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions}</div>
            <p className="text-xs text-muted-foreground">
              Transaksi berhasil
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Rata-rata Waktu
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageCompletionTime} menit
            </div>
            <p className="text-xs text-muted-foreground">
              Waktu pengerjaan
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaksi Terbaru</CardTitle>
          <CardDescription>
            Daftar transaksi yang baru masuk
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium">
                    {transaction.user.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {transaction.tryoutList.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    Rp {transaction.amount.toLocaleString()}
                  </p>
                  <p className={`text-sm ${
                    transaction.status === 'PAID' 
                      ? 'text-green-600' 
                      : 'text-yellow-600'
                  }`}>
                    {transaction.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 