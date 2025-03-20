import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

const feedbackSchema = z.object({
  type: z.enum(['BUG', 'FEATURE', 'IMPROVEMENT', 'OTHER']),
  content: z.string().min(10, 'Feedback minimal 10 karakter'),
})

export function FeedbackForm() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof feedbackSchema>>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      type: 'IMPROVEMENT',
      content: '',
    },
  })

  async function onSubmit(values: z.infer<typeof feedbackSchema>) {
    try {
      setIsLoading(true)
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error('Gagal mengirim feedback')
      }

      toast({
        title: 'Berhasil',
        description: 'Terima kasih atas feedback Anda',
      })

      form.reset()
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
        <CardTitle>Kirim Feedback</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jenis Feedback</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jenis feedback" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="BUG">Bug Report</SelectItem>
                      <SelectItem value="FEATURE">Permintaan Fitur</SelectItem>
                      <SelectItem value="IMPROVEMENT">Saran Perbaikan</SelectItem>
                      <SelectItem value="OTHER">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Feedback</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tulis feedback Anda di sini..."
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Mengirim...' : 'Kirim Feedback'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
} 