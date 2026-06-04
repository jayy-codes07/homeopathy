import Navbar from "@/components/Navbar"

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Navbar />
      {children}
    </div>
  )
}