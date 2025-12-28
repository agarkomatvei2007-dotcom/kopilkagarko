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
import { FeedSkeleton } from '@/components/shared/Skeletons'
import { EmptyState } from '@/components/shared/EmptyState'
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
      <div className="min-h-screen bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto py-8 px-4 lg:px-6">
          {/* Header skeleton */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
              <Home className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="h-8 w-48 bg-muted rounded-lg animate-pulse mb-2" />
              <div className="h-4 w-64 bg-muted rounded animate-pulse" />
            </div>
          </div>
          {/* Filter bar skeleton */}
          <div className="bg-card rounded-2xl border border-border shadow-sm p-4 mb-6">
            <div className="flex gap-4">
              <div className="flex-1 h-11 bg-muted rounded-xl animate-pulse" />
              <div className="h-11 w-40 bg-muted rounded-xl animate-pulse" />
              <div className="h-11 w-24 bg-muted rounded-xl animate-pulse" />
            </div>
          </div>
          {/* Materials grid skeleton */}
          <FeedSkeleton count={6} />
        </div>
      </div>
    )
  }

  const renderMaterialsGrid = (items: Material[], preset: 'materials' | 'following' | 'search', isFiltered: boolean = false) => {
    if (items.length === 0) {
      return (
        <EmptyState
          preset={isFiltered ? 'search' : preset}
          action={isFiltered ? {
            label: language === 'ru' ? 'Сбросить фильтры' : 'Сүзгілерді тастау',
            onClick: clearFilters,
          } : undefined}
        />
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
    <div className="min-h-screen bg-gradient-to-b from-muted/50 to-background">
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
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t.pages.feed.title}</h1>
              <p className="text-muted-foreground text-sm">
                {language === 'ru' ? 'Материалы от педагогов колледжа' : 'Колледж педагогтарынан материалдар'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Search and filters bar */}
        <motion.div
          className="bg-card rounded-2xl border border-border shadow-sm p-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1 group">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder={language === 'ru' ? 'Поиск материалов...' : 'Материалдарды іздеу...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 rounded-xl border-input focus:border-primary focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Quick filters */}
            <div className="flex gap-2 flex-wrap items-center">
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-[160px] h-11 rounded-xl border-input">
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
                  <Button variant="outline" size="sm" className="h-11 gap-2 rounded-xl border-input hover:border-primary hover:bg-primary/10">
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
                      <Label className="text-sm font-semibold text-foreground">{language === 'ru' ? 'Курс' : 'Курс'}</Label>
                      <div className="flex flex-wrap gap-2">
                        {GRADES.map(grade => (
                          <Button
                            key={grade}
                            variant={selectedGrades.includes(grade) ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => toggleGrade(grade)}
                            className={`rounded-xl ${selectedGrades.includes(grade) ? 'bg-primary hover:bg-primary/90' : 'border-input'}`}
                          >
                            {GRADE_LABELS[grade]}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Type filter */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-foreground">{language === 'ru' ? 'Тип материала' : 'Материал түрі'}</Label>
                      <div className="space-y-2">
                        {MATERIAL_TYPES.map(type => (
                          <div key={type.value} className="flex items-center space-x-3 p-2 rounded-xl hover:bg-muted transition-colors">
                            <Checkbox
                              id={type.value}
                              checked={selectedTypes.includes(type.value)}
                              onCheckedChange={() => toggleType(type.value)}
                              className="border-input data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <label htmlFor={type.value} className="text-sm cursor-pointer font-medium text-foreground">
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
                      <Button className="rounded-xl bg-primary hover:bg-primary/90">
                        {language === 'ru' ? 'Применить' : 'Қолдану'}
                      </Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>

              {/* View toggle */}
              <div className="flex border border-input rounded-xl overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className={`h-11 w-11 rounded-none ${viewMode === 'grid' ? 'bg-primary hover:bg-primary/90' : ''}`}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className={`h-11 w-11 rounded-none ${viewMode === 'list' ? 'bg-primary hover:bg-primary/90' : ''}`}
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
                  className="text-muted-foreground hover:text-foreground rounded-xl"
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
            <TabsList className="bg-card border border-border p-1 rounded-2xl mb-6 shadow-sm">
              <TabsTrigger
                value="all"
                className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 sm:px-6 py-2.5 transition-all"
              >
                <Home className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{t.pages.feed.allMaterials}</span>
                <span className="sm:hidden">{language === 'ru' ? 'Все' : 'Барлық'}</span>
              </TabsTrigger>
              <TabsTrigger
                value="following"
                className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 sm:px-6 py-2.5 transition-all"
              >
                <Users className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{t.pages.feed.following}</span>
                <span className="sm:hidden">{language === 'ru' ? 'Подписки' : 'Жазылым'}</span>
              </TabsTrigger>
              <TabsTrigger
                value="popular"
                className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 sm:px-6 py-2.5 transition-all"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{t.pages.feed.popular}</span>
                <span className="sm:hidden">{language === 'ru' ? 'Топ' : 'Үздік'}</span>
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <TabsContent key="tab-all" value="all" className="mt-0">
                {renderMaterialsGrid(filteredMaterials, 'materials', hasActiveFilters)}
              </TabsContent>

              <TabsContent key="tab-following" value="following" className="mt-0">
                {renderMaterialsGrid(filteredFollowingMaterials, 'following', hasActiveFilters)}
              </TabsContent>

              <TabsContent key="tab-popular" value="popular" className="mt-0">
                {renderMaterialsGrid(filteredPopularMaterials, 'materials', hasActiveFilters)}
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
