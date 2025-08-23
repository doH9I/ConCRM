import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from '../services/api'

interface User {
  id: number
  email: string
  first_name?: string
  last_name?: string
  phone?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  isLoading: boolean
}

interface RegisterData {
  email: string
  password: string
  first_name?: string
  last_name?: string
  phone?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token')
      if (storedToken) {
        try {
          // Verify token with backend
          const response = await api.get('/user/verify-token', {
            headers: { Authorization: `Bearer ${storedToken}` }
          })
          
          if (response.data.success) {
            setUser(response.data.data.user)
            setToken(storedToken)
            api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
          } else {
            // Token is invalid, remove it
            localStorage.removeItem('token')
            setToken(null)
            setUser(null)
          }
        } catch (error) {
          console.error('Token verification failed:', error)
          localStorage.removeItem('token')
          setToken(null)
          setUser(null)
        }
      }
      setIsLoading(false)
    }

    initializeAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/user/login', { email, password })
      
      if (response.data.success) {
        const { user: userData, token: newToken } = response.data.data
        setUser(userData)
        setToken(newToken)
        localStorage.setItem('token', newToken)
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
      } else {
        throw new Error(response.data.error?.message || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const register = async (userData: RegisterData) => {
    try {
      const response = await api.post('/user/register', userData)
      
      if (response.data.success) {
        const { user: newUser, token: newToken } = response.data.data
        setUser(newUser)
        setToken(newToken)
        localStorage.setItem('token', newToken)
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
      } else {
        throw new Error(response.data.error?.message || 'Registration failed')
      }
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
  }

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isLoading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}