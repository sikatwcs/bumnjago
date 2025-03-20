import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

const tryoutSchema = z.object({
  name: z.string().min(1, 'Nama tryout harus diisi'),
  description: z.string().min(1, 'Deskripsi harus diisi'),
  price: z.string().transform(Number),
  duration: z.string().transform(Number),
})

interface TryoutFormProps {
  initialData?: any
  onSuccess: () => void
}

export function TryoutForm({ initialData, onSuccess }: TryoutFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof tryoutSchema>>({
    resolver: zodResolver(tryoutSchema),
    defaultValues: initialData || {
      name: '',
      description: '',
      price: '',
      duration: '',
    },
  })

  async function onSubmit(values: z.infer<typeof tryoutSchema>) {
    try {
      setIsLoading(true)
      const url = initialData 
        ? `/api/tryout-lists/${initialData.id}`
        : '/api/tryout-lists'
      
      const method = initialData ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error('Gagal menyimpan tryout')
      }

      toast({
        title: 'Berhasil',
        description: initialData 
          ? 'Tryout berhasil diperbarui'
          : 'Tryout berhasil ditambahkan',
      })

      onSuccess()
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Tryout</FormLabel>
              <FormControl>
                <Input placeholder="Masukkan nama tryout" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Masukkan deskripsi tryout"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Harga (Rp)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Masukkan harga"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Durasi (menit)</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    placeholder="Masukkan durasi"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Menyimpan...' : (initialData ? 'Update Tryout' : 'Tambah Tryout')}
        </Button>
      </form>
    </Form>
  )
} 