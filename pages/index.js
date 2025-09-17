import Layout from '../components/Layout'
import ProtectedRoute from '../components/ProtectedRoute'
import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/router'
import DashboardContent from '../components/Pages/DashboardContent.js'
import DailyDataContent from '../components/Pages/DailyDataContent.js'
import MediaContent from '../components/Pages/MediaContent.js'
import KeywordDataContent from '../pages/keyword-data.js'
import KeywordManagementContent from '../pages/keyword-management.js'

export default function Home() {
  const router = useRouter()
  const { user, selectedAdvertiser, advertisers, setSelectedAdvertiser } = useAuth()
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // 인증 확인
  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  // 사이드바 토글
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  // 페이지 변경 핸들러
  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  // 광고주 변경 핸들러
  const handleAdvertiserChange = (advertiserId) => {
    const advertiser = advertisers.find(a => a.id === advertiserId)
    setSelectedAdvertiser(advertiser)
  }

  // 페이지별 컨텐츠 렌더링
  const renderPageContent = () => {
    switch(currentPage) {
      case 'dashboard':
        return <DashboardContent />
      case 'daily-data':
        return <DailyDataContent />
      case 'keyword-data':
        return <KeywordDataContent />
      case 'keyword-management':
        return <KeywordManagementContent />
      case 'google':
        return <MediaContent media="구글" />
      case 'facebook':
        return <MediaContent media="페이스북" />
      case 'tiktok':
        return <MediaContent media="틱톡" />
      default:
        return <DashboardContent />
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <ProtectedRoute>
      <Layout
        user={user}
        selectedAdvertiser={selectedAdvertiser}
        advertisers={advertisers}
        onAdvertiserChange={handleAdvertiserChange}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onPageChange={handlePageChange}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={toggleSidebar}
      >
        {renderPageContent()}
      </Layout>
    </ProtectedRoute>
  )
}