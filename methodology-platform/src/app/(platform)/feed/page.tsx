'use client'

import { useState, useEffect } from 'react'
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '@/lib/firebase/config'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, X, Home, TrendingUp, Users, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
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
import type { Material } from '@/types'

const SUBJECTS = [
  'Математика',
  'Физика',
  'Химия',
  'Биология',
  'История',
  'География',
  'Информатика',
  'Русский язык',
  'Казахский язык',
  'Английский язык',
  'Литература',
]

const GRADES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

const MATERIAL_TYPES = [
  { value: 'lesson', labelRu: 'Урок', labelKk: 'Сабақ' },
  { value: 'test', labelRu: 'Тест', labelKk: 'Тест' },
  { value: 'presentation', labelRu: 'Презентация', labelKk: 'Презентация' },
  { value: 'document', labelRu: 'Документ', labelKk: 'Құжат' },
]

export default function FeedPage() {
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const [materials, setMaterials] = useState<Material[]>([])
  const [followingMaterials, setFollowingMaterials] = useState<Material[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [filterOpen, setFilterOpen] = useState(false)

  // Filter state
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [selectedGrades, setSelectedGrades] = useState<number[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])

  const hasActiveFilters = selectedSubject || selectedGrades.length > 0 || selectedTypes.length > 0

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
    setSelectedSubject('')
    setSelectedGrades([])
    setSelectedTypes([])
  }

  const applyFilters = (items: Material[]) => {
    let filtered = items

    if (selectedSubject) {
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

  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      setIsLoading(false)
      return
    }

    const q = query(
      collection(db, 'materials'),
      where('isPublic', '==', true),
      orderBy('createdAt', 'desc'),
      limit(50)
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
          limit(30)
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
          <Loader2 className="h-10 w-10 text-neutral-400 animate-spin" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-neutral-500"
        >
          {language === 'ru' ? 'Загрузка ленты...' : 'Лента жүктелуде...'}
        </motion.p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto py-8 px-4 lg:px-6">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-neutral-900">
              <Home className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">{t.pages.feed.title}</h1>
              <p className="text-neutral-500 text-sm">
                {language === 'ru' ? 'Свежие материалы от педагогов' : 'Педагогтардан жаңа материалдар'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-neutral-500 hover:text-neutral-900 rounded-xl"
                >
                  <X className="h-4 w-4 mr-1" />
                  {language === 'ru' ? 'Сбросить' : 'Тастау'}
                </Button>
              </motion.div>
            )}

            <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
              <SheetTrigger asChild>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="outline" size="sm" className="gap-2 rounded-xl border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50">
                    <Filter className="h-4 w-4" />
                    {t.pages.feed.filters}
                    {hasActiveFilters && (
                      <span className="ml-1 bg-neutral-900 text-white rounded-full px-2 py-0.5 text-xs font-medium">
                        {(selectedSubject ? 1 : 0) + selectedGrades.length + selectedTypes.length}
                      </span>
                    )}
                  </Button>
                </motion.div>
              </SheetTrigger>
              <SheetContent className="rounded-l-3xl border-neutral-200">
                <SheetHeader>
                  <SheetTitle className="text-xl font-semibold">{language === 'ru' ? 'Фильтры' : 'Сүзгілер'}</SheetTitle>
                  <SheetDescription>
                    {language === 'ru' ? 'Настройте фильтры для поиска материалов' : 'Материалдарды іздеу үшін сүзгілерді баптаңыз'}
                  </SheetDescription>
                </SheetHeader>

                <div className="space-y-6 py-6">
                  {/* Subject filter */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-neutral-700">{language === 'ru' ? 'Предмет' : 'Пән'}</Label>
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                      <SelectTrigger className="rounded-xl border-neutral-200">
                        <SelectValue placeholder={language === 'ru' ? 'Все предметы' : 'Барлық пәндер'} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="">{language === 'ru' ? 'Все предметы' : 'Барлық пәндер'}</SelectItem>
                        {SUBJECTS.map(subject => (
                          <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Grade filter */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-neutral-700">{language === 'ru' ? 'Классы' : 'Сыныптар'}</Label>
                    <div className="flex flex-wrap gap-2">
                      {GRADES.map(grade => (
                        <motion.div key={grade} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            variant={selectedGrades.includes(grade) ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => toggleGrade(grade)}
                            className={`w-10 h-10 rounded-xl ${selectedGrades.includes(grade) ? 'bg-neutral-900 hover:bg-neutral-800' : 'border-neutral-200 hover:border-neutral-300'}`}
                          >
                            {grade}
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Type filter */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-neutral-700">{language === 'ru' ? 'Тип материала' : 'Материал түрі'}</Label>
                    <div className="space-y-2">
                      {MATERIAL_TYPES.map(type => (
                        <div key={type.value} className="flex items-center space-x-3 p-2 rounded-xl hover:bg-neutral-50 transition-colors">
                          <Checkbox
                            id={type.value}
                            checked={selectedTypes.includes(type.value)}
                            onCheckedChange={() => toggleType(type.value)}
                            className="border-neutral-300 data-[state=checked]:bg-neutral-900 data-[state=checked]:border-neutral-900"
                          />
                          <label htmlFor={type.value} className="text-sm cursor-pointer font-medium text-neutral-700">
                            {language === 'ru' ? type.labelRu : type.labelKk}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <SheetFooter className="gap-2">
                  <Button variant="outline" onClick={clearFilters} className="rounded-xl border-neutral-200">
                    {language === 'ru' ? 'Сбросить' : 'Тастау'}
                  </Button>
                  <SheetClose asChild>
                    <Button className="rounded-xl bg-neutral-900 hover:bg-neutral-800">
                      {language === 'ru' ? 'Применить' : 'Қолдану'}
                    </Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-neutral-100 p-1 rounded-xl mb-8">
              <TabsTrigger
                value="all"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-sm px-5 py-2 transition-all"
              >
                <Home className="h-4 w-4 mr-2" />
                {t.pages.feed.allMaterials}
              </TabsTrigger>
              <TabsTrigger
                value="following"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-sm px-5 py-2 transition-all"
              >
                <Users className="h-4 w-4 mr-2" />
                {t.pages.feed.following}
              </TabsTrigger>
              <TabsTrigger
                value="popular"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-sm px-5 py-2 transition-all"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                {t.pages.feed.popular}
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <TabsContent value="all" className="mt-0">
                {filteredMaterials.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-20"
                  >
                    <div className="w-20 h-20 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-6">
                      <Home className="h-10 w-10 text-neutral-400" />
                    </div>
                    <p className="text-xl font-semibold text-neutral-900 mb-2">
                      {hasActiveFilters
                        ? (language === 'ru' ? 'Материалы не найдены' : 'Материалдар табылмады')
                        : t.pages.feed.noMaterials}
                    </p>
                    <p className="text-neutral-500">
                      {hasActiveFilters
                        ? (language === 'ru' ? 'Попробуйте изменить фильтры' : 'Сүзгілерді өзгертіп көріңіз')
                        : ''}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {filteredMaterials.map((material, index) => (
                      <motion.div
                        key={material.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <MaterialCard material={material} />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </TabsContent>

              <TabsContent value="following" className="mt-0">
                {filteredFollowingMaterials.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-20"
                  >
                    <div className="w-20 h-20 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-6">
                      <Users className="h-10 w-10 text-neutral-400" />
                    </div>
                    {hasActiveFilters ? (
                      <>
                        <p className="text-xl font-semibold text-neutral-900 mb-2">
                          {language === 'ru' ? 'Материалы не найдены' : 'Материалдар табылмады'}
                        </p>
                        <p className="text-neutral-500">
                          {language === 'ru' ? 'Попробуйте изменить фильтры' : 'Сүзгілерді өзгертіп көріңіз'}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-xl font-semibold text-neutral-900 mb-2">{t.pages.feed.noFollowing}</p>
                        <p className="text-neutral-500">{t.pages.feed.noFollowingHint}</p>
                      </>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {filteredFollowingMaterials.map((material, index) => (
                      <motion.div
                        key={material.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <MaterialCard material={material} />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </TabsContent>

              <TabsContent value="popular" className="mt-0">
                {applyFilters([...materials].sort((a, b) => b.stats.likes - a.stats.likes)).length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-20"
                  >
                    <div className="w-20 h-20 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-6">
                      <TrendingUp className="h-10 w-10 text-neutral-400" />
                    </div>
                    <p className="text-xl font-semibold text-neutral-900 mb-2">
                      {language === 'ru' ? 'Материалы не найдены' : 'Материалдар табылмады'}
                    </p>
                    <p className="text-neutral-500">
                      {language === 'ru' ? 'Попробуйте изменить фильтры' : 'Сүзгілерді өзгертіп көріңіз'}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {applyFilters([...materials].sort((a, b) => b.stats.likes - a.stats.likes)).map((material, index) => (
                      <motion.div
                        key={material.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <MaterialCard material={material} />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
