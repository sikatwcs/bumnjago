import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface ReportData {
  tryoutResults: {
    id: number
    user: {
      name: string
      email: string
    }
    tryoutList: {
      name: string
    }
    score: number
    completedAt: string
    timeSpent: number
    correctAnswers: number
    totalQuestions: number
  }[]
}

interface DetailedReportProps {
  data: ReportData
  onExport: () => void
  onFilterChange: (filter: string) => void
}

export function DetailedReport({
  data,
  onExport,
  onFilterChange
}: DetailedReportProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Select onValueChange={onFilterChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter Tryout" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Tryout</SelectItem>
            <SelectItem value="this-week">Minggu Ini</SelectItem>
            <SelectItem value="this-month">Bulan Ini</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={onExport}>
          <Download className="mr-2 h-4 w-4" />
          Export Excel
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Tryout</TableHead>
              <TableHead className="text-right">Nilai</TableHead>
              <TableHead className="text-right">Jawaban Benar</TableHead>
              <TableHead className="text-right">Waktu</TableHead>
              <TableHead>Tanggal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.tryoutResults.map((result) => (
              <TableRow key={result.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{result.user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {result.user.email}
                    </p>
                  </div>
                </TableCell>
                <TableCell>{result.tryoutList.name}</TableCell>
                <TableCell className="text-right">{result.score}</TableCell>
                <TableCell className="text-right">
                  {result.correctAnswers}/{result.totalQuestions}
                </TableCell>
                <TableCell className="text-right">
                  {Math.floor(result.timeSpent / 60)} menit
                </TableCell>
                <TableCell>
                  {new Date(result.completedAt).toLocaleDateString('id-ID')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 