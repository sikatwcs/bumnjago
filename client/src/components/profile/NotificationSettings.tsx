import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface NotificationSettings {
  emailNotifications: boolean
  newTryout: boolean
  paymentReminders: boolean
  resultAvailable: boolean
}

export function NotificationSettings() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    newTryout: true,
    paymentReminders: true,
    resultAvailable: true,
  })

  const handleChange = (key: keyof NotificationSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleSave = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/profile/notification-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        throw new Error('Gagal menyimpan pengaturan')
      }

      toast({
        title: 'Berhasil',
        description: 'Pengaturan notifikasi berhasil disimpan',
      })
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
    <Card>
      <CardHeader>
        <CardTitle>Pengaturan Notifikasi</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="emailNotifications">
              Notifikasi Email
            </Label>
            <Switch
              id="emailNotifications"
              checked={settings.emailNotifications}
              onCheckedChange={() => handleChange('emailNotifications')}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="newTryout">
              Tryout Baru Tersedia
            </Label>
            <Switch
              id="newTryout"
              checked={settings.newTryout}
              onCheckedChange={() => handleChange('newTryout')}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="paymentReminders">
              Pengingat Pembayaran
            </Label>
            <Switch
              id="paymentReminders"
              checked={settings.paymentReminders}
              onCheckedChange={() => handleChange('paymentReminders')}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="resultAvailable">
              Hasil Tryout Tersedia
            </Label>
            <Switch
              id="resultAvailable"
              checked={settings.resultAvailable}
              onCheckedChange={() => handleChange('resultAvailable')}
            />
          </div>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </Button>
      </CardContent>
    </Card>
  )
} 