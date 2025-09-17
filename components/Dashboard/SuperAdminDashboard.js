// Super Admin 대시보드 (모듈화된 버전)

import React, { useState } from 'react'
import useSystemStats from '../../hooks/useSystemStats'
import DateRangeFilter from '../SuperAdmin/DateRangeFilter'
import SystemKPICards from '../SuperAdmin/SystemKPICards'
import BusinessAnalysis from '../SuperAdmin/BusinessAnalysis'
import InquiryManagement from '../SuperAdmin/InquiryManagement'

const SuperAdminDashboard = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endDate: new Date()
  })

  const systemStats = useSystemStats(dateRange)

  const handleDateRangeChange = (newDateRange) => {
    setDateRange(newDateRange)
  }

  return (
    <div className="dashboard-container">
      {/* 날짜 필터 섹션 */}
      <div className="dashboard-section">
        <DateRangeFilter 
          dateRange={dateRange}
          onDateRangeChange={handleDateRangeChange}
        />
      </div>

      {/* 시스템 KPI 카드 */}
      <SystemKPICards 
        systemStats={systemStats}
        dateRange={dateRange}
      />

      {/* 메인 콘텐츠 그리드 */}
      <div style={{ display: 'block', marginBottom: '20px' }}>
        {/* 광고주 업종별 성과 분석 */}
        <BusinessAnalysis dateRange={dateRange} />
      </div>

      {/* 문의 관리 */}
      <InquiryManagement dateRange={dateRange} />
    </div>
  )
}

export default SuperAdminDashboard