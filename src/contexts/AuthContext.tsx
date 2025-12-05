import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import {
  apiLogin,
  apiRegister,
  apiMe,
  apiLogout,
  type AuthSession,
  type BackendUser,
} from "@/services/auth/authService"

export interface User {
  id: string
  studentId: string
  name: string
  email: string
  initials: string
  avatar?: string
  academicYear?: string
  facultyCode?: string
}

interface AuthContextType {
  user: User | null
  accessToken: string | null
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<AuthSession | null>(null)
  const navigate = useNavigate()

  const buildUserFromBackend = (backendUser: BackendUser): User => {
    const email = backendUser.email
    const nameFromBackend =
      // Prefer the nickname/username stored in user_metadata,
      // then fall back to top-level username, then email prefix.
      (backendUser.user_metadata as any)?.username ||
      backendUser.username ||
      backendUser.user_metadata?.full_name ||
      email?.split("@")[0] ||
      "Student"

    const studentCodeBackend =
      backendUser.student_code ||
      backendUser.user_metadata?.student_code ||
      email?.split("@")[0] ||
      ""

    const academicYear =
      (backendUser.user_metadata as any)?.academic_year || undefined

    const facultyCode =
      (backendUser.user_metadata as any)?.faculty_code || undefined

    const initials =
      nameFromBackend
        .split(" ")
        .filter(Boolean)
        .map((p: string) => p.charAt(0).toUpperCase())
        .join("")
        .slice(0, 2) || "U"

    const avatar = backendUser.user_metadata?.avatar_url

    return {
      id: backendUser.id,
      email,
      name: nameFromBackend,
      studentId: studentCodeBackend,
      initials,
      avatar,
      academicYear,
      facultyCode,
    }
  }

  // Load user & session from localStorage on mount and verify via /me if possible
  useEffect(() => {
    const storedUser = localStorage.getItem("unicircle_user")
    const storedSession = localStorage.getItem("unicircle_session")

    let parsedUser: User | null = null
    let parsedSession: AuthSession | null = null

    if (storedUser) {
      try {
        parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
      } catch {
        localStorage.removeItem("unicircle_user")
      }
    }

    if (storedSession) {
      try {
        parsedSession = JSON.parse(storedSession)
        setSession(parsedSession)
      } catch {
        localStorage.removeItem("unicircle_session")
      }
    }

    // Optionally validate token with backend
    const validate = async () => {
      if (!parsedSession?.access_token) return
      try {
        const me = await apiMe(parsedSession.access_token)
        const mapped = buildUserFromBackend(me.user)
        setUser(mapped)
        localStorage.setItem("unicircle_user", JSON.stringify(mapped))
      } catch (err) {
        console.error("Failed to validate session, clearing auth:", err)
        setUser(null)
        setSession(null)
        localStorage.removeItem("unicircle_user")
        localStorage.removeItem("unicircle_session")
      }
    }

    // Fire and forget
    void validate()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await apiLogin(email, password)
      const mappedUser = buildUserFromBackend(result.user)

      setUser(mappedUser)
      setSession(result.session)
      localStorage.setItem("unicircle_user", JSON.stringify(mappedUser))
      localStorage.setItem("unicircle_session", JSON.stringify(result.session))

    return true
    } catch (error) {
      console.error("Login failed:", error)
      return false
    }
  }

  const register = async (
    name: string,
    email: string,
    password: string,
  ): Promise<boolean> => {
    try {
      // Use real backend register; backend derives student code from email.
      await apiRegister(name, email, password)

      // After successful registration, log the user in to obtain tokens & user data.
      const loggedIn = await login(email, password)
      return loggedIn
    } catch (error) {
      console.error("Register failed:", error)
      return false
    }
  }

  const logout = () => {
    const accessToken = session?.access_token

    setUser(null)
    setSession(null)
    localStorage.removeItem("unicircle_user")
    localStorage.removeItem("unicircle_session")

    if (accessToken) {
      // best-effort; don't await to avoid blocking UX
      void apiLogout(accessToken)
    }

    navigate("/auth")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken: session?.access_token ?? null,
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

