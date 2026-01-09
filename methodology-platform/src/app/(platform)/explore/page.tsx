'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Grid, List, Compass, Loader2 } from 'lucide-react'

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
  const { t, language } = useLanguage()
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

  const getDifficultyColor = (difficulty: string) => {
    if (difficulty === 'easy') return 'bg-neutral-100 text-neutral-700'
    if (difficulty === 'medium') return 'bg-neutral-200 text-neutral-800'
    return 'bg-neutral-900 text-white'
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto py-8 px-4 lg:px-6">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-neutral-900">
              <Compass className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">{t.pages.explore.title}</h1>
          </div>
          <p className="text-neutral-500 ml-14">
            {language === 'ru' ? 'Найдите материалы для ваших уроков' : 'Сабақтарыңызға материалдар табыңыз'}
          </p>
        </motion.div>

        {/* Search and filters */}
        <motion.div
          className="bg-neutral-50 rounded-2xl border border-neutral-100 p-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1 group">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 group-focus-within:text-neutral-900 transition-colors" />
                <Input
                  placeholder={t.pages.explore.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 h-11 rounded-xl border-neutral-200 bg-white focus:border-neutral-900 focus:ring-neutral-900/10"
                />
              </div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handleSearch}
                  className="h-11 px-6 rounded-xl bg-neutral-900 hover:bg-neutral-800"
                >
                  <Search className="h-4 w-4 mr-2" />
                  {language === 'ru' ? 'Найти' : 'Іздеу'}
                </Button>
              </motion.div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Select value={selectedSubject} onValueChange={(v) => { setSelectedSubject(v); handleFilterChange(); }}>
                <SelectTrigger className="w-[180px] h-11 rounded-xl border-neutral-200 bg-white">
                  <SelectValue placeholder={t.materials.subject} />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">{t.pages.explore.allSubjects}</SelectItem>
                  {SUBJECTS.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedGrade} onValueChange={(v) => { setSelectedGrade(v); handleFilterChange(); }}>
                <SelectTrigger className="w-[140px] h-11 rounded-xl border-neutral-200 bg-white">
                  <SelectValue placeholder={t.materials.course} />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">{t.pages.explore.allCourses}</SelectItem>
                  {GRADES.map((grade) => (
                    <SelectItem key={grade} value={grade.toString()}>
                      {GRADE_LABELS[grade]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex border border-neutral-200 rounded-xl overflow-hidden bg-white">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className={`h-11 w-11 rounded-none ${viewMode === 'grid' ? 'bg-neutral-900 hover:bg-neutral-800' : 'hover:bg-neutral-100'}`}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className={`h-11 w-11 rounded-none ${viewMode === 'list' ? 'bg-neutral-900 hover:bg-neutral-800' : 'hover:bg-neutral-100'}`}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              className="flex flex-col items-center justify-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Loader2 className="h-10 w-10 text-neutral-400 animate-spin" />
              <p className="mt-4 text-neutral-500">
                {language === 'ru' ? 'Загрузка...' : 'Жүктелуде...'}
              </p>
            </motion.div>
          ) : materials.length === 0 ? (
            <motion.div
              key="empty"
              className="text-center py-20"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="w-20 h-20 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-6">
                <Search className="h-10 w-10 text-neutral-400" />
              </div>
              <p className="text-xl font-semibold text-neutral-900 mb-2">{t.pages.explore.noResults}</p>
              <p className="text-neutral-500">{t.pages.explore.tryDifferent}</p>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              className={viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
              }
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {materials.map((material, index) => (
                <motion.div
                  key={material.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={`/materials/${material.id}`}>
                    <motion.div
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <Card className="overflow-hidden border-neutral-200 hover:border-neutral-300 hover:shadow-lg transition-all duration-300 cursor-pointer h-full bg-white rounded-2xl">
                        {/* Card header with type indicator */}
                        <div className="h-1 bg-neutral-900" />

                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <div className="p-2 rounded-lg bg-neutral-100 text-neutral-700">
                                {typeIcons[material.type]}
                              </div>
                              <Badge variant="outline" className="rounded-lg font-medium border-neutral-200">{material.subject}</Badge>
                            </div>
                            <Badge className={`rounded-lg ${getDifficultyColor(material.difficulty)}`}>
                              {getDifficultyLabel(material.difficulty)}
                            </Badge>
                          </div>
                        </CardHeader>

                        <CardContent className="pb-3">
                          <h3 className="font-semibold text-lg text-neutral-900 line-clamp-2 mb-2 group-hover:text-neutral-700 transition-colors">
                            {material.title}
                          </h3>
                          <p className="text-sm text-neutral-500 line-clamp-2 mb-3">
                            {material.description}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {material.grades.map((grade) => (
                              <Badge key={grade} variant="secondary" className="text-xs rounded-lg bg-neutral-100 text-neutral-600 font-medium">
                                {GRADE_LABELS[grade]}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>

                        <CardFooter className="pt-3 border-t border-neutral-100">
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7 ring-2 ring-neutral-100">
                                <AvatarImage src={material.authorAvatar || undefined} />
                                <AvatarFallback className="bg-neutral-900 text-white text-xs">
                                  {material.authorName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-neutral-600 font-medium">{material.authorName}</span>
                            </div>
                            <div className="flex items-center gap-4 text-neutral-400 text-sm">
                              <span className="flex items-center gap-1.5">
                                <Eye className="h-4 w-4" />
                                {material.stats.views}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Heart className="h-4 w-4" />
                                {material.stats.likes}
                              </span>
                            </div>
                          </div>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
