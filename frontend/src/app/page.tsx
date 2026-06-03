"use client"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Loading from '@/components/Loading'

const Page = () => {
  const router = useRouter()

  useEffect(() => {
    // if token exists → go to dashboard
    // if no token → go to login

    if (localStorage.getItem("doctorJWT")) {
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
    router.push('/dashboard')

  }, [])

  return <div><Loading /></div>
}

export default Page