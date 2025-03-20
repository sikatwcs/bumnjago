import { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Transaction {
  id: number
  user: {
    name: string
    email: string
  }
  tryoutList: {
    name: string
  }
  amount: number
  status: string
  createdAt: string
  paymentMethod?: string
}

interface TransactionListProps {
  transactions: Transaction[]
  onStatusChange: (id: number, status: string) => void
}

export function TransactionList({
  transactions,
  onStatusChange,
}: TransactionListProps) {
  const [filter, setFilter] = useState('ALL')

  const filteredTransactions = transactions.filter(transaction => 
    filter === 'ALL' || transaction.status === filter
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <CardTitle>Daftar Transaksi</CardTitle>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="PAID">Dibayar</SelectItem>
            <SelectItem value="FAILED">Gagal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredTransactions.map((transaction) => (
        <Card key={transaction.id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{transaction.user.name}</p>
                <p className="text-sm text-muted-foreground">
                  {transaction.user.email}
                </p>
              </div>
              <Select
                value={transaction.status}
                onValueChange={(value) => onStatusChange(transaction.id, value)}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PAID">Dibayar</SelectItem>
                  <SelectItem value="FAILED">Gagal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Tryout</p>
                <p className="text-sm">{transaction.tryoutList.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Metode Pembayaran</p>
                <p className="text-sm">{transaction.paymentMethod || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Jumlah</p>
                <p className="text-sm">
                  Rp {transaction.amount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Tanggal</p>
                <p className="text-sm">
                  {new Date(transaction.createdAt).toLocaleDateString('id-ID')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 