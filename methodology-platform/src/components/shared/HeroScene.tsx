'use client'

import { Suspense, lazy, useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Lightbulb, GraduationCap } from 'lucide-react'

const Spline = lazy(() => import('@splinetool/react-spline'))

// Fallback scene with animated geometric shapes
function FallbackScene() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Central book */}
      <motion.div
        className="absolute w-24 h-28 bg-emerald-600 rounded-lg shadow-lg flex items-center justify-center"
        animate={{ y: [0, -12, 0], rotateZ: [-2, 2, -2] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <BookOpen className="h-10 w-10 text-white" />
      </motion.div>

      {/* Floating circle - top right */}
      <motion.div
        className="absolute top-[15%] right-[20%] w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shadow-md"
        animate={{ y: [0, -16, 0], x: [0, 8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      >
        <Lightbulb className="h-7 w-7 text-amber-600 dark:text-amber-400" />
      </motion.div>

      {/* Floating square - bottom left */}
      <motion.div
        className="absolute bottom-[20%] left-[15%] w-14 h-14 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shadow-md"
        animate={{ y: [0, 10, 0], x: [0, -6, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      >
        <GraduationCap className="h-6 w-6 text-emerald-700 dark:text-emerald-400" />
      </motion.div>

      {/* Decorative dots */}
      <motion.div
        className="absolute top-[30%] left-[30%] w-3 h-3 rounded-full bg-emerald-300 dark:bg-emerald-700"
        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[35%] right-[25%] w-2 h-2 rounded-full bg-stone-300 dark:bg-stone-600"
        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
      />
      <motion.div
        className="absolute top-[55%] right-[35%] w-2.5 h-2.5 rounded-full bg-amber-200 dark:bg-amber-800"
        animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
      />

      {/* Ring decoration */}
      <motion.div
        className="absolute w-40 h-40 rounded-full border-2 border-dashed border-stone-200 dark:border-stone-700"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute w-56 h-56 rounded-full border border-stone-100 dark:border-stone-800"
        animate={{ rotate: -360 }}
        transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  )
}

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-32 h-32 rounded-2xl bg-muted animate-pulse" />
    </div>
  )
}

export default function HeroScene() {
  const [splineError, setSplineError] = useState(false)

  // Use the fallback scene (Spline requires a custom scene URL)
  // To use Spline: replace FallbackScene with Spline component and provide your scene URL
  const useSpline = false

  if (!useSpline || splineError) {
    return <FallbackScene />
  }

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <Spline
        scene="https://prod.spline.design/placeholder/scene.splinecode"
        onError={() => setSplineError(true)}
        style={{ width: '100%', height: '100%' }}
      />
    </Suspense>
  )
}
