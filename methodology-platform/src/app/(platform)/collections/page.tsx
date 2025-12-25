'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Folder, MoreVertical, Edit, Trash2, Lock, Globe } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { getUserCollections, createCollection } from '@/lib/firebase/firestore'
import type { Collection } from '@/types'

export default function CollectionsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [collections, setCollections] = useState<Collection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newCollection, setNewCollection] = useState({
    name: '',
    description: '',
    isPublic: false,
  })
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (user) {
      loadCollections()
    }
  }, [user])

  const loadCollections = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const result = await getUserCollections(user.id)
      setCollections(result)
    } catch (error) {
      console.error('Error loading collections:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCollection = async () => {
    if (!user || !newCollection.name.trim()) return
    setIsCreating(true)
    try {
      const id = await createCollection({
        name: newCollection.name,
        description: newCollection.description,
        isPublic: newCollection.isPublic,
        ownerId: user.id,
        ownerName: user.displayName,
        thumbnail: null,
      })

      setCollections([
        {
          id,
          name: newCollection.name,
          description: newCollection.description,
          isPublic: newCollection.isPublic,
          ownerId: user.id,
          ownerName: user.displayName,
          thumbnail: null,
          materialIds: [],
          materialsCount: 0,
          createdAt: new Date() as any,
          updatedAt: new Date() as any,
        },
        ...collections,
      ])

      toast({
        title: 'Коллекция создана',
        description: 'Теперь вы можете добавлять в неё материалы',
      })

      setDialogOpen(false)
      setNewCollection({ name: '', description: '', isPublic: false })
    } catch (error) {
      console.error('Error creating collection:', error)
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать коллекцию',
        variant: 'destructive',
      })
    } finally {
      setIsCreating(false)
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto py-12 text-center">
        <p>Войдите, чтобы увидеть свои коллекции</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Мои коллекции</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Создать коллекцию
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Новая коллекция</DialogTitle>
              <DialogDescription>
                Создайте коллекцию для организации материалов
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Название</Label>
                <Input
                  id="name"
                  placeholder="Моя коллекция"
                  value={newCollection.name}
                  onChange={(e) => setNewCollection({ ...newCollection, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  placeholder="Описание коллекции..."
                  value={newCollection.description}
                  onChange={(e) => setNewCollection({ ...newCollection, description: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Публичная коллекция</Label>
                  <p className="text-sm text-muted-foreground">
                    Другие пользователи смогут видеть эту коллекцию
                  </p>
                </div>
                <Switch
                  checked={newCollection.isPublic}
                  onCheckedChange={(checked) => setNewCollection({ ...newCollection, isPublic: checked })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleCreateCollection} disabled={isCreating || !newCollection.name.trim()}>
                {isCreating ? 'Создание...' : 'Создать'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center py-12">
          <Folder className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">У вас пока нет коллекций</p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Создать первую коллекцию
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((collection) => (
            <Card key={collection.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Folder className="h-5 w-5 text-primary" />
                    {collection.isPublic ? (
                      <Globe className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Редактировать
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Удалить
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <Link href={`/collections/${collection.id}`}>
                  <CardTitle className="text-lg mb-2 hover:text-primary">
                    {collection.name}
                  </CardTitle>
                </Link>
                {collection.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {collection.description}
                  </p>
                )}
              </CardContent>
              <CardFooter className="pt-2">
                <Badge variant="secondary">
                  {collection.materialsCount} материал(ов)
                </Badge>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
