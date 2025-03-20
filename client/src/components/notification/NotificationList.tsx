import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Bell, CreditCard, BookOpen, AlertCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'

interface Notification {
  id: number
  type: 'PAYMENT' | 'TRYOUT' | 'SYSTEM'
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

export function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications')
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message)
        }

        setNotifications(data)
      } catch (error) {
        console.error('Error fetching notifications:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  const markAsRead = async (id: number) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to mark notification as read')
      }

      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, isRead: true } : notif
        )
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'PAYMENT':
        return <CreditCard className="h-5 w-5" />
      case 'TRYOUT':
        return <BookOpen className="h-5 w-5" />
      case 'SYSTEM':
        return <AlertCircle className="h-5 w-5" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <Card
          key={notification.id}
          className={`cursor-pointer transition-colors hover:bg-accent ${
            !notification.isRead ? 'bg-primary/5' : ''
          }`}
          onClick={() => markAsRead(notification.id)}
        >
          <CardContent className="flex items-start space-x-4 p-4">
            <div className={`${
              !notification.isRead ? 'text-primary' : 'text-muted-foreground'
            }`}>
              {getIcon(notification.type)}
            </div>
            <div className="flex-1 space-y-1">
              <p className={`font-medium ${
                !notification.isRead ? 'text-primary' : ''
              }`}>
                {notification.title}
              </p>
              <p className="text-sm text-muted-foreground">
                {notification.message}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(notification.createdAt), {
                  addSuffix: true,
                  locale: id
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}

      {notifications.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Bell className="h-8 w-8 mx-auto mb-2" />
          <p>Tidak ada notifikasi</p>
        </div>
      )}
    </div>
  )
} 