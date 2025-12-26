'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Grid, List } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { searchMaterials } from '@/lib/firebase/firestore'
import { useLanguage } from '@/hooks/useLanguage'
import { SUBJECTS, GRADES, GRADE_LABELS } from '@/types'
import type { Material } from '@/types'
import { Eye, Heart, FileText, Video, FileImage, HelpCircle, FileAudio } from 'lucide-react'

const typeIcons: Record<string, React.ReactNode> = {
  text: <FileText className="h-4 w-4" />,
  video: <Video className="h-4 w-4" />,
  presentation: <FileImage className="h-4 w-4" />,
  document: <FileText className="h-4 w-4" />,
  audio: <FileAudio className="h-4 w-4" />,
  quiz: <HelpCircle className="h-4 w-4" />,
}

export default function ExplorePage() {
  const { t } = useLanguage()
  const [materials, setMaterials] = useState<Material[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [selectedGrade, setSelectedGrade] = useState<string>('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    loadMaterials()
  }, [])

  const loadMaterials = async () => {
    setIsLoading(true)
    try {
      const results = await searchMaterials('', {
        subject: selectedSubject || undefined,
        grades: selectedGrade ? [parseInt(selectedGrade)] : undefined,
      })
      setMaterials(results)
    } catch (error) {
      console.error('Error loading materials:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async () => {
    setIsLoading(true)
    try {
      const results = await searchMaterials(searchQuery, {
        subject: selectedSubject || undefined,
        grades: selectedGrade ? [parseInt(selectedGrade)] : undefined,
      })
      setMaterials(results)
    } catch (error) {
      console.error('Error searching materials:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterChange = () => {
    handleSearch()
  }

  const getDifficultyLabel = (difficulty: string) => {
    if (difficulty === 'easy') return t.pages.explore.easy
    if (difficulty === 'medium') return t.pages.explore.medium
    return t.pages.explore.hard
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">{t.pages.explore.title}</h1>

      {/* Search and filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 flex gap-2">
          <Input
            placeholder={t.pages.explore.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          <Select value={selectedSubject} onValueChange={(v) => { setSelectedSubject(v); handleFilterChange(); }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t.materials.subject} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.pages.explore.allSubjects}</SelectItem>
              {SUBJECTS.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedGrade} onValueChange={(v) => { setSelectedGrade(v); handleFilterChange(); }}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={t.materials.course} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.pages.explore.allCourses}</SelectItem>
              {GRADES.map((grade) => (
                <SelectItem key={grade} value={grade.toString()}>
                  {GRADE_LABELS[grade]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : materials.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>{t.pages.explore.noResults}</p>
          <p className="text-sm mt-2">{t.pages.explore.tryDifferent}</p>
        </div>
      ) : (
        <div className={viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
          : 'space-y-4'
        }>
          {materials.map((material) => (
            <Link key={material.id} href={`/materials/${material.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {typeIcons[material.type]}
                      <Badge variant="outline">{material.subject}</Badge>
                    </div>
                    <Badge variant="secondary">
                      {getDifficultyLabel(material.difficulty)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <h3 className="font-semibold line-clamp-2 mb-2">{material.title}</h3>
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
                <CardFooter className="pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={material.authorAvatar || undefined} />
                      <AvatarFallback>{material.authorName[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">{material.authorName}</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground text-sm">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {material.stats.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {material.stats.likes}
                    </span>
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
