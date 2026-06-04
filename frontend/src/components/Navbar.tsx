"use client"

import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const Navbar = () => {
    const [username, setUsername] = useState<string>('User')
    const router = useRouter()
    const logout = () => {
        localStorage.removeItem('doctorJWT')
        router.push('/login')
    }

    useEffect(() => {

        const name = localStorage.getItem("username")
        setUsername(name || "User")

    }, [])

    return (<nav className="">
        <div className="bg-zinc-800 px-8 py-5 flex justify-between items-center">

            <div>
                <h1 className="text-2xl font-bold text-white">
                    <img
                        src="/doctor-medical-mk-seeklogo.jpg"
                        alt=""
                        className="h-15 bg-amber-50 w-auto"
                    />
                </h1>


            </div>

            <div className="flex items-center gap-4">

                <div className="w-12 h-12 rounded-full bg-blue-900 text-blue-400 flex items-center justify-center text-lg font-bold">
                    {username?.charAt(0).toUpperCase()}
                </div>

                <div>
                    <div className="text-xs uppercase tracking-wider text-zinc-500">
                        User
                    </div>
                    <div className="text-white font-semibold">
                        {username}
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="bg-blue-900/40 border border-blue-700 text-blue-400 px-4 py-2 rounded-xl hover:bg-blue-900/70 transition"
                >
                    Logout
                </button>

            </div>
        </div>
    </nav>)
}

export default Navbar