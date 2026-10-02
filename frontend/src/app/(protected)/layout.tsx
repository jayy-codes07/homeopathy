import Navbar from "@/components/Navbar"
import AuthGate from "@/components/AuthGate"

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Navbar />
      <AuthGate>{children}</AuthGate>
    </div>
  )
}
