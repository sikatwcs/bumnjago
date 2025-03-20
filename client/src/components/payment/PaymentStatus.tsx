import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

interface PaymentStatusProps {
  transactionId: string
  onSuccess: () => void
}

export function PaymentStatus({ transactionId, onSuccess }: PaymentStatusProps) {
  const { toast } = useToast()
  const [status, setStatus] = useState<'PENDING' | 'PAID' | 'FAILED'>('PENDING')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/payments/status/${transactionId}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message)
        }

        setStatus(data.status)
        if (data.status === 'PAID') {
          onSuccess()
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Gagal mengecek status pembayaran',
        })
      } finally {
        setIsLoading(false)
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 5000) // Check every 5 seconds

    return () => clearInterval(interval)
  }, [transactionId, onSuccess, toast])

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Status Pembayaran</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        {isLoading ? (
          <div className="py-8">
            <Clock className="w-16 h-16 mx-auto text-muted-foreground animate-spin" />
            <p className="mt-4">Mengecek status pembayaran...</p>
          </div>
        ) : status === 'PAID' ? (
          <div className="py-8">
            <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
            <p className="mt-4 text-lg font-medium">Pembayaran Berhasil</p>
            <p className="text-muted-foreground">
              Anda dapat mengakses tryout sekarang
            </p>
            <Button className="mt-6" onClick={onSuccess}>
              Mulai Tryout
            </Button>
          </div>
        ) : status === 'FAILED' ? (
          <div className="py-8">
            <XCircle className="w-16 h-16 mx-auto text-red-500" />
            <p className="mt-4 text-lg font-medium">Pembayaran Gagal</p>
            <p className="text-muted-foreground">
              Silakan coba lagi atau pilih metode pembayaran lain
            </p>
            <Button className="mt-6" variant="outline" onClick={() => window.history.back()}>
              Kembali
            </Button>
          </div>
        ) : (
          <div className="py-8">
            <Clock className="w-16 h-16 mx-auto text-yellow-500" />
            <p className="mt-4 text-lg font-medium">Menunggu Pembayaran</p>
            <p className="text-muted-foreground">
              Silakan selesaikan pembayaran Anda
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 