'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/app/components/header'
import ClientWrapper from '../components/ClientWrapper'
import { supabase } from '../supabaseClient' // Adjust the import path as needed

export default function Home() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem(process.env.NEXT_PUBLIC_TOKEN_ID || '')
      const userData = localStorage.getItem('user_data')
      setIsLoggedIn(!!token && !!userData)
    }

    checkLoginStatus()
  }, [])

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      localStorage.removeItem(process.env.NEXT_PUBLIC_TOKEN_ID || '')
      localStorage.removeItem('user_data')
      setIsLoggedIn(false)
      router.push('/login')
    } else {
      console.error('Error during sign out:', error)
    }
  }

  if (!isLoggedIn) {
    return null // Or a loading spinner
  }

  return (
    <main className="h-screen w-screen flex justify-center items-center background-gradient">
      <div className="absolute top-4 right-4">
        <button
          onClick={handleLogout}
          className="text-black px-4 py-2 rounded font-sans font-bold"
        >
          Logout
        </button>
      </div>
      <div className="space-y-2 lg:space-y-10 w-[90%] lg:w-[60rem]">
        <Header />
        <div className="h-[65vh] flex">
          <ClientWrapper />
        </div>
      </div>
    </main>
  )
}