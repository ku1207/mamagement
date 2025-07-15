import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import FilterSection from '../components/Dashboard/FilterSection'
import KPICards from '../components/Dashboard/KPICards'
import InteractiveChart from '../components/Dashboard/InteractiveChart'
import DataTable from '../components/Dashboard/DataTable'
import ExportBar from '../components/Dashboard/ExportBar'

export default function FacebookContent() {
  const { selectedAdvertiser } = useAuth()
  const [dashboardData, setDashboardData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRows, setSelectedRows] = useState([])
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endDate: new Date()
  })
  const [selectedFilters, setSelectedFilters] = useState({
    platforms: ['facebook'],
    adTypes: []
  })

  // 페이스북 광고 가상 데이터 생성
  const generateFacebookData = () => {
    const platform = 'facebook'
    const adTypes = ['image', 'video', 'carousel', 'collection', 'stories']
    
    const campaigns = [
      '페이스북 브랜딩 캠페인', '페이스북 세일 프로모션', '페이스북 신제품 런칭', '페이스북 리마케팅 캠페인',
      '페이스북 인스타그램 광고', '페이스북 동영상 광고', '페이스북 스토리 광고', '페이스북 카루셀 광고'
    ]
    
    const adGroups = [
      '브랜드 관심사', '일반 관심사', '경쟁사 관심사', '상품 관심사',
      '카테고리 관심사', '지역 타겟팅', '시즌 타겟팅', '이벤트 타겟팅'
    ]

    const data = []
    const dateCount = 30 // 30일치 데이터

    for (let i = 0; i < dateCount; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]

      adTypes.forEach(adType => {
        campaigns.forEach(campaign => {
          adGroups.forEach(adGroup => {
            // 랜덤 성과 데이터 생성
            const impressions = Math.floor(Math.random() * 100000) + 1000
            const clicks = Math.floor(impressions * (Math.random() * 0.1 + 0.01))
            const conversions = Math.floor(clicks * (Math.random() * 0.2 + 0.01))
            const cost = Math.floor((clicks * (Math.random() * 2000 + 100)))
            const revenue = Math.floor(conversions * (Math.random() * 50000 + 10000))

            data.push({
              date: dateStr,
              platform,
              adType,
              campaign,
              adGroup,
              impressions,
              clicks,
              conversions,
              cost,
              revenue,
              advertiser: selectedAdvertiser?.name || 'A광고주'
            })
          })
        })
      })
    }

    return data
  }

  useEffect(() => {
    // 페이스북 데이터 로드
    const loadFacebookData = async () => {
      setLoading(true)
      
      try {
        // 가상 데이터 생성 (실제로는 API 호출)
        const mockData = generateFacebookData()
        
        // 광고주 필터링
        const filteredData = mockData.filter(item => 
          !selectedAdvertiser || item.advertiser === selectedAdvertiser.name
        )
        
        // 날짜 범위 필터링
        const dateFilteredData = filteredData.filter(item => {
          const itemDate = new Date(item.date)
          return itemDate >= dateRange.startDate && itemDate <= dateRange.endDate
        })
        
        setDashboardData(dateFilteredData)
      } catch (error) {
        console.error('페이스북 데이터 로드 실패:', error)
      } finally {
        setLoading(false)
      }
    }

    loadFacebookData()
  }, [selectedAdvertiser, dateRange])

  const handleApplyFilters = () => {
    // 필터 적용 시 데이터 새로고침
    const filteredData = dashboardData.filter(item => {
      if (selectedFilters.platforms && selectedFilters.platforms.length > 0) {
        if (!selectedFilters.platforms.includes(item.platform)) return false
      }
      if (selectedFilters.adTypes && selectedFilters.adTypes.length > 0) {
        if (!selectedFilters.adTypes.includes(item.adType)) return false
      }
      return true
    })

    setDashboardData(filteredData)
  }

  const handleRowSelect = (rows) => {
    setSelectedRows(rows)
  }

  const handleExport = (type, rows) => {
    // 내보내기 로직 구현
    console.log(`Exporting ${type} for rows:`, rows)
  }

  const handleClearSelection = () => {
    setSelectedRows([])
  }

  if (!selectedAdvertiser) {
    return (
      <div className="content-area">
        <div className="no-advertiser-selected">
          <h2>📋 광고주를 선택해주세요</h2>
          <p>좌측 메뉴에서 광고주 계정을 선택하면 해당 광고주의 페이스북 광고 데이터를 확인할 수 있습니다.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="content-area">
        <div className="loading-dashboard">
          <div className="loading-spinner"></div>
          <span className="loading-text">페이스북 광고 데이터 로딩 중...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="content-area">
      <div className="dashboard-container" style={{ paddingBottom: '120px' }}>
        {/* 필터 섹션 */}
        <FilterSection
          dateRange={dateRange}
          setDateRange={setDateRange}
          selectedFilters={selectedFilters}
          setSelectedFilters={setSelectedFilters}
          onApplyFilters={handleApplyFilters}
        />

        {/* KPI 카드 */}
        <KPICards
          data={dashboardData}
          dateRange={dateRange}
          selectedFilters={selectedFilters}
        />

        {/* 인터랙티브 차트 */}
        <InteractiveChart
          data={dashboardData}
          selectedFilters={selectedFilters}
          dateRange={dateRange}
        />

        {/* 데이터 테이블 */}
        <DataTable
          data={dashboardData}
          selectedFilters={selectedFilters}
          onRowSelect={handleRowSelect}
          selectedRows={selectedRows}
          onExport={handleExport}
        />

        {/* 하단 내보내기 바 */}
        <ExportBar
          selectedRows={selectedRows}
          data={dashboardData}
          onExport={handleExport}
          onClear={handleClearSelection}
        />
      </div>
    </div>
  )
} 