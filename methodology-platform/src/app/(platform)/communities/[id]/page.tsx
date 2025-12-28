'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Users,
  Globe,
  Lock,
  MessageSquare,
  Settings,
  UserPlus,
  UserMinus,
  MoreVertical,
  Heart,
  Share2,
  Send,
  Loader2,
  Trash2,
  Crown,
  Shield,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/hooks/useLanguage'
import { useToast } from '@/hooks/use-toast'
import {
  getCommunity,
  getCommunityPosts,
  getCommunityMembers,
  joinCommunity,
  leaveCommunity,
  isCommunityMember,
  createCommunityPost,
  togglePostLike,
  isPostLikedByUser,
  addPostComment,
  getPostComments,
  deletePost,
  getUser,
  updateCommunity,
} from '@/lib/firebase/firestore'
import type { Community, CommunityPost, CommunityMember, PostComment } from '@/lib/firebase/firestore'
import { getInitials, formatRelativeTime } from '@/lib/utils'
import type { User } from '@/types'

export default function CommunityDetailPage() {
  const params = useParams()
  const { user } = useAuth()
  const { language } = useLanguage()
  const { toast } = useToast()

  const [community, setCommunity] = useState<Community | null>(null)
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [members, setMembers] = useState<CommunityMember[]>([])
  const [owner, setOwner] = useState<User | null>(null)
  const [isMember, setIsMember] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isJoining, setIsJoining] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const [newPost, setNewPost] = useState('')
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())
  const [likingPost, setLikingPost] = useState<string | null>(null)

  // Comments state
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())
  const [postComments, setPostComments] = useState<Record<string, PostComment[]>>({})
  const [loadingComments, setLoadingComments] = useState<Set<string>>(new Set())
  const [newComments, setNewComments] = useState<Record<string, string>>({})
  const [sendingComment, setSendingComment] = useState<string | null>(null)

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [postToDelete, setPostToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Settings dialog
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editIsPublic, setEditIsPublic] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const txt = {
    ru: {
      back: 'Назад к сообществам',
      members: 'участников',
      posts: 'записей',
      join: 'Вступить',
      leave: 'Выйти',
      joined: 'Вы вступили в сообщество!',
      left: 'Вы покинули сообщество',
      postsTab: 'Записи',
      membersTab: 'Участники',
      writeSomething: 'Напишите что-нибудь...',
      publish: 'Опубликовать',
      published: 'Запись опубликована!',
      share: 'Поделиться',
      admin: 'Администратор',
      notFound: 'Сообщество не найдено',
      noPosts: 'Записей пока нет',
      beFirst: 'Станьте первым, кто напишет!',
      loginToJoin: 'Войдите, чтобы вступить',
      loginToPost: 'Войдите, чтобы писать',
      deletePost: 'Удалить запись',
      deletePostConfirm: 'Удалить эту запись?',
      deletePostDesc: 'Это действие нельзя отменить.',
      deleted: 'Запись удалена',
      cancel: 'Отмена',
      delete: 'Удалить',
      owner: 'Создатель',
      member: 'Участник',
      writeComment: 'Написать комментарий...',
      send: 'Отправить',
      comments: 'комментариев',
      showComments: 'Показать комментарии',
      hideComments: 'Скрыть комментарии',
      noMembers: 'Участников пока нет',
      joinedDate: 'Присоединился',
      settings: 'Настройки сообщества',
      settingsDesc: 'Изменить название, описание и видимость',
      communityName: 'Название',
      communityDescription: 'Описание',
      visibility: 'Видимость',
      public: 'Публичное',
      private: 'Приватное',
      save: 'Сохранить',
      saved: 'Изменения сохранены',
    },
    kk: {
      back: 'Қауымдастықтарға оралу',
      members: 'мүше',
      posts: 'жазба',
      join: 'Қосылу',
      leave: 'Шығу',
      joined: 'Сіз қауымдастыққа қосылдыңыз!',
      left: 'Сіз қауымдастықтан шықтыңыз',
      postsTab: 'Жазбалар',
      membersTab: 'Мүшелер',
      writeSomething: 'Бірдеңе жазыңыз...',
      publish: 'Жариялау',
      published: 'Жазба жарияланды!',
      share: 'Бөлісу',
      admin: 'Әкімші',
      notFound: 'Қауымдастық табылмады',
      noPosts: 'Жазбалар әлі жоқ',
      beFirst: 'Бірінші болып жазыңыз!',
      loginToJoin: 'Қосылу үшін кіріңіз',
      loginToPost: 'Жазу үшін кіріңіз',
      deletePost: 'Жазбаны жою',
      deletePostConfirm: 'Бұл жазбаны жою керек пе?',
      deletePostDesc: 'Бұл әрекетті қайтару мүмкін емес.',
      deleted: 'Жазба жойылды',
      cancel: 'Болдырмау',
      delete: 'Жою',
      owner: 'Құрушы',
      member: 'Мүше',
      writeComment: 'Пікір жазу...',
      send: 'Жіберу',
      comments: 'пікір',
      showComments: 'Пікірлерді көрсету',
      hideComments: 'Пікірлерді жасыру',
      noMembers: 'Мүшелер әлі жоқ',
      joinedDate: 'Қосылды',
      settings: 'Қауымдастық параметрлері',
      settingsDesc: 'Атауын, сипаттамасын және көрінуін өзгерту',
      communityName: 'Атауы',
      communityDescription: 'Сипаттама',
      visibility: 'Көріну',
      public: 'Жалпыға қолжетімді',
      private: 'Жеке',
      save: 'Сақтау',
      saved: 'Өзгерістер сақталды',
    },
  }

  const text = txt[language]

  useEffect(() => {
    const loadCommunity = async () => {
      if (!params.id) return

      try {
        const communityId = params.id as string
        const communityData = await getCommunity(communityId)

        if (!communityData) {
          setIsLoading(false)
          return
        }

        setCommunity(communityData)

        // Load posts
        const communityPosts = await getCommunityPosts(communityId)
        setPosts(communityPosts)

        // Load owner info
        if (communityData.ownerId) {
          const ownerData = await getUser(communityData.ownerId)
          setOwner(ownerData)
        }

        // Check if user is member and load liked posts
        if (user) {
          const member = await isCommunityMember(communityId, user.id)
          setIsMember(member)

          // Check which posts user has liked
          const likedSet = new Set<string>()
          for (const post of communityPosts) {
            const liked = await isPostLikedByUser(communityId, post.id, user.id)
            if (liked) likedSet.add(post.id)
          }
          setLikedPosts(likedSet)
        }
      } catch (error) {
        console.error('Error loading community:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCommunity()
  }, [params.id, user])

  const handleJoin = async () => {
    if (!user) {
      toast({ title: text.loginToJoin, variant: 'destructive' })
      return
    }
    if (!community) return

    setIsJoining(true)
    try {
      await joinCommunity(community.id, user.id)
      setIsMember(true)
      setCommunity(prev => prev ? { ...prev, membersCount: prev.membersCount + 1 } : null)
      toast({ title: text.joined })
    } catch (error) {
      console.error('Error joining:', error)
    } finally {
      setIsJoining(false)
    }
  }

  const handleLeave = async () => {
    if (!user || !community) return

    setIsJoining(true)
    try {
      await leaveCommunity(community.id, user.id)
      setIsMember(false)
      setCommunity(prev => prev ? { ...prev, membersCount: Math.max(0, prev.membersCount - 1) } : null)
      toast({ title: text.left })
    } catch (error) {
      console.error('Error leaving:', error)
    } finally {
      setIsJoining(false)
    }
  }

  const handleCreatePost = async () => {
    if (!user) {
      toast({ title: text.loginToPost, variant: 'destructive' })
      return
    }
    if (!newPost.trim() || !community) return

    setIsPosting(true)
    try {
      await createCommunityPost(community.id, {
        authorId: user.id,
        authorName: user.displayName,
        authorAvatar: user.avatar,
        content: newPost.trim(),
        images: [],
      })

      const updatedPosts = await getCommunityPosts(community.id)
      setPosts(updatedPosts)
      setCommunity(prev => prev ? { ...prev, postsCount: prev.postsCount + 1 } : null)

      setNewPost('')
      toast({ title: text.published })
    } catch (error) {
      console.error('Error creating post:', error)
    } finally {
      setIsPosting(false)
    }
  }

  const handleLikePost = async (postId: string) => {
    if (!user || !community) return

    setLikingPost(postId)
    try {
      const isNowLiked = await togglePostLike(community.id, postId, user.id)

      if (isNowLiked) {
        setLikedPosts(prev => new Set([...prev, postId]))
      } else {
        setLikedPosts(prev => {
          const newSet = new Set(prev)
          newSet.delete(postId)
          return newSet
        })
      }

      setPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, likes: isNowLiked ? p.likes + 1 : p.likes - 1 }
          : p
      ))
    } catch (error) {
      console.error('Error liking post:', error)
    } finally {
      setLikingPost(null)
    }
  }

  const toggleComments = async (postId: string) => {
    if (expandedComments.has(postId)) {
      setExpandedComments(prev => {
        const newSet = new Set(prev)
        newSet.delete(postId)
        return newSet
      })
    } else {
      setExpandedComments(prev => new Set([...prev, postId]))

      // Load comments if not already loaded
      if (!postComments[postId] && community) {
        setLoadingComments(prev => new Set([...prev, postId]))
        try {
          const comments = await getPostComments(community.id, postId)
          setPostComments(prev => ({ ...prev, [postId]: comments }))
        } catch (error) {
          console.error('Error loading comments:', error)
        } finally {
          setLoadingComments(prev => {
            const newSet = new Set(prev)
            newSet.delete(postId)
            return newSet
          })
        }
      }
    }
  }

  const handleAddComment = async (postId: string) => {
    if (!user || !community) return
    const content = newComments[postId]?.trim()
    if (!content) return

    setSendingComment(postId)
    try {
      await addPostComment(community.id, postId, {
        authorId: user.id,
        authorName: user.displayName,
        authorAvatar: user.avatar,
        content,
      })

      // Reload comments
      const comments = await getPostComments(community.id, postId)
      setPostComments(prev => ({ ...prev, [postId]: comments }))
      setNewComments(prev => ({ ...prev, [postId]: '' }))

      // Update post comments count
      setPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, comments: p.comments + 1 } : p
      ))
    } catch (error) {
      console.error('Error adding comment:', error)
    } finally {
      setSendingComment(null)
    }
  }

  const handleDeletePost = async () => {
    if (!community || !postToDelete) return

    setIsDeleting(true)
    try {
      await deletePost(community.id, postToDelete)
      setPosts(prev => prev.filter(p => p.id !== postToDelete))
      setCommunity(prev => prev ? { ...prev, postsCount: Math.max(0, prev.postsCount - 1) } : null)
      toast({ title: text.deleted })
    } catch (error) {
      console.error('Error deleting post:', error)
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setPostToDelete(null)
    }
  }

  const loadMembers = async () => {
    if (!community || members.length > 0) return
    try {
      const membersList = await getCommunityMembers(community.id)
      setMembers(membersList)
    } catch (error) {
      console.error('Error loading members:', error)
    }
  }

  const openSettings = () => {
    if (!community) return
    setEditName(community.name)
    setEditDescription(community.description)
    setEditIsPublic(community.isPublic)
    setSettingsOpen(true)
  }

  const handleSaveSettings = async () => {
    if (!community) return

    setIsSaving(true)
    try {
      await updateCommunity(community.id, {
        name: editName.trim(),
        description: editDescription.trim(),
        isPublic: editIsPublic,
      })
      setCommunity(prev => prev ? {
        ...prev,
        name: editName.trim(),
        description: editDescription.trim(),
        isPublic: editIsPublic,
      } : null)
      toast({ title: text.saved })
      setSettingsOpen(false)
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!community) {
    return (
      <div className="container mx-auto py-6 px-4">
        <Link href="/communities">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {text.back}
          </Button>
        </Link>
        <div className="text-center py-12">
          <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">{text.notFound}</p>
        </div>
      </div>
    )
  }

  const isOwner = user?.id === community.ownerId

  return (
    <div className="container mx-auto py-6 px-4">
      <Link href="/communities">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {text.back}
        </Button>
      </Link>

      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={community.avatar || undefined} />
            <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
              {community.name[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">{community.name}</h1>
              {community.isPublic ? (
                <Globe className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Lock className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <p className="text-muted-foreground mb-3">{community.description}</p>
            <div className="flex flex-wrap items-center gap-4">
              <Badge variant="outline">{community.subject}</Badge>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Users className="h-4 w-4" />
                {community.membersCount.toLocaleString()} {text.members}
              </span>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                {community.postsCount} {text.posts}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {isOwner ? (
              <Button variant="outline" size="icon" onClick={openSettings}>
                <Settings className="h-4 w-4" />
              </Button>
            ) : isMember ? (
              <Button variant="outline" onClick={handleLeave} disabled={isJoining}>
                {isJoining ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <UserMinus className="h-4 w-4 mr-2" />
                )}
                {text.leave}
              </Button>
            ) : (
              <Button onClick={handleJoin} disabled={isJoining}>
                {isJoining ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <UserPlus className="h-4 w-4 mr-2" />
                )}
                {text.join}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="posts" onValueChange={(v) => v === 'members' && loadMembers()}>
            <TabsList className="mb-4">
              <TabsTrigger value="posts">{text.postsTab}</TabsTrigger>
              <TabsTrigger value="members">{text.membersTab}</TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="space-y-4">
              {/* Create post */}
              {isMember && (
                <Card>
                  <CardContent className="pt-4">
                    <Textarea
                      placeholder={text.writeSomething}
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      className="mb-2"
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={handleCreatePost}
                        disabled={!newPost.trim() || isPosting}
                      >
                        {isPosting ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Send className="h-4 w-4 mr-2" />
                        )}
                        {text.publish}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Posts list */}
              {posts.length > 0 ? (
                posts.map((post) => {
                  const isLiked = likedPosts.has(post.id)
                  const isAuthor = user?.id === post.authorId
                  const commentsExpanded = expandedComments.has(post.id)
                  const comments = postComments[post.id] || []
                  const isLoadingComments = loadingComments.has(post.id)

                  return (
                    <Card key={post.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <Link
                            href={`/profile/${post.authorId}`}
                            className="flex items-center gap-3 hover:opacity-80"
                          >
                            <Avatar>
                              <AvatarImage src={post.authorAvatar || undefined} />
                              <AvatarFallback>{getInitials(post.authorName)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{post.authorName}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatRelativeTime(post.createdAt.toDate())}
                              </p>
                            </div>
                          </Link>
                          {(isAuthor || isOwner) && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => {
                                    setPostToDelete(post.id)
                                    setDeleteDialogOpen(true)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  {text.deletePost}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="mb-4 whitespace-pre-wrap">{post.content}</p>
                        {post.images && post.images.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 mb-4">
                            {post.images.map((img, idx) => (
                              <img
                                key={idx}
                                src={img}
                                alt=""
                                className="rounded-lg object-cover w-full h-48"
                              />
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-4 border-t pt-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLikePost(post.id)}
                            disabled={!user || likingPost === post.id}
                            className={isLiked ? 'text-red-500' : ''}
                          >
                            {likingPost === post.id ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            ) : (
                              <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                            )}
                            {post.likes}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleComments(post.id)}
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            {post.comments}
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Share2 className="h-4 w-4 mr-1" />
                            {text.share}
                          </Button>
                        </div>

                        {/* Comments section */}
                        {commentsExpanded && (
                          <div className="mt-4 border-t pt-4 space-y-3">
                            {isLoadingComments ? (
                              <div className="flex justify-center py-4">
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                              </div>
                            ) : (
                              <>
                                {comments.map((comment) => (
                                  <div key={comment.id} className="flex gap-3">
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage src={comment.authorAvatar || undefined} />
                                      <AvatarFallback className="text-xs">
                                        {getInitials(comment.authorName)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 bg-muted rounded-lg p-2">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm">{comment.authorName}</span>
                                        <span className="text-xs text-muted-foreground">
                                          {formatRelativeTime(comment.createdAt.toDate())}
                                        </span>
                                      </div>
                                      <p className="text-sm">{comment.content}</p>
                                    </div>
                                  </div>
                                ))}

                                {/* Add comment */}
                                {user && isMember && (
                                  <div className="flex gap-2 mt-2">
                                    <Input
                                      placeholder={text.writeComment}
                                      value={newComments[post.id] || ''}
                                      onChange={(e) => setNewComments(prev => ({ ...prev, [post.id]: e.target.value }))}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                          e.preventDefault()
                                          handleAddComment(post.id)
                                        }
                                      }}
                                    />
                                    <Button
                                      size="icon"
                                      onClick={() => handleAddComment(post.id)}
                                      disabled={!newComments[post.id]?.trim() || sendingComment === post.id}
                                    >
                                      {sendingComment === post.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Send className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })
              ) : (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">{text.noPosts}</p>
                    <p className="text-sm">{text.beFirst}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="members">
              <Card>
                <CardContent className="py-4">
                  {members.length > 0 ? (
                    <div className="space-y-3">
                      {members.map((member) => (
                        <Link
                          key={member.id}
                          href={`/profile/${member.userId}`}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={member.user?.avatar || undefined} />
                              <AvatarFallback>
                                {getInitials(member.user?.displayName || 'U')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium flex items-center gap-2">
                                {member.user?.displayName || 'Пользователь'}
                                {member.role === 'owner' && (
                                  <Crown className="h-4 w-4 text-yellow-500" />
                                )}
                                {member.role === 'admin' && (
                                  <Shield className="h-4 w-4 text-blue-500" />
                                )}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {member.role === 'owner' ? text.owner : text.member}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {text.joinedDate} {formatRelativeTime(member.joinedAt.toDate())}
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>{text.noMembers}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{text.admin}</CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                href={`/profile/${community.ownerId}`}
                className="flex items-center gap-2 hover:opacity-80"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={owner?.avatar || undefined} />
                  <AvatarFallback>{getInitials(community.ownerName)}</AvatarFallback>
                </Avatar>
                <span className="text-sm">{community.ownerName}</span>
              </Link>
            </CardContent>
          </Card>

          {community.tags && community.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Теги</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {community.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{text.deletePostConfirm}</AlertDialogTitle>
            <AlertDialogDescription>{text.deletePostDesc}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{text.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePost}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {text.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Settings dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{text.settings}</DialogTitle>
            <DialogDescription>{text.settingsDesc}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">{text.communityName}</Label>
              <Input
                id="name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{text.communityDescription}</Label>
              <Textarea
                id="description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {editIsPublic ? (
                  <Globe className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Lock className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <p className="font-medium">{text.visibility}</p>
                  <p className="text-sm text-muted-foreground">
                    {editIsPublic ? text.public : text.private}
                  </p>
                </div>
              </div>
              <Switch checked={editIsPublic} onCheckedChange={setEditIsPublic} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsOpen(false)}>
              {text.cancel}
            </Button>
            <Button onClick={handleSaveSettings} disabled={isSaving || !editName.trim()}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {text.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
