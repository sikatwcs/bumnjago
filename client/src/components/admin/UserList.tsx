import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVertical, Pencil, Trash, Key } from 'lucide-react'

interface User {
  id: number
  email: string
  name: string
  role: string
  profile?: {
    avatar?: string
  }
  _count: {
    transactions: number
  }
}

interface UserListProps {
  users: User[]
  onEdit: (user: User) => void
  onDelete: (id: number) => void
  onResetPassword: (id: number) => void
}

export function UserList({
  users,
  onEdit,
  onDelete,
  onResetPassword,
}: UserListProps) {
  return (
    <div className="space-y-4">
      {users.map((user) => (
        <div
          key={user.id}
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
        >
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarFallback>
                {user.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`text-xs px-2 py-1 rounded ${
                  user.role === 'ADMIN' 
                    ? 'bg-blue-100 text-blue-700'
                    : user.role === 'QUESTIONER'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {user.role}
                </span>
                <span className="text-xs text-muted-foreground">
                  {user._count.transactions} transaksi
                </span>
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(user)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onResetPassword(user.id)}>
                <Key className="mr-2 h-4 w-4" />
                Reset Password
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => {
                  if (confirm('Yakin ingin menghapus user ini?')) {
                    onDelete(user.id)
                  }
                }}
              >
                <Trash className="mr-2 h-4 w-4" />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </div>
  )
} 