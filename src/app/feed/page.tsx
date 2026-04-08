/**
 * Feed Page
 *
 * A scrollable social feed showing food photos from all potlucks.
 * Users can:
 * - See photos posted by everyone they've potlucked with
 * - Like photos (heart button)
 * - Comment on photos
 * - Post their own photo via the + button
 *
 * Fetches real data from Supabase — photos, likes, and comments.
 */

'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import FeedPost from '@/components/FeedPost'
import PhotoUpload from '@/components/PhotoUpload'

interface Post {
  id: string
  image_url: string
  caption: string | null
  created_at: string
  potluck_id: string | null
  profiles: {
    display_name: string
  }
  potlucks: {
    name: string
  } | null
  feed_likes: { user_id: string }[]
  feed_comments: {
    id: string
    content: string
    created_at: string
    profiles: { display_name: string }
  }[]
}

export default function FeedPage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)

  async function fetchPosts() {
    const { data } = await supabase
      .from('feed_posts')
      .select(`
        id,
        image_url,
        caption,
        created_at,
        potluck_id,
        profiles(display_name),
        potlucks(name),
        feed_likes(user_id),
        feed_comments(
          id,
          content,
          created_at,
          profiles(display_name)
        )
      `)
      .order('created_at', { ascending: false })
      .limit(50)

    if (data) setPosts(data as unknown as Post[])
    setLoading(false)
  }

  useEffect(() => {
    fetchPosts()

    // Real-time updates when new posts, likes, or comments come in
    const channel = supabase
      .channel('feed-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'feed_posts' }, fetchPosts)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'feed_likes' }, fetchPosts)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'feed_comments' }, fetchPosts)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  function handleLikeToggle(postId: string, liked: boolean) {
    // Optimistic update — already handled inside FeedPost
    // This callback is here for future use (e.g., notifications)
    console.log(`Post ${postId} ${liked ? 'liked' : 'unliked'}`)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-gray-900">Food Feed 📸</h2>
        {user && (
          <button
            onClick={() => setShowUpload(true)}
            className="gradient-primary text-white text-sm font-bold px-4 py-2 rounded-xl"
          >
            + Post
          </button>
        )}
      </div>

      {/* Upload form (shown when + Post is tapped) */}
      {showUpload && (
        <PhotoUpload
          onUploaded={() => {
            setShowUpload(false)
            fetchPosts()
          }}
          onCancel={() => setShowUpload(false)}
        />
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center py-12">
          <p className="text-gray-400 text-sm">Loading feed...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && posts.length === 0 && (
        <div className="min-h-[50vh] flex flex-col items-center justify-center text-center">
          <div className="text-5xl mb-4">🍽️</div>
          <h3 className="text-lg font-extrabold text-gray-900 mb-2">
            No photos yet!
          </h3>
          <p className="text-sm text-gray-500 max-w-[260px]">
            Be the first to share a photo of your dish.
          </p>
          {user && (
            <button
              onClick={() => setShowUpload(true)}
              className="mt-4 gradient-primary text-white font-bold text-sm py-3 px-6 rounded-xl"
            >
              📷 Post a Photo
            </button>
          )}
        </div>
      )}

      {/* Feed posts */}
      {posts.map(post => (
        <FeedPost
          key={post.id}
          id={post.id}
          imageUrl={post.image_url}
          caption={post.caption}
          createdAt={post.created_at}
          authorName={post.profiles?.display_name || 'Unknown'}
          potluckName={post.potlucks?.name}
          likeCount={post.feed_likes?.length || 0}
          hasLiked={post.feed_likes?.some(l => l.user_id === user?.id) || false}
          comments={post.feed_comments || []}
          onLikeToggle={handleLikeToggle}
        />
      ))}
    </div>
  )
}
