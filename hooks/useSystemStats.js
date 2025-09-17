// 시스템 통계 관리 훅

import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

export const useSystemStats = (dateRange) => {
  const { users, advertisers } = useAuth()
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalAdvertisers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    monthlyGrowth: 0
  })

  useEffect(() => {
    // 시스템 통계 계산
    const totalUsers = users.length
    const totalAdvertisers = advertisers.length
    const activeUsers = users.filter(user => 
      user.role === 'admin' || user.role === 'marketer'
    ).length
    
    // 모의 데이터 (선택된 기간에 따라 조정)
    const daysDiff = Math.ceil((dateRange.endDate - dateRange.startDate) / (1000 * 60 * 60 * 24))
    const baseRevenue = Math.floor(Math.random() * 100000000) + 50000000
    const totalRevenue = Math.floor(baseRevenue * (daysDiff / 30)) // 30일 기준으로 조정
    const monthlyGrowth = Math.floor(Math.random() * 20) + 5

    setSystemStats({
      totalUsers,
      totalAdvertisers,
      activeUsers,
      totalRevenue,
      monthlyGrowth
    })
  }, [users, advertisers, dateRange])

  return systemStats
}

export default useSystemStats