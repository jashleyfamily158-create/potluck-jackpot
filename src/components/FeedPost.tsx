/**
 * Feed Post Component
 *
 * Displays a single food photo post in the feed with:
 * - User avatar and name
 * - The food photo (full width)
 * - Like button with count
 * - Caption
 * - Comments section with ability to add a comment
 * - Timestamp
 */

'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

interface Comment {
  id: string
  content: string
  created_at: string
  profiles: {
    display_name: string
  }
}

interface FeedPostProps {
  id: string
  imageUrl: string
  caption: string | null
  createdAt: string
  authorName: string
  potluckName?: string
  likeCount: number
  hasLiked: boolean
  comments: Comment[]
  onLikeToggle: (postId: string, liked: boolean) => void
}

export default function FeedPost({
  id,
  imageUrl,
  caption,
  createdAt,
  authorName,
  potluckName,
  likeCount,
  hasLiked,
  comments: initialComments,
  onLikeToggle,
}: FeedPostProps) {
  const { user } = useAuth()
  const [liked, setLiked] = useState(hasLiked)
  const [likes, setLikes] = useState(likeCount)
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [posting, setPosting] = useState(false)

  // Format timestamp like "2 hours ago"
  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    const hrs = Math.floor(mins / 60)
    const days = Math.floor(hrs / 24)
    if (days > 0) return `${days}d ago`
    if (hrs > 0) return `${hrs}h ago`
    if (mins > 0) return `${mins}m ago`
    return 'just now'
  }

  async function toggleLike() {
    if (!user) return

    const newLiked = !liked
    setLiked(newLiked)
    setLikes(prev => newLiked ? prev + 1 : prev - 1)
    onLikeToggle(id, newLiked)

    if (newLiked) {
      await supabase.from('feed_likes').insert({ post_id: id, user_id: user.id })
    } else {
      await supabase.from('feed_likes').delete()
        .eq('post_id', id).eq('user_id', user.id)
    }
  }

  async function postComment(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !newComment.trim()) return
    setPosting(true)

    const { data } = await supabase
      .from('feed_comments')
      .insert({
        post_id: id,
        user_id: user.id,
        content: newComment.trim(),
      })
      .select('id, content, created_at, profiles(display_name)')
      .single()

    if (data) {
      setComments(prev => [...prev, data as unknown as Comment])
      setNewComment('')
    }
    setPosting(false)
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden card-shadow">
      {/* Post header */}
      <div className="flex items-center gap-3 p-3">
        <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-bold text-sm">
          {authorName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900 text-sm">{authorName}</p>
          {potluckName && (
            <p className="text-xs text-gray-400">{potluckName}</p>
          )}
        </div>
        <span className="text-xs text-gray-400">{timeAgo(createdAt)}</span>
      </div>

      {/* Photo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={caption || 'Food photo'}
        className="w-full aspect-square object-cover"
      />

      {/* Actions */}
      <div className="px-3 pt-3 pb-1">
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={toggleLike}
            className={`flex items-center gap-1.5 text-sm font-semibold transition-all ${
              liked ? 'text-red-500 scale-110' : 'text-gray-400'
            }`}
          >
            <span className="text-lg">{liked ? '❤️' : '🤍'}</span>
            <span>{likes}</span>
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-400"
          >
            <span className="text-lg">💬</span>
            <span>{comments.length}</span>
          </button>
        </div>

        {/* Caption */}
        {caption && (
          <p className="text-sm text-gray-900 mb-2">
            <span className="font-semibold">{authorName}</span>{' '}
            {caption}
          </p>
        )}

        {/* Comments */}
        {showComments && (
          <div className="space-y-2 mb-2">
            {comments.map(comment => (
              <p key={comment.id} className="text-sm text-gray-700">
                <span className="font-semibold">
                  {comment.profiles?.display_name || 'User'}
                </span>{' '}
                {comment.content}
              </p>
            ))}

            {/* Add comment form */}
            {user && (
              <form onSubmit={postComment} className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
                <button
                  type="submit"
                  disabled={posting || !newComment.trim()}
                  className="text-orange-500 font-bold text-sm disabled:opacity-40"
                >
                  Post
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
