"use client"

import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const Navbar = () => {
    const [username, setUsername] = useState<string>('User')
    const router = useRouter()
    const logout = () => {
        const confirmed = confirm("Are you sure you want to logout?")
        if (!confirmed) return
        localStorage.removeItem('doctorJWT')
        router.push('/login')
    }

    useEffect(() => {

        const name = localStorage.getItem("username")
        setUsername(name || "User")

    }, [])

    return (
        <nav className="bg-[var(--color-surface-container-lowest)] border-b border-[var(--color-outline-variant)]/40">
            <div className="px-6 md:px-8 py-3 flex justify-between items-center">

                <img
                    src="/doctor-medical-mk-seeklogo.png"
                    alt="Clinic logo"
                    className="h-10 w-auto"
                />

                <div className="flex items-center gap-4">

                    <div className="w-10 h-10 rounded-full bg-[color:var(--color-primary-container)]/30 text-[var(--color-on-primary-container)] flex items-center justify-center text-base font-bold flex-shrink-0">
                        {username?.charAt(0).toUpperCase()}
                    </div>

                    <div className="hidden sm:block">
                        <div className="text-[10px] uppercase tracking-wider text-[var(--color-on-surface-variant)] leading-none mb-0.5">
                            Doctor
                        </div>
                        <div className="text-[var(--color-on-surface)] font-semibold text-sm">
                            {username}
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="flex items-center gap-1.5 border border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] px-4 py-2 rounded-xl hover:bg-[var(--color-surface-container-low)] hover:text-[var(--color-on-surface)] transition-all duration-200 text-sm font-medium"
                    >
                        <span className="material-symbols-outlined text-base">logout</span>
                        Logout
                    </button>

                </div>
            </div>
        </nav>
    )
}

export default Navbar