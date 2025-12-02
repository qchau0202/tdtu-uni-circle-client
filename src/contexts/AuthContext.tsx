import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useNavigate } from "react-router-dom"

export interface User {
  id: string
  studentId: string
  name: string
  email: string
  initials: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, studentId: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const navigate = useNavigate()

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("unicircle_user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        localStorage.removeItem("unicircle_user")
      }
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock login - in real app, this would call an API
    // For demo, we'll create a user from email
    const studentId = email.split("@")[0] || "unknown"
    const nameParts = email.split("@")[0].split(".") || ["User"]
    const name = nameParts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ") || "User"
    const initials = nameParts
      .map((p) => p.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2) || "U"

    const newUser: User = {
      id: `user-${Date.now()}`,
      studentId,
      name,
      email,
      initials,
    }

    setUser(newUser)
    localStorage.setItem("unicircle_user", JSON.stringify(newUser))
    return true
  }

  const register = async (
    name: string,
    email: string,
    studentId: string,
    password: string,
  ): Promise<boolean> => {
    // Mock register
    const nameParts = name.split(" ") || [name]
    const initials = nameParts
      .map((p) => p.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2) || "U"

    const newUser: User = {
      id: `user-${Date.now()}`,
      studentId,
      name,
      email,
      initials,
    }

    setUser(newUser)
    localStorage.setItem("unicircle_user", JSON.stringify(newUser))
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("unicircle_user")
    navigate("/auth")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

