import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import api from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import { KeyRound, Eye, EyeOff } from 'lucide-react'

const passwordSchema = z.object({
  currentPassword: z.string().min(6, {
    message: 'Password saat ini wajib diisi (min. 6 karakter)',
  }),
  newPassword: z.string().min(6, {
    message: 'Password baru minimal 6 karakter',
  }),
  confirmPassword: z.string().min(6, {
    message: 'Konfirmasi password minimal 6 karakter',
  }),
}).refine((data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) => data.newPassword === data.confirmPassword, {
  message: 'Password baru dan konfirmasi password tidak cocok',
  path: ['confirmPassword'],
})

type PasswordFormValues = z.infer<typeof passwordSchema>

export function ChangePasswordForm() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(values: PasswordFormValues) {
    try {
      setIsLoading(true)
      
      const response = await api.post('/auth/change-password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })

      toast('Password berhasil diubah', {
        position: 'top-center',
      })

      form.reset()
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Terjadi kesalahan'
      toast.error('Gagal mengubah password', { 
        description: errorMessage,
        position: 'top-center',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ubah Password</CardTitle>
        <CardDescription>
          Ubah password akun untuk meningkatkan keamanan akun Anda
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password Saat Ini</FormLabel>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <FormControl>
                      <Input 
                        type={showCurrentPassword ? "text" : "password"} 
                        className="pl-10 pr-10"
                        {...field} 
                      />
                    </FormControl>
                    <button 
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password Baru</FormLabel>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <FormControl>
                      <Input 
                        type={showNewPassword ? "text" : "password"} 
                        className="pl-10 pr-10"
                        {...field} 
                      />
                    </FormControl>
                    <button 
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Konfirmasi Password Baru</FormLabel>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <FormControl>
                      <Input 
                        type={showConfirmPassword ? "text" : "password"} 
                        className="pl-10 pr-10"
                        {...field} 
                      />
                    </FormControl>
                    <button 
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4">
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Menyimpan...' : 'Ubah Password'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
} 