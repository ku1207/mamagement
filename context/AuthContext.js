import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// 사용자 역할 정의
export const ROLES = {
  ADMIN: 'admin',
  MARKETER: 'marketer'
}



// 모의 사용자 데이터 (실제 환경에서는 데이터베이스를 사용)
const mockUsers = [
  {
    id: 1,
    email: 'admin@example.com',
    password: 'password123',
    name: '관리자',
    phone: '010-1234-5678',
    role: ROLES.ADMIN,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    email: 'marketer@example.com',
    password: 'password123',
    name: '마케터',
    phone: '010-3456-7890',
    role: ROLES.MARKETER,
    advertisers: [1, 2, 3], // 접근 가능한 광고주 ID 목록
    createdAt: new Date().toISOString()
  }
]

// 모의 광고주 데이터 (오름차순으로 정렬)
const mockAdvertisers = [
  {
    id: 1,
    name: 'A광고주',
    business: '전자제품',
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    name: 'B광고주',
    business: '화장품',
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    name: 'C광고주',
    business: '의류',
    createdAt: new Date().toISOString()
  },
  {
    id: 4,
    name: 'D광고주',
    business: '음식',
    createdAt: new Date().toISOString()
  },
  {
    id: 5,
    name: 'E광고주',
    business: '자동차',
    createdAt: new Date().toISOString()
  }
]

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [advertisers, setAdvertisers] = useState(mockAdvertisers)
  const [users, setUsers] = useState(mockUsers)
  const [selectedAdvertiser, setSelectedAdvertiser] = useState(null)

  // 초기 로그인 상태 확인
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const userData = JSON.parse(atob(token.split('.')[1]))
        const foundUser = mockUsers.find(u => u.id === userData.id)
        if (foundUser) {
          setUser(foundUser)
          // 첫 번째 접근 가능한 광고주를 기본 선택
          const accessibleAds = getAccessibleAdvertisersForUser(foundUser)
          if (accessibleAds.length > 0) {
            setSelectedAdvertiser(accessibleAds[0])
          }
        }
      } catch (error) {
        localStorage.removeItem('token')
      }
    }
    setLoading(false)
  }, [])

  // 특정 사용자가 접근 가능한 광고주 목록 가져오기
  const getAccessibleAdvertisersForUser = (userObj) => {
    if (!userObj) return []
    
    if (userObj.role === ROLES.ADMIN) {
      return advertisers.sort((a, b) => a.name.localeCompare(b.name))
    }
    
    if (userObj.role === ROLES.MARKETER && userObj.advertisers) {
      return advertisers
        .filter(adv => userObj.advertisers.includes(adv.id))
        .sort((a, b) => a.name.localeCompare(b.name))
    }
    
    return []
  }

  // 로그인
  const login = async (email, password) => {
    try {
      const foundUser = mockUsers.find(
        u => u.email === email && u.password === password
      )
      
      if (foundUser) {
        // 간단한 JWT 토큰 생성 (실제 환경에서는 서버에서 처리)
        const token = btoa(JSON.stringify({ id: foundUser.id, role: foundUser.role }))
        localStorage.setItem('token', token)
        setUser(foundUser)
        
        // 첫 번째 접근 가능한 광고주를 기본 선택
        const accessibleAds = getAccessibleAdvertisersForUser(foundUser)
        if (accessibleAds.length > 0) {
          setSelectedAdvertiser(accessibleAds[0])
        }
        
        return { success: true, user: foundUser }
      } else {
        return { success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' }
      }
    } catch (error) {
      return { success: false, error: '로그인 중 오류가 발생했습니다.' }
    }
  }

  // 로그아웃
  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setSelectedAdvertiser(null)
  }

  // 회원가입
  const register = async (userData) => {
    try {
      const existingUser = mockUsers.find(u => u.email === userData.email)
      if (existingUser) {
        return { success: false, error: '이미 존재하는 이메일입니다.' }
      }

      const newUser = {
        id: mockUsers.length + 1,
        ...userData,
        createdAt: new Date().toISOString()
      }
      
      mockUsers.push(newUser)
      setUsers([...mockUsers])
      
      return { success: true, user: newUser }
    } catch (error) {
      return { success: false, error: '회원가입 중 오류가 발생했습니다.' }
    }
  }

  // 권한 확인
  const hasPermission = (requiredRole) => {
    if (!user) return false
    
    const roleHierarchy = {
      [ROLES.ADMIN]: 2,
      [ROLES.MARKETER]: 1
    }
    
    return roleHierarchy[user.role] >= roleHierarchy[requiredRole]
  }

  // 광고주 접근 권한 확인
  const canAccessAdvertiser = (advertiserId) => {
    if (!user) return false
    
    if (user.role === ROLES.ADMIN) {
      return true
    }
    
    if (user.role === ROLES.MARKETER) {
      return user.advertisers && user.advertisers.includes(advertiserId)
    }
    
    return false
  }

  // 사용자가 접근 가능한 광고주 목록 가져오기
  const getAccessibleAdvertisers = () => {
    return getAccessibleAdvertisersForUser(user)
  }



  // 사용자 정보 업데이트
  const updateUserInfo = (updatedInfo) => {
    if (!user) return false
    
    // 현재 사용자 정보 업데이트
    const updatedUser = {
      ...user,
      ...updatedInfo,
      updatedAt: new Date().toISOString()
    }
    
    // 로컬 상태 업데이트
    setUser(updatedUser)
    
    // mockUsers 배열에서도 업데이트
    const userIndex = mockUsers.findIndex(u => u.id === user.id)
    if (userIndex !== -1) {
      mockUsers[userIndex] = updatedUser
      setUsers([...mockUsers])
    }
    
    // 로컬 스토리지의 토큰도 업데이트
    const token = btoa(JSON.stringify({ id: updatedUser.id, role: updatedUser.role }))
    localStorage.setItem('token', token)
    
    return true
  }

  const value = {
    user,
    users,
    advertisers,
    selectedAdvertiser,
    loading,
    login,
    logout,
    register,
    hasPermission,
    canAccessAdvertiser,
    getAccessibleAdvertisers,
    updateUserInfo,
    setAdvertisers,
    setUsers,
    setSelectedAdvertiser,
    ROLES
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 