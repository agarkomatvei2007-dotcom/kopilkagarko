'use client'

import { useState, useEffect } from 'react'
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '@/lib/firebase/config'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, X, Home, TrendingUp, Users, Sparkles, Search, Grid, List } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import MaterialCard from '@/components/materials/MaterialCard'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/hooks/useLanguage'
import { getFollowing } from '@/lib/firebase/firestore'
import { SUBJECTS, GRADES, GRADE_LABELS } from '@/types'
import type { Material } from '@/types'

const MATERIAL_TYPES = [
  { value: 'text', labelRu: 'Текст', labelKk: 'Мәтін' },
  { value: 'video', labelRu: 'Видео', labelKk: 'Видео' },
  { value: 'presentation', labelRu: 'Презентация', labelKk: 'Презентация' },
  { value: 'document', labelRu: 'Документ', labelKk: 'Құжат' },
  { value: 'audio', labelRu: 'Аудио', labelKk: 'Аудио' },
  { value: 'quiz', labelRu: 'Тест', labelKk: 'Тест' },
]

export default function FeedPage() {
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const [materials, setMaterials] = useState<Material[]>([])
  const [followingMaterials, setFollowingMaterials] = useState<Material[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [filterOpen, setFilterOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [selectedGrades, setSelectedGrades] = useState<number[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])

  const hasActiveFilters = (selectedSubject && selectedSubject !== 'all') || selectedGrades.length > 0 || selectedTypes.length > 0 || searchQuery.length > 0

  const toggleGrade = (grade: number) => {
    setSelectedGrades(prev =>
      prev.includes(grade)
        ? prev.filter(g => g !== grade)
        : [...prev, grade]
    )
  }

  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedSubject('')
    setSelectedGrades([])
    setSelectedTypes([])
  }

  const applyFilters = (items: Material[]) => {
    let filtered = items

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(m =>
        m.title.toLowerCase().includes(query) ||
        m.description.toLowerCase().includes(query) ||
        m.authorName.toLowerCase().includes(query) ||
        m.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }

    if (selectedSubject && selectedSubject !== 'all') {
      filtered = filtered.filter(m => m.subject === selectedSubject)
    }

    if (selectedGrades.length > 0) {
      filtered = filtered.filter(m =>
        m.grades?.some(g => selectedGrades.includes(g))
      )
    }

    if (selectedTypes.length > 0) {
      filtered = filtered.filter(m => selectedTypes.includes(m.type))
    }

    return filtered
  }

  const filteredMaterials = applyFilters(materials)
  const filteredFollowingMaterials = applyFilters(followingMaterials)
  const filteredPopularMaterials = applyFilters([...materials].sort((a, b) => b.stats.likes - a.stats.likes))

  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      setIsLoading(false)
      return
    }

    const q = query(
      collection(db, 'materials'),
      where('isPublic', '==', true),
      orderBy('createdAt', 'desc'),
      limit(100)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Material))
      setMaterials(data)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!user || !isFirebaseConfigured || !db) return

    const database = db

    const loadFollowingMaterials = async () => {
      try {
        const following = await getFollowing(user.id)
        if (following.length === 0) {
          setFollowingMaterials([])
          return
        }

        const q = query(
          collection(database, 'materials'),
          where('authorId', 'in', following.slice(0, 10)),
          where('isPublic', '==', true),
          orderBy('createdAt', 'desc'),
          limit(50)
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Material))
          setFollowingMaterials(data)
        })

        return () => unsubscribe()
      } catch (error) {
        console.error('Error loading following materials:', error)
      }
    }

    loadFollowingMaterials()
  }, [user])

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          <div className="w-16 h-16 rounded-full border-4 border-emerald-100 animate-spin border-t-emerald-500" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-emerald-500" />
          </div>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-gray-500"
        >
          {language === 'ru' ? 'Загрузка материалов...' : 'Материалдар жүктелуде...'}
        </motion.p>
      </div>
    )
  }

  const renderMaterialsGrid = (items: Material[], emptyIcon: React.ReactNode, emptyTitle: string, emptyHint?: string) => {
    if (items.length === 0) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20"
        >
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
            {emptyIcon}
          </div>
          <p className="text-xl font-semibold text-gray-900 mb-2">{emptyTitle}</p>
          {emptyHint && <p className="text-gray-500">{emptyHint}</p>}
        </motion.div>
      )
    }

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={viewMode === 'grid'
          ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-4'
        }
      >
        {items.map((material, index) => (
          <motion.div
            key={material.id || `material-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
          >
            <MaterialCard material={material} />
          </motion.div>
        ))}
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto py-8 px-4 lg:px-6">
        {/* Header */}
        <motion.div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
              <Home className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t.pages.feed.title}</h1>
              <p className="text-gray-500 text-sm">
                {language === 'ru' ? 'Материалы от педагогов колледжа' : 'Колледж педагогтарынан материалдар'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Search and filters bar */}
        <motion.div
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1 group">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                <Input
                  placeholder={language === 'ru' ? 'Поиск материалов...' : 'Материалдарды іздеу...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {/* Quick filters */}
            <div className="flex gap-2 flex-wrap items-center">
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-[160px] h-11 rounded-xl border-gray-200">
                  <SelectValue placeholder={language === 'ru' ? 'Предмет' : 'Пән'} />
                </SelectTrigger>
                <SelectContent className="rounded-xl max-h-[300px]">
                  <SelectItem value="all">{language === 'ru' ? 'Все предметы' : 'Барлық пәндер'}</SelectItem>
                  {SUBJECTS.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* More filters button */}
              <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="h-11 gap-2 rounded-xl border-gray-200 hover:border-emerald-300 hover:bg-emerald-50">
                    <Filter className="h-4 w-4" />
                    {language === 'ru' ? 'Ещё' : 'Тағы'}
                    {(selectedGrades.length + selectedTypes.length) > 0 && (
                      <span className="bg-emerald-500 text-white rounded-full px-2 py-0.5 text-xs font-medium">
                        {selectedGrades.length + selectedTypes.length}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="rounded-l-3xl">
                  <SheetHeader>
                    <SheetTitle className="text-xl">{language === 'ru' ? 'Фильтры' : 'Сүзгілер'}</SheetTitle>
                    <SheetDescription>
                      {language === 'ru' ? 'Настройте фильтры для поиска материалов' : 'Материалдарды іздеу үшін сүзгілерді баптаңыз'}
                    </SheetDescription>
                  </SheetHeader>

                  <div className="space-y-6 py-6">
                    {/* Grade filter */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-700">{language === 'ru' ? 'Курс' : 'Курс'}</Label>
                      <div className="flex flex-wrap gap-2">
                        {GRADES.map(grade => (
                          <Button
                            key={grade}
                            variant={selectedGrades.includes(grade) ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => toggleGrade(grade)}
                            className={`rounded-xl ${selectedGrades.includes(grade) ? 'bg-emerald-500 hover:bg-emerald-600' : 'border-gray-200'}`}
                          >
                            {GRADE_LABELS[grade]}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Type filter */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-700">{language === 'ru' ? 'Тип материала' : 'Материал түрі'}</Label>
                      <div className="space-y-2">
                        {MATERIAL_TYPES.map(type => (
                          <div key={type.value} className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                            <Checkbox
                              id={type.value}
                              checked={selectedTypes.includes(type.value)}
                              onCheckedChange={() => toggleType(type.value)}
                              className="border-gray-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                            />
                            <label htmlFor={type.value} className="text-sm cursor-pointer font-medium text-gray-700">
                              {language === 'ru' ? type.labelRu : type.labelKk}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <SheetFooter className="gap-2">
                    <Button variant="outline" onClick={clearFilters} className="rounded-xl">
                      {language === 'ru' ? 'Сбросить' : 'Тастау'}
                    </Button>
                    <SheetClose asChild>
                      <Button className="rounded-xl bg-emerald-500 hover:bg-emerald-600">
                        {language === 'ru' ? 'Применить' : 'Қолдану'}
                      </Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>

              {/* View toggle */}
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

              {/* Clear filters */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-gray-500 hover:text-gray-700 rounded-xl"
                >
                  <X className="h-4 w-4 mr-1" />
                  {language === 'ru' ? 'Сбросить' : 'Тастау'}
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white border border-gray-100 p-1 rounded-2xl mb-6 shadow-sm">
              <TabsTrigger
                value="all"
                className="rounded-xl data-[state=active]:bg-emerald-500 data-[state=active]:text-white px-4 sm:px-6 py-2.5 transition-all"
              >
                <Home className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{t.pages.feed.allMaterials}</span>
                <span className="sm:hidden">{language === 'ru' ? 'Все' : 'Барлық'}</span>
              </TabsTrigger>
              <TabsTrigger
                value="following"
                className="rounded-xl data-[state=active]:bg-emerald-500 data-[state=active]:text-white px-4 sm:px-6 py-2.5 transition-all"
              >
                <Users className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{t.pages.feed.following}</span>
                <span className="sm:hidden">{language === 'ru' ? 'Подписки' : 'Жазылым'}</span>
              </TabsTrigger>
              <TabsTrigger
                value="popular"
                className="rounded-xl data-[state=active]:bg-emerald-500 data-[state=active]:text-white px-4 sm:px-6 py-2.5 transition-all"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{t.pages.feed.popular}</span>
                <span className="sm:hidden">{language === 'ru' ? 'Топ' : 'Үздік'}</span>
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <TabsContent key="tab-all" value="all" className="mt-0">
                {renderMaterialsGrid(
                  filteredMaterials,
                  <Home className="h-10 w-10 text-gray-400" />,
                  hasActiveFilters
                    ? (language === 'ru' ? 'Материалы не найдены' : 'Материалдар табылмады')
                    : t.pages.feed.noMaterials,
                  hasActiveFilters
                    ? (language === 'ru' ? 'Попробуйте изменить фильтры' : 'Сүзгілерді өзгертіп көріңіз')
                    : undefined
                )}
              </TabsContent>

              <TabsContent key="tab-following" value="following" className="mt-0">
                {renderMaterialsGrid(
                  filteredFollowingMaterials,
                  <Users className="h-10 w-10 text-gray-400" />,
                  hasActiveFilters
                    ? (language === 'ru' ? 'Материалы не найдены' : 'Материалдар табылмады')
                    : t.pages.feed.noFollowing,
                  hasActiveFilters
                    ? (language === 'ru' ? 'Попробуйте изменить фильтры' : 'Сүзгілерді өзгертіп көріңіз')
                    : t.pages.feed.noFollowingHint
                )}
              </TabsContent>

              <TabsContent key="tab-popular" value="popular" className="mt-0">
                {renderMaterialsGrid(
                  filteredPopularMaterials,
                  <TrendingUp className="h-10 w-10 text-gray-400" />,
                  language === 'ru' ? 'Материалы не найдены' : 'Материалдар табылмады',
                  language === 'ru' ? 'Попробуйте изменить фильтры' : 'Сүзгілерді өзгертіп көріңіз'
                )}
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
