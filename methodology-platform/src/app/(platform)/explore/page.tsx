'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Grid, List, Sparkles } from 'lucide-react'

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

const typeGradients: Record<string, string> = {
  text: 'from-blue-500 to-indigo-600',
  video: 'from-red-500 to-pink-600',
  presentation: 'from-orange-500 to-amber-600',
  document: 'from-emerald-500 to-teal-600',
  audio: 'from-purple-500 to-violet-600',
  quiz: 'from-cyan-500 to-blue-600',
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
    if (difficulty === 'easy') return 'bg-emerald-100 text-emerald-700'
    if (difficulty === 'medium') return 'bg-amber-100 text-amber-700'
    return 'bg-red-100 text-red-700'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto py-8 px-4 lg:px-6">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{t.pages.explore.title}</h1>
          </div>
          <p className="text-gray-500 ml-14">
            {language === 'ru' ? 'Найдите материалы для ваших уроков' : 'Сабақтарыңызға материалдар табыңыз'}
          </p>
        </motion.div>

        {/* Search and filters */}
        <motion.div
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1 group">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                <Input
                  placeholder={t.pages.explore.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 h-11 rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
              </div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handleSearch}
                  className="h-11 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/20"
                >
                  <Search className="h-4 w-4 mr-2" />
                  {language === 'ru' ? 'Найти' : 'Іздеу'}
                </Button>
              </motion.div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Select value={selectedSubject} onValueChange={(v) => { setSelectedSubject(v); handleFilterChange(); }}>
                <SelectTrigger className="w-[180px] h-11 rounded-xl border-gray-200">
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
                <SelectTrigger className="w-[140px] h-11 rounded-xl border-gray-200">
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

              <div className="flex border border-gray-200 rounded-xl overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className={`h-11 w-11 rounded-none ${viewMode === 'grid' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}`}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className={`h-11 w-11 rounded-none ${viewMode === 'list' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}`}
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
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-emerald-100 animate-spin border-t-emerald-500" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-emerald-500" />
                </div>
              </div>
              <p className="mt-4 text-gray-500">
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
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
                <Search className="h-10 w-10 text-gray-400" />
              </div>
              <p className="text-xl font-semibold text-gray-900 mb-2">{t.pages.explore.noResults}</p>
              <p className="text-gray-500">{t.pages.explore.tryDifferent}</p>
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
                      whileHover={{ y: -5, scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <Card className="overflow-hidden border-gray-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 cursor-pointer h-full bg-white rounded-2xl">
                        {/* Card header with gradient */}
                        <div className={`h-2 bg-gradient-to-r ${typeGradients[material.type] || 'from-gray-400 to-gray-500'}`} />

                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`p-2 rounded-lg bg-gradient-to-br ${typeGradients[material.type] || 'from-gray-400 to-gray-500'} text-white shadow-sm`}>
                                {typeIcons[material.type]}
                              </div>
                              <Badge variant="outline" className="rounded-lg font-medium">{material.subject}</Badge>
                            </div>
                            <Badge className={`rounded-lg ${getDifficultyColor(material.difficulty)}`}>
                              {getDifficultyLabel(material.difficulty)}
                            </Badge>
                          </div>
                        </CardHeader>

                        <CardContent className="pb-3">
                          <h3 className="font-bold text-lg text-gray-900 line-clamp-2 mb-2 group-hover:text-emerald-600 transition-colors">
                            {material.title}
                          </h3>
                          <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                            {material.description}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {material.grades.map((grade) => (
                              <Badge key={grade} variant="secondary" className="text-xs rounded-lg bg-gray-100 text-gray-600 font-medium">
                                {GRADE_LABELS[grade]}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>

                        <CardFooter className="pt-3 border-t border-gray-50">
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7 ring-2 ring-gray-100">
                                <AvatarImage src={material.authorAvatar || undefined} />
                                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs">
                                  {material.authorName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-gray-600 font-medium">{material.authorName}</span>
                            </div>
                            <div className="flex items-center gap-4 text-gray-400 text-sm">
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
