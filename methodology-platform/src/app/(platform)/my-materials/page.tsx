'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, MoreVertical, Edit, Trash2, Eye, EyeOff } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { getMaterialsByAuthor, deleteMaterial, updateMaterial } from '@/lib/firebase/firestore'
import { GRADE_LABELS } from '@/types'
import type { Material } from '@/types'
import { Eye as EyeIcon, Heart, MessageCircle, FileText, Video, FileImage, HelpCircle, FileAudio } from 'lucide-react'

const typeIcons: Record<string, React.ReactNode> = {
  text: <FileText className="h-4 w-4" />,
  video: <Video className="h-4 w-4" />,
  presentation: <FileImage className="h-4 w-4" />,
  document: <FileText className="h-4 w-4" />,
  audio: <FileAudio className="h-4 w-4" />,
  quiz: <HelpCircle className="h-4 w-4" />,
}

export default function MyMaterialsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [materials, setMaterials] = useState<Material[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [materialToDelete, setMaterialToDelete] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadMaterials()
    }
  }, [user])

  const loadMaterials = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const result = await getMaterialsByAuthor(user.id)
      setMaterials(result.materials)
    } catch (error) {
      console.error('Error loading materials:', error)
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить материалы',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!materialToDelete) return
    try {
      await deleteMaterial(materialToDelete)
      setMaterials(materials.filter(m => m.id !== materialToDelete))
      toast({
        title: 'Удалено',
        description: 'Материал успешно удалён',
      })
    } catch (error) {
      console.error('Error deleting material:', error)
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить материал',
        variant: 'destructive',
      })
    } finally {
      setDeleteDialogOpen(false)
      setMaterialToDelete(null)
    }
  }

  const toggleVisibility = async (material: Material) => {
    try {
      await updateMaterial(material.id, { isPublic: !material.isPublic })
      setMaterials(materials.map(m =>
        m.id === material.id ? { ...m, isPublic: !m.isPublic } : m
      ))
      toast({
        title: material.isPublic ? 'Скрыто' : 'Опубликовано',
        description: material.isPublic
          ? 'Материал теперь виден только вам'
          : 'Материал теперь виден всем',
      })
    } catch (error) {
      console.error('Error updating material:', error)
      toast({
        title: 'Ошибка',
        description: 'Не удалось изменить видимость',
        variant: 'destructive',
      })
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto py-12 text-center">
        <p>Войдите, чтобы увидеть свои материалы</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Мои материалы</h1>
        <Link href="/materials/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Создать
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : materials.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">У вас пока нет материалов</p>
          <Link href="/materials/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Создать первый материал
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map((material) => (
            <Card key={material.id} className="relative">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {typeIcons[material.type]}
                    <Badge variant="outline">{material.subject}</Badge>
                    {!material.isPublic && (
                      <Badge variant="secondary">
                        <EyeOff className="h-3 w-3 mr-1" />
                        Скрыт
                      </Badge>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/materials/${material.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Просмотр
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/materials/${material.id}/edit`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Редактировать
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleVisibility(material)}>
                        {material.isPublic ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-2" />
                            Скрыть
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            Опубликовать
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => {
                          setMaterialToDelete(material.id)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Удалить
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <Link href={`/materials/${material.id}`}>
                  <h3 className="font-semibold line-clamp-2 mb-2 hover:text-primary">
                    {material.title}
                  </h3>
                </Link>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {material.description}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {material.grades.map((grade) => (
                    <Badge key={grade} variant="outline" className="text-xs">
                      {GRADE_LABELS[grade]}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="pt-2 flex items-center justify-between text-muted-foreground text-sm">
                <span className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <EyeIcon className="h-3 w-3" />
                    {material.stats.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    {material.stats.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    {material.stats.comments}
                  </span>
                </span>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить материал?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Материал будет удалён навсегда.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
