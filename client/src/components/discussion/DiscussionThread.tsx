import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'
import { ThumbsUp, MessageCircle, Flag } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Comment {
  id: number
  content: string
  user: {
    id: number
    name: string
    avatar?: string
  }
  likes: number
  isLiked: boolean
  createdAt: string
  replies: Comment[]
}

interface DiscussionThreadProps {
  questionId: number
  comments: Comment[]
}

export function DiscussionThread({ questionId, comments }: DiscussionThreadProps) {
  const { toast } = useToast()
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [expandedComments, setExpandedComments] = useState<number[]>([])

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/questions/${questionId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment }),
      })

      if (!response.ok) {
        throw new Error('Gagal mengirim komentar')
      }

      setNewComment('')
      toast({
        title: 'Berhasil',
        description: 'Komentar berhasil ditambahkan',
      })
      
      // Refresh comments would be handled by parent component
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLike = async (commentId: number) => {
    try {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Gagal menyukai komentar')
      }
      
      // Refresh comments would be handled by parent component
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
      })
    }
  }

  const handleReport = async (commentId: number) => {
    try {
      const response = await fetch(`/api/comments/${commentId}/report`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Gagal melaporkan komentar')
      }

      toast({
        title: 'Berhasil',
        description: 'Komentar telah dilaporkan',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
      })
    }
  }

  const toggleReplies = (commentId: number) => {
    setExpandedComments(prev => 
      prev.includes(commentId)
        ? prev.filter(id => id !== commentId)
        : [...prev, commentId]
    )
  }

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-12' : ''} mb-4`}>
      <div className="flex items-start space-x-4">
        <Avatar>
          <AvatarImage src={comment.user.avatar} />
          <AvatarFallback>
            {comment.user.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="bg-accent p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{comment.user.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.createdAt), {
                    addSuffix: true,
                    locale: id
                  })}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReport(comment.id)}
              >
                <Flag className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-2">{comment.content}</p>
          </div>
          <div className="flex items-center space-x-4 mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleLike(comment.id)}
              className={comment.isLiked ? 'text-primary' : ''}
            >
              <ThumbsUp className="h-4 w-4 mr-1" />
              {comment.likes}
            </Button>
            {!isReply && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleReplies(comment.id)}
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                {comment.replies.length} Balasan
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {!isReply && expandedComments.includes(comment.id) && (
        <div className="mt-4">
          {comment.replies.map(reply => renderComment(reply, true))}
        </div>
      )}
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Diskusi</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <Textarea
              placeholder="Tulis komentar..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <Button
              onClick={handleSubmitComment}
              disabled={isSubmitting || !newComment.trim()}
            >
              {isSubmitting ? 'Mengirim...' : 'Kirim Komentar'}
            </Button>
          </div>

          <div className="space-y-4">
            {comments.map(comment => renderComment(comment))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 