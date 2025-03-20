import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { formatRupiah } from '@/lib/utils'

interface PaymentMethod {
  code: string
  name: string
  type: string
  icon: string
}

interface PaymentFormProps {
  tryoutId: number
  tryoutName: string
  price: number
  paymentMethods: PaymentMethod[]
  onSuccess: (paymentUrl: string) => void
}

export function PaymentForm({
  tryoutId,
  tryoutName,
  price,
  paymentMethods,
  onSuccess
}: PaymentFormProps) {
  const { toast } = useToast()
  const [selectedMethod, setSelectedMethod] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const handlePayment = async () => {
    if (!selectedMethod) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Pilih metode pembayaran terlebih dahulu',
      })
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tryoutId,
          paymentMethod: selectedMethod,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Gagal membuat pembayaran')
      }

      onSuccess(data.paymentUrl)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Pembayaran Tryout</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium">Tryout</p>
          <p className="text-lg">{tryoutName}</p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Total Pembayaran</p>
          <p className="text-2xl font-bold">{formatRupiah(price)}</p>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-medium">Pilih Metode Pembayaran</p>
          <div className="grid gap-3">
            {paymentMethods.map((method) => (
              <button
                key={method.code}
                className={`flex items-center p-3 border rounded-lg hover:border-primary ${
                  selectedMethod === method.code ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => setSelectedMethod(method.code)}
              >
                <img 
                  src={method.icon} 
                  alt={method.name}
                  className="w-8 h-8 object-contain"
                />
                <div className="ml-3 text-left">
                  <p className="font-medium">{method.name}</p>
                  <p className="text-sm text-muted-foreground">{method.type}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <Button 
          className="w-full" 
          onClick={handlePayment}
          disabled={isLoading || !selectedMethod}
        >
          {isLoading ? 'Memproses...' : 'Bayar Sekarang'}
        </Button>
      </CardContent>
    </Card>
  )
} 