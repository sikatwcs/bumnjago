import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVertical, Pencil, Trash } from 'lucide-react'

interface Question {
  id: number
  question: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: string
  explanation: string
  image?: string
  tryoutList: {
    name: string
  }
  subject: {
    name: string
  }
}

interface QuestionListProps {
  questions: Question[]
  onEdit: (question: Question) => void
  onDelete: (id: number) => void
}

export function QuestionList({
  questions,
  onEdit,
  onDelete,
}: QuestionListProps) {
  return (
    <div className="space-y-4">
      {questions.map((question) => (
        <Card key={question.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-sm font-medium">
                {question.tryoutList.name} - {question.subject.name}
              </CardTitle>
              <CardDescription>
                ID Soal: {question.id}
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(question)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => {
                    if (confirm('Yakin ingin menghapus soal ini?')) {
                      onDelete(question.id)
                    }
                  }}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Hapus
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="font-medium">{question.question}</p>
                {question.image && (
                  <img
                    src={question.image}
                    alt="Question"
                    className="mt-2 max-h-[200px] object-contain"
                  />
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className={`p-2 rounded-md border ${
                  question.correctAnswer === 'A' ? 'bg-green-50 border-green-200' : ''
                }`}>
                  A. {question.optionA}
                </div>
                <div className={`p-2 rounded-md border ${
                  question.correctAnswer === 'B' ? 'bg-green-50 border-green-200' : ''
                }`}>
                  B. {question.optionB}
                </div>
                <div className={`p-2 rounded-md border ${
                  question.correctAnswer === 'C' ? 'bg-green-50 border-green-200' : ''
                }`}>
                  C. {question.optionC}
                </div>
                <div className={`p-2 rounded-md border ${
                  question.correctAnswer === 'D' ? 'bg-green-50 border-green-200' : ''
                }`}>
                  D. {question.optionD}
                </div>
              </div>

              <div className="pt-2">
                <p className="text-sm text-muted-foreground">Penjelasan:</p>
                <p className="text-sm">{question.explanation}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 