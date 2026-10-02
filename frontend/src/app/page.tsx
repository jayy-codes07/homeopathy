"use client"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Loading from '@/components/Loading'
import { useAppSelector } from '@/store/hooks'
import { selectAuthHydrated, selectToken } from '@/store/authSlice'

const Page = () => {
  const router = useRouter()
  const hydrated = useAppSelector(selectAuthHydrated)
  const token = useAppSelector(selectToken)

  useEffect(() => {
    // Wait for the persisted session to be read, then route by it.
    if (!hydrated) return
    router.replace(token ? '/dashboard' : '/login')
  }, [hydrated, token, router])

  return <div><Loading /></div>
}

export default Page
