import { redirect } from 'next/navigation'

// Redirect explore to feed - pages have been merged
export default function ExplorePage() {
  redirect('/feed')
}
