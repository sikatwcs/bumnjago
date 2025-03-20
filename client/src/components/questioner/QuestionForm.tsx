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
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

const questionSchema = z.object({
  tryoutListId: z.string(),
  subjectId: z.string(),
  question: z.string().min(1, 'Pertanyaan harus diisi'),
  optionA: z.string().min(1, 'Opsi A harus diisi'),
  optionB: z.string().min(1, 'Opsi B harus diisi'),
  optionC: z.string().min(1, 'Opsi C harus diisi'),
  optionD: z.string().min(1, 'Opsi D harus diisi'),
  correctAnswer: z.enum(['A', 'B', 'C', 'D']),
  explanation: z.string().min(1, 'Penjelasan harus diisi'),
})

interface TryoutOption {
  id: string
  name: string
}

interface SubjectOption {
  id: string
  name: string
}

interface QuestionFormProps {
  tryoutOptions: TryoutOption[]
  subjectOptions: SubjectOption[]
  onSuccess: () => void
  initialData?: any
}

export function QuestionForm({ 
  tryoutOptions, 
  subjectOptions, 
  onSuccess,
  initialData 
}: QuestionFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>(initialData?.image || '')

  const form = useForm<z.infer<typeof questionSchema>>({
    resolver: zodResolver(questionSchema),
    defaultValues: initialData || {
      tryoutListId: '',
      subjectId: '',
      question: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: undefined,
      explanation: '',
    },
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  async function onSubmit(values: z.infer<typeof questionSchema>) {
    try {
      setIsLoading(true)
      const formData = new FormData()
      
      Object.entries(values).forEach(([key, value]) => {
        formData.append(key, value)
      })

      if (imageFile) {
        formData.append('image', imageFile)
      }

      const url = initialData 
        ? `/api/questions/${initialData.id}`
        : '/api/questions'
      
      const method = initialData ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Gagal menyimpan soal')
      }

      toast({
        title: 'Berhasil',
        description: initialData 
          ? 'Soal berhasil diperbarui'
          : 'Soal berhasil ditambahkan',
      })

      onSuccess()
      form.reset()
      setImageFile(null)
      setImagePreview('')
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
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="tryoutListId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tryout</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Tryout" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {tryoutOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subjectId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mata Pelajaran</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Mata Pelajaran" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {subjectOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="question"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pertanyaan</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Tulis pertanyaan di sini"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormLabel>Gambar (opsional)</FormLabel>
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
          {imagePreview && (
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="max-h-[200px] object-contain"
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="optionA"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Opsi A</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="optionB"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Opsi B</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="optionC"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Opsi C</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="optionD"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Opsi D</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="correctAnswer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jawaban Benar</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Jawaban Benar" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                  <SelectItem value="C">C</SelectItem>
                  <SelectItem value="D">D</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="explanation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Penjelasan</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Tulis penjelasan jawaban di sini"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Menyimpan...' : (initialData ? 'Update Soal' : 'Tambah Soal')}
        </Button>
      </form>
    </Form>
  )
} 