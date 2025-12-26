'use client'

import { useState, useEffect } from 'react'
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '@/lib/firebase/config'
import { Loader2, Filter, X } from 'lucide-react'

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
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t.pages.feed.title}</h1>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              {language === 'ru' ? 'Сбросить' : 'Тастау'}
            </Button>
          )}
          <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                {t.pages.feed.filters}
                {hasActiveFilters && (
                  <span className="ml-1 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                    {(selectedSubject ? 1 : 0) + selectedGrades.length + selectedTypes.length}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>{language === 'ru' ? 'Фильтры' : 'Сүзгілер'}</SheetTitle>
                <SheetDescription>
                  {language === 'ru' ? 'Настройте фильтры для поиска материалов' : 'Материалдарды іздеу үшін сүзгілерді баптаңыз'}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 py-6">
                {/* Subject filter */}
                <div className="space-y-2">
                  <Label>{language === 'ru' ? 'Предмет' : 'Пән'}</Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder={language === 'ru' ? 'Все предметы' : 'Барлық пәндер'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">{language === 'ru' ? 'Все предметы' : 'Барлық пәндер'}</SelectItem>
                      {SUBJECTS.map(subject => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Grade filter */}
                <div className="space-y-2">
                  <Label>{language === 'ru' ? 'Классы' : 'Сыныптар'}</Label>
                  <div className="flex flex-wrap gap-2">
                    {GRADES.map(grade => (
                      <Button
                        key={grade}
                        variant={selectedGrades.includes(grade) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleGrade(grade)}
                        className="w-10 h-10"
                      >
                        {grade}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Type filter */}
                <div className="space-y-2">
                  <Label>{language === 'ru' ? 'Тип материала' : 'Материал түрі'}</Label>
                  <div className="space-y-2">
                    {MATERIAL_TYPES.map(type => (
                      <div key={type.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={type.value}
                          checked={selectedTypes.includes(type.value)}
                          onCheckedChange={() => toggleType(type.value)}
                        />
                        <label htmlFor={type.value} className="text-sm cursor-pointer">
                          {language === 'ru' ? type.labelRu : type.labelKk}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <SheetFooter>
                <Button variant="outline" onClick={clearFilters}>
                  {language === 'ru' ? 'Сбросить' : 'Тастау'}
                </Button>
                <SheetClose asChild>
                  <Button>{language === 'ru' ? 'Применить' : 'Қолдану'}</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">{t.pages.feed.allMaterials}</TabsTrigger>
          <TabsTrigger value="following">{t.pages.feed.following}</TabsTrigger>
          <TabsTrigger value="popular">{t.pages.feed.popular}</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {filteredMaterials.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {hasActiveFilters
                ? (language === 'ru' ? 'Материалы не найдены. Попробуйте изменить фильтры.' : 'Материалдар табылмады. Сүзгілерді өзгертіп көріңіз.')
                : t.pages.feed.noMaterials}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMaterials.map((material) => (
                <MaterialCard key={material.id} material={material} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="following">
          {filteredFollowingMaterials.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {hasActiveFilters ? (
                <p>{language === 'ru' ? 'Материалы не найдены. Попробуйте изменить фильтры.' : 'Материалдар табылмады. Сүзгілерді өзгертіп көріңіз.'}</p>
              ) : (
                <>
                  <p className="mb-2">{t.pages.feed.noFollowing}</p>
                  <p className="text-sm">{t.pages.feed.noFollowingHint}</p>
                </>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFollowingMaterials.map((material) => (
                <MaterialCard key={material.id} material={material} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="popular">
          {applyFilters([...materials].sort((a, b) => b.stats.likes - a.stats.likes)).length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {language === 'ru' ? 'Материалы не найдены. Попробуйте изменить фильтры.' : 'Материалдар табылмады. Сүзгілерді өзгертіп көріңіз.'}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {applyFilters([...materials].sort((a, b) => b.stats.likes - a.stats.likes)).map((material) => (
                <MaterialCard key={material.id} material={material} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
