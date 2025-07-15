import React from 'react'
import { useAuth } from '../context/AuthContext'
import DashboardContainer from '../components/Dashboard/DashboardContainer'
import SuperAdminDashboard from '../components/Dashboard/SuperAdminDashboard'

export default function DashboardContent() {
  const { user } = useAuth()
  
  // 관리자는 별도 대시보드 표시
  if (user?.role === 'admin') {
    return (
      <div className="content-area">
        <SuperAdminDashboard />
      </div>
    )
  }
  
  // 마케터는 기존 대시보드 표시
  if (user?.role === 'marketer') {
    return (
      <div className="content-area">
        <DashboardContainer />
      </div>
    )
  }
  
  // 권한이 없는 경우
  return (
    <div className="content-area">
      <div className="unauthorized-message">
        <h2>접근 권한이 없습니다</h2>
        <p>대시보드에 접근할 수 있는 권한이 없습니다.</p>
      </div>
    </div>
  )
} 