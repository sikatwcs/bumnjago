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
import { MoreVertical, Pencil, Trash, Users } from 'lucide-react'

interface Tryout {
  id: number
  name: string
  description: string
  price: number
  duration: number
  _count: {
    transactions: number
    questions: number
  }
}

interface TryoutListProps {
  tryouts: Tryout[]
  onEdit: (tryout: Tryout) => void
  onDelete: (id: number) => void
}

export function TryoutList({
  tryouts,
  onEdit,
  onDelete,
}: TryoutListProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tryouts.map((tryout) => (
        <Card key={tryout.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-lg font-bold">
                {tryout.name}
              </CardTitle>
              <CardDescription>
                ID: {tryout.id}
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
                <DropdownMenuItem onClick={() => onEdit(tryout)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => {
                    if (confirm('Yakin ingin menghapus tryout ini?')) {
                      onDelete(tryout.id)
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
              <p className="text-sm text-muted-foreground">
                {tryout.description}
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Harga</p>
                  <p className="text-2xl font-bold">
                    Rp {tryout.price.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Durasi</p>
                  <p className="text-2xl font-bold">
                    {tryout.duration} menit
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {tryout._count.transactions} peserta
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {tryout._count.questions} soal
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 