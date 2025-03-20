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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

const userSchema = z.object({
  email: z.string().email('Email tidak valid'),
  name: z.string().min(1, 'Nama harus diisi'),
  role: z.enum(['USER', 'QUESTIONER', 'ADMIN']),
  password: z.string().min(6, 'Password minimal 6 karakter').optional(),
})

interface UserFormProps {
  initialData?: any
  onSuccess: () => void
}

export function UserForm({ initialData, onSuccess }: UserFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: initialData || {
      email: '',
      name: '',
      role: 'USER',
      password: '',
    },
  })

  async function onSubmit(values: z.infer<typeof userSchema>) {
    try {
      setIsLoading(true)
      const url = initialData 
        ? `/api/users/${initialData.id}`
        : '/api/users'
      
      const method = initialData ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error('Gagal menyimpan user')
      }

      toast({
        title: 'Berhasil',
        description: initialData 
          ? 'User berhasil diperbarui'
          : 'User berhasil ditambahkan',
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="email@example.com" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama</FormLabel>
              <FormControl>
                <Input placeholder="Masukkan nama" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="QUESTIONER">Questioner</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {!initialData && (
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="Masukkan password" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Menyimpan...' : (initialData ? 'Update User' : 'Tambah User')}
        </Button>
      </form>
    </Form>
  )
} 