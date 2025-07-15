import Layout from '../components/Layout'
import ProtectedRoute from '../components/ProtectedRoute'
import React, { useState, useEffect, useRef } from 'react'
import { useAuth, ROLES } from '../context/AuthContext'
import { useRouter } from 'next/router'
import DashboardContainer from '../components/Dashboard/DashboardContainer'
import SuperAdminDashboard from '../components/Dashboard/SuperAdminDashboard'
import FilterSection from '../components/Dashboard/FilterSection'
import KPICards from '../components/Dashboard/KPICards'
import InteractiveChart from '../components/Dashboard/InteractiveChart'
import DataTable from '../components/Dashboard/DataTable'
import ExportBar from '../components/Dashboard/ExportBar'

// 설정 상수들
const CONFIG = {
  DATA_PERIOD_DAYS: 30,
  DATE_RANGE: {
    DEFAULT_START_OFFSET: 7, // 기본 시작일 (7일 전)
    MAX_HISTORICAL_DAYS: 365
  },
  RANDOM_RANGES: {
    IMPRESSIONS: { min: 1000, max: 100000 },
    CLICKS: { min: 0.01, max: 0.1 }, // 노출수 대비 비율
    CONVERSIONS: { min: 0.01, max: 0.2 }, // 클릭수 대비 비율
    CPC: { min: 100, max: 2000 },
    REVENUE_MULTIPLIER: { min: 1.5, max: 2.5 }, // 비용 대비 수익 배수
    COST_VARIATION: { min: 0.8, max: 1.2 } // 비용 변동 범위
  },
  CHANGE_RATES: {
    DAILY: { min: -15, max: 20 }, // 일일 변동률 범위
    WEEKLY: { min: -10, max: 15 }, // 주간 변동률 범위
    MONTHLY: { min: -8, max: 12 } // 월간 변동률 범위
  },
  DISPLAY: {
    ITEMS_PER_PAGE: 10,
    DECIMAL_PLACES: 1
  }
}

// 유틸리티 함수들
const utils = {
  // 랜덤 숫자 생성 (범위 내)
  randomBetween: (min, max) => Math.random() * (max - min) + min,
  
  // 랜덤 정수 생성 (범위 내)
  randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
  
  // 날짜 계산 유틸리티
  getDateOffset: (offsetDays) => {
    const date = new Date()
    date.setDate(date.getDate() - offsetDays)
    return date
  },
  
  // 날짜 포맷팅
  formatDate: (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },
  
  // 퍼센트 계산
  calculatePercentage: (numerator, denominator) => {
    return denominator > 0 ? parseFloat(((numerator / denominator) * 100).toFixed(CONFIG.DISPLAY.DECIMAL_PLACES)) : 0
  },
  
  // 등락률 계산
  calculateChangeRate: (current, previous) => {
    return previous > 0 ? parseFloat(((current / previous) * 100 - 100).toFixed(CONFIG.DISPLAY.DECIMAL_PLACES)) : 0
  },
  
  // 시드 기반 랜덤 생성 (일관성 있는 데이터를 위해)
  seededRandom: (seed) => {
    const x = Math.sin(seed) * 10000
    return x - Math.floor(x)
  }
}

// 성과 데이터 생성 함수
const generatePerformanceData = (baseData = {}) => {
  const {
    baseImpressions = utils.randomInt(CONFIG.RANDOM_RANGES.IMPRESSIONS.min, CONFIG.RANDOM_RANGES.IMPRESSIONS.max),
    platform = 'general',
    dateString = utils.formatDate(new Date()),
    advertiserName = 'A광고주'
  } = baseData

  // 시드 생성 (일관성 있는 데이터를 위해)
  const seed = dateString.split('-').join('') + platform.length
  const seedValue = parseInt(seed) % 1000

  const impressions = Math.floor(baseImpressions * (1 + (utils.seededRandom(seedValue) - 0.5) * 0.3))
  const clickRate = utils.randomBetween(CONFIG.RANDOM_RANGES.CLICKS.min, CONFIG.RANDOM_RANGES.CLICKS.max)
  const clicks = Math.floor(impressions * clickRate)
  const conversionRate = utils.randomBetween(CONFIG.RANDOM_RANGES.CONVERSIONS.min, CONFIG.RANDOM_RANGES.CONVERSIONS.max)
  const conversions = Math.floor(clicks * conversionRate)
  const cpc = utils.randomInt(CONFIG.RANDOM_RANGES.CPC.min, CONFIG.RANDOM_RANGES.CPC.max)
  const cost = Math.floor(clicks * cpc)
  const revenueMultiplier = utils.randomBetween(CONFIG.RANDOM_RANGES.REVENUE_MULTIPLIER.min, CONFIG.RANDOM_RANGES.REVENUE_MULTIPLIER.max)
  const revenue = Math.floor(cost * revenueMultiplier)

  return {
    impressions,
    clicks,
    conversions,
    cost,
    revenue,
    cpc,
    ctr: utils.calculatePercentage(clicks, impressions),
    cvr: utils.calculatePercentage(conversions, clicks),
    cpa: conversions > 0 ? Math.round(cost / conversions) : 0,
    advertiser: advertiserName,
    platform,
    date: dateString
  }
}

// 기간별 요약 데이터 계산 함수
const calculatePeriodSummary = (data, previousData = null) => {
  if (!data || data.length === 0) {
    return {
      totalImpressions: 0,
      totalClicks: 0,
      totalCost: 0,
      totalConversions: 0,
      avgCtr: 0,
      avgCpc: 0,
      avgCpa: 0,
      changeRates: {}
    }
  }

  const totals = data.reduce((acc, item) => ({
    impressions: acc.impressions + (item.impressions || 0),
    clicks: acc.clicks + (item.clicks || 0),
    cost: acc.cost + (item.cost || 0),
    conversions: acc.conversions + (item.conversions || 0)
  }), { impressions: 0, clicks: 0, cost: 0, conversions: 0 })

  const avgCtr = utils.calculatePercentage(totals.clicks, totals.impressions)
  const avgCpc = totals.clicks > 0 ? Math.round(totals.cost / totals.clicks) : 0
  const avgCpa = totals.conversions > 0 ? Math.round(totals.cost / totals.conversions) : 0

  let changeRates = {}
  if (previousData) {
    const prevTotals = previousData.reduce((acc, item) => ({
      impressions: acc.impressions + (item.impressions || 0),
      clicks: acc.clicks + (item.clicks || 0),
      cost: acc.cost + (item.cost || 0),
      conversions: acc.conversions + (item.conversions || 0)
    }), { impressions: 0, clicks: 0, cost: 0, conversions: 0 })

    const prevAvgCpc = prevTotals.clicks > 0 ? Math.round(prevTotals.cost / prevTotals.clicks) : 0
    const prevAvgCpa = prevTotals.conversions > 0 ? Math.round(prevTotals.cost / prevTotals.conversions) : 0

    changeRates = {
      cost: utils.calculateChangeRate(totals.cost, prevTotals.cost),
      cpc: utils.calculateChangeRate(avgCpc, prevAvgCpc),
      conversions: utils.calculateChangeRate(totals.conversions, prevTotals.conversions),
      cpa: utils.calculateChangeRate(avgCpa, prevAvgCpa),
      ctr: utils.calculateChangeRate(avgCtr, utils.calculatePercentage(prevTotals.clicks, prevTotals.impressions))
    }
  }

  return {
    totalImpressions: totals.impressions,
    totalClicks: totals.clicks,
    totalCost: totals.cost,
    totalConversions: totals.conversions,
    avgCtr,
    avgCpc,
    avgCpa,
    changeRates
  }
}

// 매체별 기본 데이터 설정
const getMediaBaseData = (media) => {
  const mediaConfigs = {
    '네이버': { baseImpressions: 8000, multiplier: 1.0 },
    '카카오': { baseImpressions: 6000, multiplier: 0.9 },
    '구글': { baseImpressions: 10000, multiplier: 1.2 },
    '페이스북': { baseImpressions: 7000, multiplier: 1.1 },
    '틱톡': { baseImpressions: 12000, multiplier: 1.3 }
  }
  
  return mediaConfigs[media] || { baseImpressions: 5000, multiplier: 1.0 }
}

export default function Home() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const { user, selectedAdvertiser, hasPermission } = useAuth()
  const router = useRouter()

  // 프로필 페이지 처리
  useEffect(() => {
    if (currentPage === 'profile') {
      router.push('/profile')
    }
  }, [currentPage, router])

  // 네이버 페이지 처리
  useEffect(() => {
    if (currentPage === 'naver') {
      router.push('/naver')
    }
  }, [currentPage, router])

  // 카카오 페이지 처리
  useEffect(() => {
    if (currentPage === 'kakao') {
      router.push('/kakao')
    }
  }, [currentPage, router])

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardContent />
      case 'daily-data':
        return <DailyDataContent />
      case 'keyword-data':
        return <KeywordDataContent />
      case 'naver':
        return (
          <div className="content-area">
            <div className="loading-dashboard">
              <div className="loading-spinner"></div>
              <span className="loading-text">네이버 광고 페이지로 이동 중...</span>
            </div>
          </div>
        )
      case 'kakao':
        return (
          <div className="content-area">
            <div className="loading-dashboard">
              <div className="loading-spinner"></div>
              <span className="loading-text">카카오 광고 페이지로 이동 중...</span>
            </div>
          </div>
        )
      case 'google':
        return <MediaContent media="구글" />
      case 'facebook':
        return <MediaContent media="페이스북" />
      case 'tiktok':
        return <MediaContent media="틱톡" />
      case 'reports':
        return <ReportsContent />
      case 'advertisers':
        return hasPermission(ROLES.ADMIN) ? <AdvertisersContent /> : <UnauthorizedContent />
      case 'users':
        return hasPermission(ROLES.ADMIN) ? <UsersContent /> : <UnauthorizedContent />
      case 'inquiries':
        return hasPermission(ROLES.ADMIN) ? <InquiriesContent /> : <UnauthorizedContent />
      case 'payments':
        return hasPermission(ROLES.ADMIN) ? <PaymentsContent /> : <UnauthorizedContent />
      case 'system':
        return hasPermission(ROLES.ADMIN) ? <SystemContent /> : <UnauthorizedContent />
      default:
        return <DashboardContent />
    }
  }

  return (
    <ProtectedRoute>
      <Layout currentPage={currentPage} setCurrentPage={setCurrentPage}>
        {renderContent()}
      </Layout>
    </ProtectedRoute>
  )
}

function DashboardContent() {
  const { user } = useAuth();
  
  // 관리자는 별도 대시보드 표시
  if (user?.role === 'admin') {
    return (
      <div className="content-area">
        <SuperAdminDashboard />
      </div>
    );
  }
  
  // 마케터는 기존 대시보드 표시
  if (user?.role === 'marketer') {
    return (
      <div className="content-area">
        <DashboardContainer />
      </div>
    );
  }
  
  // 권한이 없는 경우
  return (
    <div className="content-area">
      <div className="unauthorized-message">
        <h2>접근 권한이 없습니다</h2>
        <p>대시보드에 접근할 수 있는 권한이 없습니다.</p>
      </div>
    </div>
  );
}

function MediaContent({ media }) {
  const { selectedAdvertiser } = useAuth()
  const [dashboardData, setDashboardData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRows, setSelectedRows] = useState([])
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endDate: new Date()
  })
  const [selectedFilters, setSelectedFilters] = useState({
    platforms: [media.toLowerCase() === '페이스북' ? 'facebook' : media.toLowerCase() === '네이버' ? 'naver' : media.toLowerCase() === '카카오' ? 'kakao' : media.toLowerCase() === '틱톡' ? 'tiktok' : 'google'],
    adTypes: []
  })

  // 해당 매체의 가상 데이터 생성
  const generateMediaData = () => {
    const platformMap = {
      '네이버': 'naver',
      '카카오': 'kakao', 
      '구글': 'google',
      '페이스북': 'facebook',
      '틱톡': 'tiktok'
    }
    
    const platform = platformMap[media]
    const mediaConfig = getMediaBaseData(media)
    const adTypes = ['search', 'banner', 'video', 'shopping']
    
    // 틱톡 전용 광고 타입 추가
    if (media === '틱톡') {
      adTypes.push('spark_ads', 'brand_takeover', 'in_feed', 'branded_hashtag')
    }
    
    const campaigns = [
      `${media} 브랜딩 캠페인`, `${media} 세일 프로모션`, `${media} 신제품 런칭`, `${media} 리타겟팅 캠페인`,
      `${media} 키워드 마케팅`, `${media} 디스플레이 광고`, `${media} 동영상 광고`, `${media} 쇼핑 광고`
    ]
    
    // 틱톡 전용 캠페인 추가
    if (media === '틱톡') {
      campaigns.push(`${media} 챌린지 캠페인`, `${media} 인플루언서 콜라보`, `${media} 바이럴 마케팅`)
    }
    
    const adGroups = [
      '브랜드 키워드', '일반 키워드', '경쟁사 키워드', '상품명 키워드',
      '카테고리 키워드', '지역 키워드', '시즌 키워드', '이벤트 키워드'
    ]
    
    // 틱톡 전용 광고 그룹 추가
    if (media === '틱톡') {
      adGroups.push('해시태그 그룹', '트렌드 그룹', '댄스 챌린지', '브랜드 챌린지')
    }

    const data = []

    for (let i = 0; i < CONFIG.DATA_PERIOD_DAYS; i++) {
      const date = utils.getDateOffset(i)
      const dateStr = utils.formatDate(date)

      adTypes.forEach(adType => {
        campaigns.forEach(campaign => {
          adGroups.forEach(adGroup => {
            // 개선된 성과 데이터 생성
            const performanceData = generatePerformanceData({
              baseImpressions: Math.floor(mediaConfig.baseImpressions * mediaConfig.multiplier),
              platform,
              dateString: dateStr,
              advertiserName: selectedAdvertiser?.name || 'A광고주'
            })

            data.push({
              ...performanceData,
              adType,
              campaign,
              adGroup
            })
          })
        })
      })
    }

    return data
  }

  useEffect(() => {
    // 매체별 데이터 로드
    const loadMediaData = async () => {
      setLoading(true)
      
      try {
        // 가상 데이터 생성 (실제로는 API 호출)
        const mockData = generateMediaData()
        
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
        console.error('매체 데이터 로드 실패:', error)
      } finally {
        setLoading(false)
      }
    }

    loadMediaData()
  }, [selectedAdvertiser, dateRange, media])

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
          <p>좌측 메뉴에서 광고주 계정을 선택하면 해당 광고주의 {media} 광고 데이터를 확인할 수 있습니다.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="content-area">
        <div className="loading-dashboard">
          <div className="loading-spinner"></div>
          <span className="loading-text">{media} 광고 데이터 로딩 중...</span>
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

function ReportsContent() {
  const { getAccessibleAdvertisers } = useAuth()
  const accessibleAdvertisers = getAccessibleAdvertisers()

  return (
    <div className="content-area">
      <h1>보고서</h1>
      <p>광고 성과 보고서를 확인할 수 있습니다.</p>
      
      <div className="report-filters">
        <select>
          <option value="">광고주 선택</option>
          {accessibleAdvertisers.map(advertiser => (
            <option key={advertiser.id} value={advertiser.id}>
              {advertiser.name}
            </option>
          ))}
        </select>
        <select>
          <option value="weekly">주간 보고서</option>
          <option value="monthly">월간 보고서</option>
          <option value="quarterly">분기별 보고서</option>
        </select>
      </div>

      <div className="report-section">
        <h3>주간 보고서</h3>
        <p>지난 주 광고 성과를 요약한 보고서입니다.</p>
        <div className="report-data">
          <div className="report-item">
            <span>총 노출수: {utils.randomInt(300000, 800000).toLocaleString()}</span>
          </div>
          <div className="report-item">
            <span>총 클릭수: {utils.randomInt(8000, 20000).toLocaleString()}</span>
          </div>
          <div className="report-item">
            <span>총 광고비: ₩{utils.randomInt(1500000, 3500000).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function AdvertisersContent() {
  const { advertisers, setAdvertisers } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', business: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    const newAdvertiser = {
      id: advertisers.length + 1,
      ...formData,
      createdAt: new Date().toISOString()
    }
    setAdvertisers([...advertisers, newAdvertiser])
    setFormData({ name: '', business: '' })
    setShowForm(false)
  }

  return (
    <div className="content-area">
      <h1>광고주 관리</h1>
      <p>광고주를 등록하고 관리할 수 있습니다.</p>
      
      <div className="content-header">
        <button 
          className="btn-primary" 
          onClick={() => setShowForm(true)}
        >
          + 광고주 등록
        </button>
      </div>

      {showForm && (
        <div className="form-modal">
          <form onSubmit={handleSubmit} className="advertiser-form">
            <h3>새 광고주 등록</h3>
            <div className="form-group">
              <label>회사명</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>업종</label>
              <input
                type="text"
                value={formData.business}
                onChange={(e) => setFormData({...formData, business: e.target.value})}
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">등록</button>
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                className="btn-secondary"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="advertisers-grid">
        {advertisers.map(advertiser => (
          <div key={advertiser.id} className="advertiser-card">
            <h3>{advertiser.name}</h3>
            <p>업종: {advertiser.business}</p>
            <p>등록일: {new Date(advertiser.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function UsersContent() {
  const { users } = useAuth()

  return (
    <div className="content-area">
      <h1>사용자 관리</h1>
      <p>사용자를 초대하고 권한을 관리할 수 있습니다.</p>
      
      <div className="content-header">
        <button className="btn-primary">+ 사용자 초대</button>
      </div>

      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>이름</th>
              <th>이메일</th>
              <th>역할</th>
              <th>가입일</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  {user.role === 'admin' && '관리자'}
                  {user.role === 'marketer' && '마케터'}
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <button className="btn-small">편집</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SystemContent() {
  return (
    <div className="content-area">
      <h1>시스템 관리</h1>
      <p>시스템 설정을 관리할 수 있습니다.</p>
      
      <div className="system-settings">
        <div className="setting-card">
          <h3>데이터베이스 상태</h3>
          <p>정상 작동 중</p>
        </div>
        <div className="setting-card">
          <h3>API 연결 상태</h3>
          <p>모든 매체 연결 정상</p>
        </div>
        <div className="setting-card">
          <h3>시스템 로그</h3>
          <p>최근 24시간 활동 기록</p>
        </div>
      </div>
    </div>
  )
}

function InquiriesContent() {
  const [inquiries, setInquiries] = useState([
    { id: 1, title: '광고 노출 관련 문의', author: '홍길동', status: '답변완료', createdAt: '2024-01-15' },
    { id: 2, title: '결제 오류 문의', author: '김철수', status: '처리중', createdAt: '2024-01-14' },
    { id: 3, title: '광고 성과 분석 요청', author: '이영희', status: '대기중', createdAt: '2024-01-13' }
  ])

  const getStatusColor = (status) => {
    switch(status) {
      case '답변완료': return '#28a745'
      case '처리중': return '#ffc107'
      case '대기중': return '#dc3545'
      default: return '#6c757d'
    }
  }

  return (
    <div className="content-area">
      <h1>문의 관리</h1>
      <p>고객 문의를 확인하고 답변할 수 있습니다.</p>
      
      <div className="inquiries-table">
        <table>
          <thead>
            <tr>
              <th>문의 제목</th>
              <th>작성자</th>
              <th>상태</th>
              <th>등록일</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map(inquiry => (
              <tr key={inquiry.id}>
                <td>{inquiry.title}</td>
                <td>{inquiry.author}</td>
                <td>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(inquiry.status) }}
                  >
                    {inquiry.status}
                  </span>
                </td>
                <td>{inquiry.createdAt}</td>
                <td>
                  <button className="btn-small">답변</button>
                  <button className="btn-small">상세보기</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function PaymentsContent() {
  const [payments, setPayments] = useState([
    { id: 1, advertiser: '테크웨이브', amount: 5000000, status: '완료', method: '계좌이체', date: '2024-01-15' },
    { id: 2, advertiser: '마케팅프로', amount: 3200000, status: '대기', method: '카드결제', date: '2024-01-14' },
    { id: 3, advertiser: '디지털솔루션', amount: 2800000, status: '완료', method: '계좌이체', date: '2024-01-13' }
  ])

  const getStatusColor = (status) => {
    switch(status) {
      case '완료': return '#28a745'
      case '대기': return '#ffc107'
      case '실패': return '#dc3545'
      default: return '#6c757d'
    }
  }

  return (
    <div className="content-area">
      <h1>결제 관리</h1>
      <p>광고주의 결제 내역을 관리할 수 있습니다.</p>
      
      <div className="payment-stats">
        <div className="stat-card">
          <h4>이번 달 총 결제</h4>
          <p className="stat-value">₩{utils.randomInt(8000000, 25000000).toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h4>완료된 결제</h4>
          <p className="stat-value">{utils.randomInt(10, 30)}건</p>
        </div>
        <div className="stat-card">
          <h4>대기 중인 결제</h4>
          <p className="stat-value">{utils.randomInt(1, 8)}건</p>
        </div>
      </div>

      <div className="payments-table">
        <table>
          <thead>
            <tr>
              <th>광고주</th>
              <th>결제 금액</th>
              <th>결제 방법</th>
              <th>상태</th>
              <th>결제일</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(payment => (
              <tr key={payment.id}>
                <td>{payment.advertiser}</td>
                <td>₩{payment.amount.toLocaleString()}</td>
                <td>{payment.method}</td>
                <td>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(payment.status) }}
                  >
                    {payment.status}
                  </span>
                </td>
                <td>{payment.date}</td>
                <td>
                  <button className="btn-small">상세보기</button>
                  {payment.status === '대기' && (
                    <button className="btn-small">승인</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function UnauthorizedContent() {
  return (
    <div className="content-area">
      <h1>🚫 접근 권한 없음</h1>
      <p>이 페이지에 접근할 수 있는 권한이 없습니다.</p>
    </div>
  )
}

function DailyDataContent() {
  const { selectedAdvertiser } = useAuth()
  
  // 오늘 날짜 및 이번 달 첫째 날 계산 (로컬 시간 기준)
  const today = new Date()
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  
  // 필터 상태 관리
  const [selectedMedias, setSelectedMedias] = useState(['네이버', '카카오', '구글', '메타', '틱톡'])
  const [startDate, setStartDate] = useState(utils.formatDate(firstDayOfMonth))
  const [endDate, setEndDate] = useState(utils.formatDate(today))
  
  // 검색 결과 상태 관리
  const [filteredKeywords, setFilteredKeywords] = useState([])
  const [keywordData, setKeywordData] = useState([])
  const [dailyData, setDailyData] = useState([])
  const [filteredDailyData, setFilteredDailyData] = useState([])
  const [periodSummary, setPeriodSummary] = useState({
    totalImpressions: 0,
    totalClicks: 0,
    totalCost: 0,
    avgCtr: 0,
    avgCpc: 0
  })
  
  // 키워드 행 선택 및 슬라이드 상태 관리
  const [selectedKeywordIndex, setSelectedKeywordIndex] = useState(null)
  const [expandedKeywordData, setExpandedKeywordData] = useState([])
  
  // 일자별 행 선택 및 슬라이드 상태 관리
  const [selectedDateIndex, setSelectedDateIndex] = useState(null)
  const [expandedDateData, setExpandedDateData] = useState([])
  
  // 상세 데이터 필터 및 페이지네이션 상태
  const [selectedDataFilters, setSelectedDataFilters] = useState(['광고비', 'CPC'])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [horizontalScrollPosition, setHorizontalScrollPosition] = useState(0)
  
  // 스크롤바 동기화를 위한 ref
  const topScrollRef = useRef(null)
  const tableScrollRef = useRef(null)
  
  // 상단 스크롤바와 테이블 스크롤 동기화
  const handleTopScroll = () => {
    if (topScrollRef.current && tableScrollRef.current) {
      tableScrollRef.current.scrollLeft = topScrollRef.current.scrollLeft
    }
  }
  
  const handleTableScroll = () => {
    if (topScrollRef.current && tableScrollRef.current) {
      topScrollRef.current.scrollLeft = tableScrollRef.current.scrollLeft
    }
  }
  
  if (!selectedAdvertiser) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '400px' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📅</div>
          <h3 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '600', 
            color: '#2c3e50', 
            marginBottom: '10px' 
          }}>
            광고주를 선택해주세요
          </h3>
          <p style={{ color: '#6c757d' }}>
            상단 네비게이션에서 광고주를 선택하면 일자별 데이터를 확인할 수 있습니다.
          </p>
        </div>
      </div>
    )
  }

  // 매체 선택 처리
  const handleMediaChange = (media) => {
    setSelectedMedias(prev => {
      if (prev.includes(media)) {
        // 최소 1개는 선택되어야 함
        if (prev.length > 1) {
          return prev.filter(m => m !== media)
        }
        return prev
      } else {
        return [...prev, media]
      }
    })
  }

  // 검색 버튼 클릭 핸들러
  const handleSearch = () => {
    // 일자별 데이터 필터링
    const dailyResults = getFilteredDailyData()
    setFilteredDailyData(dailyResults)
    
    // 기간별 요약 정보 계산
    const summary = calculatePeriodSummary(dailyResults)
    setPeriodSummary(summary)
    
    // 키워드 데이터 필터링
    const keywordResults = getFilteredKeywords()
    setFilteredKeywords(keywordResults)
  }

  // 키워드 행 클릭 핸들러
  const handleKeywordRowClick = (index, keyword) => {
    if (selectedKeywordIndex === index) {
      // 같은 행을 다시 클릭하면 닫기
      setSelectedKeywordIndex(null)
      setExpandedKeywordData([])
    } else {
      // 해당 키워드의 모든 데이터 가져오기
      const keywordAllData = keywordData.filter(item => item.keyword === keyword)
      setSelectedKeywordIndex(index)
      setExpandedKeywordData(keywordAllData)
    }
  }

  // 일자별 행 클릭 핸들러
  const handleDateRowClick = (index, date) => {
    if (selectedDateIndex === index) {
      // 같은 행을 다시 클릭하면 닫기
      setSelectedDateIndex(null)
      setExpandedDateData([])
    } else {
      // 해당 날짜의 매체별 데이터 생성 (일자별 데이터와 동일한 로직 사용)
      const mediaData = generateMediaDataForDate(date)
      
      setSelectedDateIndex(index)
      setExpandedDateData(mediaData)
    }
  }

  // 테이블 외부 클릭 핸들러
  const handleOutsideClick = () => {
    setSelectedKeywordIndex(null)
    setExpandedKeywordData([])
    setSelectedDateIndex(null)
    setExpandedDateData([])
  }

  // 특정 날짜의 매체별 데이터 생성 함수
  const generateMediaDataForDate = (date) => {
    return ['네이버', '카카오', '구글', '메타', '틱톡'].map((media) => {
      const mediaConfig = getMediaBaseData(media)
      
      const performanceData = generatePerformanceData({
        baseImpressions: mediaConfig.baseImpressions,
        platform: media.toLowerCase(),
        dateString: date,
        advertiserName: selectedAdvertiser?.name || 'A광고주'
      })
      
      return {
        ...performanceData,
        media,
        campaign: `${media} 일자별 캠페인`
      }
    })
  }

  // 일자별 데이터 생성 (매체별 데이터의 합산)
  const generateDailyData = () => {
    const data = []
    for (let i = CONFIG.DATA_PERIOD_DAYS; i >= 0; i--) {
      const date = utils.getDateOffset(i)
      const dateStr = utils.formatDate(date)
      
      // 해당 날짜의 매체별 데이터 생성
      const mediaData = generateMediaDataForDate(dateStr)
      
      // 매체별 데이터 합산
      const totalImpressions = mediaData.reduce((sum, item) => sum + item.impressions, 0)
      const totalClicks = mediaData.reduce((sum, item) => sum + item.clicks, 0)
      const totalCost = mediaData.reduce((sum, item) => sum + item.cost, 0)
      const totalConversions = mediaData.reduce((sum, item) => sum + item.conversions, 0)
      const totalRevenue = mediaData.reduce((sum, item) => sum + item.revenue, 0)
      
      // 계산된 지표
      const ctr = utils.calculatePercentage(totalClicks, totalImpressions)
      const cpc = totalClicks > 0 ? Math.round(totalCost / totalClicks) : 0
      const cpa = totalConversions > 0 ? Math.round(totalCost / totalConversions) : 0
      const cvr = utils.calculatePercentage(totalConversions, totalClicks)
      
      data.push({
        date: dateStr,
        impressions: totalImpressions,
        clicks: totalClicks,
        conversions: totalConversions,
        cost: totalCost,
        revenue: totalRevenue,
        cpc,
        cpa,
        cvr,
        ctr
      })
    }
    return data
  }

  // 키워드 고정 더미 데이터 생성
  const generateKeywordData = () => {
    const fixedKeywordData = [
      { keyword: '브랜드명', media: '네이버', campaign: '네이버 브랜드 캠페인', adGroup: '네이버 브랜드 키워드', impressions: 15000, clicks: 750, ctr: 5.0, cpc_today: 320, cpc_yesterday: 315, cpc_7days: 318, cpc_last_week: 322, cost_today: 130000, cost_yesterday: 128000, cost_7days: 320000, cost_last_week: 325000 },
              { keyword: '브랜드명', media: '구글', campaign: '구글 브랜드 캠페인', adGroup: '구글 브랜드 키워드', impressions: 12000, clicks: 600, ctr: 5.0, cpc_today: 350, cpc_yesterday: 345, cpc_7days: 348, cpc_last_week: 352, cost_today: 120000, cost_yesterday: 118000, cost_7days: 280000, cost_last_week: 285000 },
              { keyword: '브랜드명', media: '카카오', campaign: '카카오 브랜드 캠페인', adGroup: '카카오 브랜드 키워드', impressions: 10000, clicks: 500, ctr: 5.0, cpc_today: 380, cpc_yesterday: 375, cpc_7days: 378, cpc_last_week: 382, cost_today: 110000, cost_yesterday: 108000, cost_7days: 240000, cost_last_week: 245000 },
        { keyword: '브랜드명', media: '메타', campaign: '메타 브랜드 캠페인', adGroup: '메타 브랜드 키워드', impressions: 8000, clicks: 400, ctr: 5.0, cpc_today: 400, cpc_yesterday: 395, cpc_7days: 398, cpc_last_week: 402, cost_today: 100000, cost_yesterday: 108000, cost_7days: 200000, cost_last_week: 205000 },
      { keyword: '브랜드명', media: '틱톡', campaign: '틱톡 브랜드 캠페인', adGroup: '틱톡 브랜드 키워드', impressions: 50000, clicks: 2500, ctr: 5.0, cpc_today: 180, cpc_yesterday: 175, cpc_7days: 178, cpc_last_week: 182, cost_today: 150000, cost_yesterday: 148000, cost_7days: 600000, cost_last_week: 605000 },
      
      { keyword: '제품명', media: '네이버', campaign: '네이버 제품 캠페인', adGroup: '네이버 제품 키워드', impressions: 18000, clicks: 900, ctr: 5.0, cpc_today: 280, cpc_yesterday: 275, cpc_7days: 278, cpc_last_week: 282, cost_today: 95000, cost_yesterday: 92000, cost_7days: 380000, cost_last_week: 385000 },
      { keyword: '제품명', media: '카카오', campaign: '카카오 제품 캠페인', adGroup: '카카오 제품 키워드', impressions: 14000, clicks: 700, ctr: 5.0, cpc_today: 300, cpc_yesterday: 295, cpc_7days: 298, cpc_last_week: 302, cost_today: 75000, cost_yesterday: 73000, cost_7days: 300000, cost_last_week: 305000 },
      { keyword: '제품명', media: '구글', campaign: '구글 제품 캠페인', adGroup: '구글 제품 키워드', impressions: 11000, clicks: 550, ctr: 5.0, cpc_today: 320, cpc_yesterday: 315, cpc_7days: 318, cpc_last_week: 322, cost_today: 68000, cost_yesterday: 66000, cost_7days: 270000, cost_last_week: 275000 },
      { keyword: '제품명', media: '메타', campaign: '메타 제품 캠페인', adGroup: '메타 제품 키워드', impressions: 9000, clicks: 450, ctr: 5.0, cpc_today: 350, cpc_yesterday: 345, cpc_7days: 348, cpc_last_week: 352, cost_today: 55000, cost_yesterday: 53000, cost_7days: 220000, cost_last_week: 225000 },
      { keyword: '제품명', media: '틱톡', campaign: '틱톡 제품 캠페인', adGroup: '틱톡 제품 키워드', impressions: 45000, clicks: 2250, ctr: 5.0, cpc_today: 200, cpc_yesterday: 195, cpc_7days: 198, cpc_last_week: 202, cost_today: 140000, cost_yesterday: 138000, cost_7days: 560000, cost_last_week: 565000 },
      
      { keyword: '카테고리', media: '구글', campaign: '구글 카테고리 캠페인', adGroup: '구글 핵심 키워드', impressions: 20000, clicks: 1000, ctr: 5.0, cpc_today: 250, cpc_yesterday: 245, cpc_7days: 248, cpc_last_week: 252, cost_today: 100000, cost_yesterday: 98000, cost_7days: 400000, cost_last_week: 405000 },
      { keyword: '카테고리', media: '메타', campaign: '메타 카테고리 캠페인', adGroup: '메타 핵심 키워드', impressions: 16000, clicks: 800, ctr: 5.0, cpc_today: 275, cpc_yesterday: 270, cpc_7days: 273, cpc_last_week: 277, cost_today: 85000, cost_yesterday: 83000, cost_7days: 340000, cost_last_week: 345000 },
      { keyword: '카테고리', media: '네이버', campaign: '네이버 카테고리 캠페인', adGroup: '네이버 핵심 키워드', impressions: 13000, clicks: 650, ctr: 5.0, cpc_today: 290, cpc_yesterday: 285, cpc_7days: 288, cpc_last_week: 292, cost_today: 72000, cost_yesterday: 70000, cost_7days: 290000, cost_last_week: 295000 },
      { keyword: '카테고리', media: '카카오', campaign: '카카오 카테고리 캠페인', adGroup: '카카오 핵심 키워드', impressions: 11000, clicks: 550, ctr: 5.0, cpc_today: 310, cpc_yesterday: 305, cpc_7days: 308, cpc_last_week: 312, cost_today: 64000, cost_yesterday: 62000, cost_7days: 250000, cost_last_week: 255000 },
      { keyword: '카테고리', media: '틱톡', campaign: '틱톡 카테고리 캠페인', adGroup: '틱톡 카테고리 키워드', impressions: 40000, clicks: 2000, ctr: 5.0, cpc_today: 170, cpc_yesterday: 165, cpc_7days: 168, cpc_last_week: 172, cost_today: 130000, cost_yesterday: 128000, cost_7days: 520000, cost_last_week: 525000 },
      
      { keyword: '경쟁사', media: '네이버', campaign: '네이버 브랜드 캠페인', adGroup: '네이버 브랜드 키워드', impressions: 10000, clicks: 500, ctr: 5.0, cpc_today: 400, cpc_yesterday: 395, cpc_7days: 398, cpc_last_week: 402, cost_today: 65000, cost_yesterday: 63000, cost_7days: 260000, cost_last_week: 265000 },
      { keyword: '경쟁사', media: '구글', campaign: '구글 브랜드 캠페인', adGroup: '구글 브랜드 키워드', impressions: 8000, clicks: 400, ctr: 5.0, cpc_today: 420, cpc_yesterday: 415, cpc_7days: 418, cpc_last_week: 422, cost_today: 58000, cost_yesterday: 56000, cost_7days: 230000, cost_last_week: 235000 },
      
      { keyword: '일반키워드', media: '구글', campaign: '구글 제품 캠페인', adGroup: '구글 제품 키워드', impressions: 22000, clicks: 1100, ctr: 5.0, cpc_today: 230, cpc_yesterday: 225, cpc_7days: 228, cpc_last_week: 232, cost_today: 110000, cost_yesterday: 108000, cost_7days: 440000, cost_last_week: 445000 },
      { keyword: '일반키워드', media: '카카오', campaign: '카카오 제품 캠페인', adGroup: '카카오 제품 키워드', impressions: 13000, clicks: 650, ctr: 5.0, cpc_today: 260, cpc_yesterday: 255, cpc_7days: 258, cpc_last_week: 262, cost_today: 72000, cost_yesterday: 70000, cost_7days: 290000, cost_last_week: 295000 },
      
      { keyword: '롱테일키워드', media: '네이버', campaign: '네이버 제품 캠페인', adGroup: '네이버 제품 키워드', impressions: 8000, clicks: 400, ctr: 5.0, cpc_today: 350, cpc_yesterday: 345, cpc_7days: 348, cpc_last_week: 352, cost_today: 55000, cost_yesterday: 53000, cost_7days: 220000, cost_last_week: 225000 },
      
      { keyword: '상품후기', media: '메타', campaign: '메타 브랜드 캠페인', adGroup: '메타 브랜드 키워드', impressions: 12000, clicks: 600, ctr: 5.0, cpc_today: 300, cpc_yesterday: 295, cpc_7days: 298, cpc_last_week: 302, cost_today: 68000, cost_yesterday: 66000, cost_7days: 270000, cost_last_week: 275000 },
      
      { keyword: '가격비교', media: '구글', campaign: '구글 제품 캠페인', adGroup: '구글 제품 키워드', impressions: 17000, clicks: 850, ctr: 5.0, cpc_today: 290, cpc_yesterday: 285, cpc_7days: 288, cpc_last_week: 292, cost_today: 88000, cost_yesterday: 86000, cost_7days: 350000, cost_last_week: 355000 },
      { keyword: '가격비교', media: '네이버', campaign: '네이버 제품 캠페인', adGroup: '네이버 제품 키워드', impressions: 11000, clicks: 550, ctr: 5.0, cpc_today: 320, cpc_yesterday: 315, cpc_7days: 318, cpc_last_week: 322, cost_today: 64000, cost_yesterday: 62000, cost_7days: 250000, cost_last_week: 255000 },
      
      { keyword: '이벤트', media: '카카오', campaign: '카카오 카테고리 캠페인', adGroup: '카카오 핵심 키워드', impressions: 25000, clicks: 1250, ctr: 5.0, cpc_today: 200, cpc_yesterday: 195, cpc_7days: 198, cpc_last_week: 202, cost_today: 120000, cost_yesterday: 118000, cost_7days: 480000, cost_last_week: 485000 },
      
      { keyword: '할인', media: '메타', campaign: '메타 제품 캠페인', adGroup: '메타 제품 키워드', impressions: 19000, clicks: 950, ctr: 5.0, cpc_today: 260, cpc_yesterday: 255, cpc_7days: 258, cpc_last_week: 262, cost_today: 95000, cost_yesterday: 93000, cost_7days: 380000, cost_last_week: 385000 },
      
      // 틱톡 전용 키워드 데이터 추가
      { keyword: '챌린지', media: '틱톡', campaign: '틱톡 바이럴 챌린지', adGroup: '틱톡 해시태그 키워드', impressions: 80000, clicks: 4000, ctr: 5.0, cpc_today: 150, cpc_yesterday: 145, cpc_7days: 148, cpc_last_week: 152, cost_today: 200000, cost_yesterday: 198000, cost_7days: 800000, cost_last_week: 805000 },
      { keyword: '댄스', media: '틱톡', campaign: '틱톡 댄스 챌린지', adGroup: '틱톡 댄스 키워드', impressions: 75000, clicks: 3750, ctr: 5.0, cpc_today: 160, cpc_yesterday: 155, cpc_7days: 158, cpc_last_week: 162, cost_today: 180000, cost_yesterday: 178000, cost_7days: 720000, cost_last_week: 725000 },
      { keyword: '트렌드', media: '틱톡', campaign: '틱톡 트렌드 마케팅', adGroup: '틱톡 트렌드 키워드', impressions: 60000, clicks: 3000, ctr: 5.0, cpc_today: 190, cpc_yesterday: 185, cpc_7days: 188, cpc_last_week: 192, cost_today: 170000, cost_yesterday: 168000, cost_7days: 680000, cost_last_week: 685000 },
      { keyword: '바이럴', media: '틱톡', campaign: '틱톡 바이럴 마케팅', adGroup: '틱톡 바이럴 키워드', impressions: 65000, clicks: 3250, ctr: 5.0, cpc_today: 175, cpc_yesterday: 170, cpc_7days: 173, cpc_last_week: 177, cost_today: 160000, cost_yesterday: 158000, cost_7days: 640000, cost_last_week: 645000 },
      { keyword: '인플루언서', media: '틱톡', campaign: '틱톡 인플루언서 콜라보', adGroup: '틱톡 인플루언서 키워드', impressions: 55000, clicks: 2750, ctr: 5.0, cpc_today: 210, cpc_yesterday: 205, cpc_7days: 208, cpc_last_week: 212, cost_today: 190000, cost_yesterday: 188000, cost_7days: 760000, cost_last_week: 765000 }
    ]
    
    // 모든 키워드 데이터의 광고비가 0원이 되지 않도록 하고, 전환수를 적절히 설정
    return fixedKeywordData.map(item => ({
      ...item,
      cost_today: Math.max(50000, item.cost_today),
      cost_yesterday: Math.max(50000, item.cost_yesterday),
      cost_7days: Math.max(50000, item.cost_7days),
      cost_last_week: Math.max(50000, item.cost_last_week),
      // 전환수는 클릭수의 8%로 설정하되 1,000개 미만으로 제한
      conversions: Math.min(999, Math.floor(item.clicks * 0.08))
    }))
  }

  // 선택된 날짜 범위에 따른 일자별 데이터 필터링
  const getFilteredDailyData = () => {
    if (!startDate || !endDate) return dailyData

    return dailyData.filter(item => {
      return item.date >= startDate && item.date <= endDate
    })
  }



  // 기간별 합산 정보 계산
  const calculatePeriodSummary = (data) => {
    // 데이터가 비어있거나 없을 때 기본값 설정
    if (!data || data.length === 0) {
      const defaultData = generatePerformanceData({
        baseImpressions: utils.randomInt(40000, 80000),
        platform: 'mixed',
        dateString: utils.formatDate(new Date()),
        advertiserName: selectedAdvertiser?.name || 'A광고주'
      })
      
      // 전일 데이터 생성
      const yesterdayVariation = utils.randomBetween(0.85, 0.95)
      const todayVariation = utils.randomBetween(1.05, 1.15)
      
      return {
        ...defaultData,
        // 전일 데이터
        totalCostYesterday: Math.floor(defaultData.cost * yesterdayVariation),
        totalConversionsYesterday: Math.floor(defaultData.conversions * yesterdayVariation),
        avgCpcYesterday: Math.floor(defaultData.cpc * (1 / yesterdayVariation)),
        avgCpaYesterday: Math.floor(defaultData.cpa * (1 / yesterdayVariation)),
        avgCtrYesterday: parseFloat((defaultData.ctr * yesterdayVariation).toFixed(CONFIG.DISPLAY.DECIMAL_PLACES)),
        // 당일 데이터
        totalCostToday: Math.floor(defaultData.cost * todayVariation),
        // 등락률
        costChangeRate: utils.calculateChangeRate(defaultData.cost * todayVariation, defaultData.cost * yesterdayVariation),
        cpcChangeRate: utils.calculateChangeRate(defaultData.cpc, defaultData.cpc * (1 / yesterdayVariation)),
        conversionChangeRate: utils.calculateChangeRate(defaultData.conversions * todayVariation, defaultData.conversions * yesterdayVariation),
        cpaChangeRate: utils.calculateChangeRate(defaultData.cpa, defaultData.cpa * (1 / yesterdayVariation)),
        ctrChangeRate: utils.calculateChangeRate(defaultData.ctr * todayVariation, defaultData.ctr * yesterdayVariation)
      }
    }
    
    const totalImpressions = data.reduce((sum, item) => sum + item.impressions, 0)
    const totalClicks = data.reduce((sum, item) => sum + item.clicks, 0)
    const totalCost = data.reduce((sum, item) => sum + item.cost, 0)
    const totalConversions = data.reduce((sum, item) => sum + (item.conversions || 0), 0)
    
    // 평균 CTR 계산 (전체 클릭수 / 전체 노출수)
    const avgCtr = utils.calculatePercentage(totalClicks, totalImpressions)
    
    // 평균 CPC 계산 (전체 광고비 / 전체 클릭수)
    const avgCpc = totalClicks > 0 ? Math.round(totalCost / totalClicks) : 0
    
    // 평균 CPA 계산 (전체 광고비 / 전체 전환수)
    const avgCpa = totalConversions > 0 ? Math.round(totalCost / totalConversions) : 0
    
    // 실제 더미 데이터 기반 등락률 계산
    // 당일 데이터
    const todayData = {
      cost: totalCost,
      cpc: avgCpc,
      conversions: totalConversions,
      cpa: avgCpa,
      ctr: avgCtr,
      impressions: totalImpressions,
      clicks: totalClicks
    }
    
    // 전일 데이터 (당일 대비 변동)
    const yesterdayVariation = utils.randomBetween(0.85, 0.95)
    const yesterdayData = {
      cost: Math.floor(totalCost * yesterdayVariation),
      cpc: Math.floor(avgCpc * (1 / yesterdayVariation)),
      conversions: Math.floor(totalConversions * yesterdayVariation),
      cpa: Math.floor(avgCpa * (1 / yesterdayVariation)),
      ctr: parseFloat((avgCtr * yesterdayVariation).toFixed(CONFIG.DISPLAY.DECIMAL_PLACES)),
      impressions: Math.floor(totalImpressions * yesterdayVariation),
      clicks: Math.floor(totalClicks * yesterdayVariation)
    }
    
    // 최근 7일 데이터 (이전 7일 대비 변동)
    const recent7DaysMultiplier = utils.randomBetween(6.8, 7.5)
    const recent7DaysData = {
      cost: Math.floor(totalCost * recent7DaysMultiplier),
      cpc: Math.floor(avgCpc * utils.randomBetween(0.98, 1.05)),
      conversions: Math.floor(totalConversions * recent7DaysMultiplier),
      cpa: Math.floor(avgCpa * utils.randomBetween(0.93, 1.07)),
      ctr: parseFloat((avgCtr * utils.randomBetween(0.98, 1.03)).toFixed(CONFIG.DISPLAY.DECIMAL_PLACES)),
      impressions: Math.floor(totalImpressions * utils.randomBetween(6.5, 7.2)),
      clicks: Math.floor(totalClicks * utils.randomBetween(6.8, 7.3))
    }
    
    // 이전 7일 데이터
    const prev7DaysMultiplier = utils.randomBetween(6.2, 6.8)
    const prev7DaysData = {
      cost: Math.floor(totalCost * prev7DaysMultiplier),
      cpc: Math.floor(avgCpc * utils.randomBetween(1.05, 1.15)),
      conversions: Math.floor(totalConversions * prev7DaysMultiplier),
      cpa: Math.floor(avgCpa * utils.randomBetween(1.02, 1.12)),
      ctr: parseFloat((avgCtr * utils.randomBetween(1.02, 1.08)).toFixed(CONFIG.DISPLAY.DECIMAL_PLACES)),
      impressions: Math.floor(totalImpressions * utils.randomBetween(5.8, 6.5)),
      clicks: Math.floor(totalClicks * utils.randomBetween(6.0, 6.8))
    }
    
    // 당월 데이터 (전월 대비 변동)
    const currentMonthMultiplier = utils.randomBetween(27.0, 30.0)
    const currentMonthData = {
      cost: Math.floor(totalCost * currentMonthMultiplier),
      cpc: Math.floor(avgCpc * utils.randomBetween(0.95, 1.05)),
      conversions: Math.floor(totalConversions * currentMonthMultiplier),
      cpa: Math.floor(avgCpa * utils.randomBetween(0.98, 1.08)),
      ctr: parseFloat((avgCtr * utils.randomBetween(0.98, 1.05)).toFixed(CONFIG.DISPLAY.DECIMAL_PLACES)),
      impressions: Math.floor(totalImpressions * utils.randomBetween(28.0, 31.0)),
      clicks: Math.floor(totalClicks * utils.randomBetween(28.5, 31.5))
    }
    
    // 전월 데이터
    const prevMonthMultiplier = utils.randomBetween(29.0, 33.0)
    const prevMonthData = {
      cost: Math.floor(totalCost * prevMonthMultiplier),
      cpc: Math.floor(avgCpc * utils.randomBetween(1.02, 1.08)),
      conversions: Math.floor(totalConversions * prevMonthMultiplier),
      cpa: Math.floor(avgCpa * utils.randomBetween(0.95, 1.03)),
      ctr: parseFloat((avgCtr * utils.randomBetween(0.92, 0.98)).toFixed(CONFIG.DISPLAY.DECIMAL_PLACES)),
      impressions: Math.floor(totalImpressions * utils.randomBetween(30.0, 34.0)),
      clicks: Math.floor(totalClicks * utils.randomBetween(29.0, 32.0))
    }
    
    // 등락률 계산 (당일/전일)
    const costChangeRate = utils.calculateChangeRate(todayData.cost, yesterdayData.cost)
    const cpcChangeRate = utils.calculateChangeRate(todayData.cpc, yesterdayData.cpc)
    const conversionChangeRate = utils.calculateChangeRate(todayData.conversions, yesterdayData.conversions)
    const cpaChangeRate = utils.calculateChangeRate(todayData.cpa, yesterdayData.cpa)
    const ctrChangeRate = utils.calculateChangeRate(todayData.ctr, yesterdayData.ctr)
    
    // 7일 기간 등락률 계산 (최근7일/이전7일)
    const cost7DaysChangeRate = utils.calculateChangeRate(recent7DaysData.cost, prev7DaysData.cost)
    const cpc7DaysChangeRate = utils.calculateChangeRate(recent7DaysData.cpc, prev7DaysData.cpc)
    const conversion7DaysChangeRate = utils.calculateChangeRate(recent7DaysData.conversions, prev7DaysData.conversions)
    const cpa7DaysChangeRate = utils.calculateChangeRate(recent7DaysData.cpa, prev7DaysData.cpa)
    const ctr7DaysChangeRate = utils.calculateChangeRate(recent7DaysData.ctr, prev7DaysData.ctr)
    
    // 월 기간 등락률 계산 (당월/전월)
    const costMonthChangeRate = utils.calculateChangeRate(currentMonthData.cost, prevMonthData.cost)
    const cpcMonthChangeRate = utils.calculateChangeRate(currentMonthData.cpc, prevMonthData.cpc)
    const conversionMonthChangeRate = utils.calculateChangeRate(currentMonthData.conversions, prevMonthData.conversions)
    const cpaMonthChangeRate = utils.calculateChangeRate(currentMonthData.cpa, prevMonthData.cpa)
    const ctrMonthChangeRate = utils.calculateChangeRate(currentMonthData.ctr, prevMonthData.ctr)
    
    return {
      totalImpressions,
      totalClicks,
      totalCost,
      totalConversions,
      avgCtr,
      avgCpc,
      avgCpa,
      // 전일 데이터
      totalCostYesterday: yesterdayData.cost,
      totalConversionsYesterday: yesterdayData.conversions,
      avgCpcYesterday: yesterdayData.cpc,
      avgCpaYesterday: yesterdayData.cpa,
      avgCtrYesterday: yesterdayData.ctr,
      // 당일 데이터 (totalCostToday 추가)
      totalCostToday: todayData.cost,
      // 7일 데이터
      recent7DaysData,
      prev7DaysData,
      // 월 데이터
      currentMonthData,
      prevMonthData,
      // 등락률
      costChangeRate,
      cpcChangeRate,
      conversionChangeRate,
      cpaChangeRate,
      ctrChangeRate,
      cost7DaysChangeRate,
      cpc7DaysChangeRate,
      conversion7DaysChangeRate,
      cpa7DaysChangeRate,
      ctr7DaysChangeRate,
      costMonthChangeRate,
      cpcMonthChangeRate,
      conversionMonthChangeRate,
      cpaMonthChangeRate,
      ctrMonthChangeRate
    }
  }

  // 키워드 데이터 필터링
  const getFilteredKeywords = () => {
    let filtered = [...keywordData]
    
    // 선택된 매체로 필터링
    filtered = filtered.filter(item => selectedMedias.includes(item.media))
    
    // 키워드별로 그룹화하고 광고비 합계 계산
    const groupedByKeyword = {}
    filtered.forEach(item => {
      if (!groupedByKeyword[item.keyword]) {
        groupedByKeyword[item.keyword] = {
          keyword: item.keyword,
          media: item.media,
          campaign: item.campaign,
          adGroup: item.adGroup,
          impressions: item.impressions,
          clicks: item.clicks,
          ctr: item.ctr,
          cpc_today: item.cpc_today,
          cpc_yesterday: item.cpc_yesterday,
          cpc_7days: item.cpc_7days,
          cpc_last_week: item.cpc_last_week,
          cost_today: item.cost_today,
          cost_yesterday: item.cost_yesterday,
          cost_7days: item.cost_7days,
          cost_last_week: item.cost_last_week
        }
      } else {
        // 동일 키워드의 경우 광고비 합계
        groupedByKeyword[item.keyword].cost_today += item.cost_today
        groupedByKeyword[item.keyword].cost_yesterday += item.cost_yesterday
        groupedByKeyword[item.keyword].cost_7days += item.cost_7days
        groupedByKeyword[item.keyword].cost_last_week += item.cost_last_week
        // 노출수, 클릭수도 합계
        groupedByKeyword[item.keyword].impressions += item.impressions
        groupedByKeyword[item.keyword].clicks += item.clicks
        // CTR 재계산
        groupedByKeyword[item.keyword].ctr = parseFloat(((groupedByKeyword[item.keyword].clicks / groupedByKeyword[item.keyword].impressions) * 100).toFixed(1))
      }
    })
    
    // 그룹화된 데이터를 배열로 변환
    filtered = Object.values(groupedByKeyword)
    
    // 광고비 내림차순 정렬
    filtered.sort((a, b) => b.cost_today - a.cost_today)
    
    return filtered
  }

  // 컴포넌트 마운트 시 데이터 생성
  useEffect(() => {
    if (selectedAdvertiser) {
      // 일자별 데이터 생성
      const dailyInitialData = generateDailyData()
      setDailyData(dailyInitialData)
      
      // 키워드 데이터 생성
      const keywordInitialData = generateKeywordData()
      setKeywordData(keywordInitialData)
      
      // 초기 데이터 필터링 및 표시
      const filteredDaily = dailyInitialData.filter(item => {
        return item.date >= startDate && item.date <= endDate
      })
      setFilteredDailyData(filteredDaily)
    
    // 기간별 요약 정보 계산
      const summary = calculatePeriodSummary(filteredDaily)
    setPeriodSummary(summary)
      
      // 키워드 데이터 필터링
      const filteredKeywords = keywordInitialData.filter(item => selectedMedias.includes(item.media))
      const groupedByKeyword = {}
      filteredKeywords.forEach(item => {
        if (!groupedByKeyword[item.keyword]) {
          groupedByKeyword[item.keyword] = {
            keyword: item.keyword,
            media: item.media,
            campaign: item.campaign,
            adGroup: item.adGroup,
            impressions: item.impressions,
            clicks: item.clicks,
            ctr: item.ctr,
            cpc_today: item.cpc_today,
            cpc_yesterday: item.cpc_yesterday,
            cpc_7days: item.cpc_7days,
            cpc_last_week: item.cpc_last_week,
            cost_today: item.cost_today,
            cost_yesterday: item.cost_yesterday,
            cost_7days: item.cost_7days,
            cost_last_week: item.cost_last_week
          }
        } else {
          // 동일 키워드의 경우 광고비 합계
          groupedByKeyword[item.keyword].cost_today += item.cost_today
          groupedByKeyword[item.keyword].cost_yesterday += item.cost_yesterday
          groupedByKeyword[item.keyword].cost_7days += item.cost_7days
          groupedByKeyword[item.keyword].cost_last_week += item.cost_last_week
          // 노출수, 클릭수도 합계
          groupedByKeyword[item.keyword].impressions += item.impressions
          groupedByKeyword[item.keyword].clicks += item.clicks
          // CTR 재계산
          groupedByKeyword[item.keyword].ctr = parseFloat(((groupedByKeyword[item.keyword].clicks / groupedByKeyword[item.keyword].impressions) * 100).toFixed(1))
        }
      })
      
      const finalKeywords = Object.values(groupedByKeyword)
      finalKeywords.sort((a, b) => b.cost_today - a.cost_today)
      setFilteredKeywords(finalKeywords)
    }
  }, [selectedAdvertiser, startDate, endDate, selectedMedias])

  return (
    <div className="content-area">
      
      {/* 필터 영역 */}
      <div style={{ 
        background: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px',
        border: '1px solid #e9ecef',
        marginTop: '20px',
        marginBottom: '20px'
      }}>
        <div style={{ 
          display: 'flex', 
          gap: '15px',
          alignItems: 'flex-start',
          justifyContent: 'space-between'
        }}>
          <div style={{ 
            display: 'flex', 
            gap: '15px',
            alignItems: 'flex-start',
            flex: '1'
        }}>
          {/* 매체 선택 */}
            <div style={{ flex: '0.8' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#495057'
            }}>매체 선택</label>
            <div style={{ 
              display: 'flex', 
              gap: '15px',
              flexWrap: 'wrap' 
            }}>
              {['네이버', '카카오', '구글', '메타', '틱톡'].map(media => (
                <label key={media} style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  color: '#495057'
                }}>
                  <input
                    type="checkbox"
                    checked={selectedMedias.includes(media)}
                    onChange={() => handleMediaChange(media)}
                    style={{ marginRight: '6px' }}
                  />
                  {media}
                </label>
              ))}
            </div>
          </div>

          {/* 조회 날짜 */}
            <div style={{ minWidth: '320px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#495057'
            }}>조회 날짜</label>
            <div style={{ 
              display: 'flex', 
                gap: '8px', 
              alignItems: 'center'
            }}>
              <input
                type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                style={{
                  padding: '6px 8px',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                    width: '140px',
                    height: '34px',
                    boxSizing: 'border-box'
                  }}
                />
                <span style={{ 
                      fontSize: '0.9rem',
                  color: '#6c757d',
                  fontWeight: '500'
                }}>~</span>
                  <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                    style={{
                      padding: '6px 8px',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                    width: '140px',
                      height: '34px',
                      boxSizing: 'border-box'
                    }}
                  />
              </div>
                </div>
              </div>

              {/* 검색 버튼 */}
          <div style={{ 
            display: 'flex',
            alignItems: 'flex-end',
            height: '100%'
          }}>
              <button
                onClick={handleSearch}
                style={{
                  padding: '6px 16px',
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  transition: 'background 0.2s',
                height: '34px',
                boxSizing: 'border-box'
                }}
                onMouseOver={(e) => e.target.style.background = '#218838'}
                onMouseOut={(e) => e.target.style.background = '#28a745'}
              >
                검색
              </button>
            </div>
        </div>
      </div>
      
      {/* 기간별 합산 데이터 */}
      <div style={{ marginTop: '20px' }}>
        <div style={{ 
          background: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid #e9ecef',
          marginBottom: '20px'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#495057' }}>기간별 합산 데이터</h3>
          
          <div>
            {/* 통합 테이블 */}
            <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', border: '1px solid #dee2e6' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#e9ecef' }}>
                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>기간</th>
                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>광고비</th>
                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>CPC</th>
                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>전환수</th>
                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>CPA</th>
                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>CVR</th>
                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>노출수</th>
                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>클릭수</th>
                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>CTR</th>
                  </tr>
                </thead>
                <tbody>
                  {/* 전일 vs 당일 (순서 변경) */}
                  <tr>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600', textAlign: 'center' }}>전일</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{(periodSummary.totalCostYesterday || 0).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{(periodSummary.avgCpcYesterday || 0).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{(periodSummary.totalConversionsYesterday || 0).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{(periodSummary.avgCpaYesterday || 0).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>10.0%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalImpressions || 0) * 0.88).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalClicks || 0) * 0.92).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{(Math.floor((periodSummary.totalClicks || 0) * 0.92) / Math.max(Math.floor((periodSummary.totalImpressions || 0) * 0.88), 1) * 100).toFixed(1)}%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600', textAlign: 'center' }}>당일</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{(periodSummary.totalCostToday || 0).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{(periodSummary.avgCpc || 0).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{(periodSummary.totalConversions || 0).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{(periodSummary.avgCpa || 0).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>12.0%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{(periodSummary.totalImpressions || 0).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{(periodSummary.totalClicks || 0).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{((periodSummary.totalClicks || 0) / Math.max((periodSummary.totalImpressions || 0), 1) * 100).toFixed(1)}%</td>
                  </tr>
                  <tr style={{ background: '#f8f9fa' }}>
                    <td style={{ padding: '8px 10px', fontWeight: '600', color: '#dc3545', textAlign: 'center' }}>등락</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: periodSummary.costChangeRate >= 0 ? '#28a745' : '#dc3545' }}>{periodSummary.costChangeRate >= 0 ? '▲' : '▼'} {Math.abs(periodSummary.costChangeRate || 0).toFixed(1)}%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: periodSummary.cpcChangeRate >= 0 ? '#dc3545' : '#28a745' }}>{periodSummary.cpcChangeRate >= 0 ? '▲' : '▼'} {Math.abs(periodSummary.cpcChangeRate || 0).toFixed(1)}%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: periodSummary.conversionChangeRate >= 0 ? '#28a745' : '#dc3545' }}>{periodSummary.conversionChangeRate >= 0 ? '▲' : '▼'} {Math.abs(periodSummary.conversionChangeRate || 0).toFixed(1)}%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: periodSummary.cpaChangeRate >= 0 ? '#dc3545' : '#28a745' }}>{periodSummary.cpaChangeRate >= 0 ? '▲' : '▼'} {Math.abs(periodSummary.cpaChangeRate || 0).toFixed(1)}%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: '#28a745' }}>▲ 20.0%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: '#28a745' }}>▲ 13.6%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: '#28a745' }}>▲ 8.7%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: periodSummary.ctrChangeRate >= 0 ? '#28a745' : '#dc3545' }}>{periodSummary.ctrChangeRate >= 0 ? '▲' : '▼'} {Math.abs(periodSummary.ctrChangeRate || 0).toFixed(1)}%</td>
                  </tr>
                  
                  {/* 이전 7일 vs 최근 7일 (순서 변경) */}
                  <tr>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600', textAlign: 'center' }}>이전 7일</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>₩{Math.floor((periodSummary.totalCost || 0) * 6.8).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>₩{Math.floor((periodSummary.avgCpc || 0) * 1.12).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalClicks || 0) * 0.75).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>₩{Math.floor((periodSummary.totalCost || 0) * 6.8 / Math.max(Math.floor((periodSummary.totalClicks || 0) * 0.75), 1)).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>10.7%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalImpressions || 0) * 6.2).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalClicks || 0) * 6.5).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{((periodSummary.avgCtr || 0) * 1.05).toFixed(1)}%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600', textAlign: 'center' }}>최근 7일</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>₩{Math.floor((periodSummary.totalCost || 0) * 7.2).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>₩{Math.floor((periodSummary.avgCpc || 0) * 1.03).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalClicks || 0) * 0.86).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>₩{Math.floor((periodSummary.totalCost || 0) * 7.2 / Math.max(Math.floor((periodSummary.totalClicks || 0) * 0.86), 1)).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>12.3%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalImpressions || 0) * 6.9).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalClicks || 0) * 7.0).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{((periodSummary.avgCtr || 0) * 1.01).toFixed(1)}%</td>
                  </tr>
                  <tr style={{ background: '#f8f9fa' }}>
                    <td style={{ padding: '8px 10px', fontWeight: '600', color: '#dc3545', textAlign: 'center' }}>등락</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: (() => {
                      const recent7DaysCost = Math.floor((periodSummary.totalCost || 0) * 7.2);
                      const prev7DaysCost = Math.floor((periodSummary.totalCost || 0) * 6.8);
                      const changeRate = (recent7DaysCost / prev7DaysCost * 100 - 100);
                      return changeRate >= 0 ? '#28a745' : '#dc3545';
                    })() }}>{(() => {
                      const recent7DaysCost = Math.floor((periodSummary.totalCost || 0) * 7.2);
                      const prev7DaysCost = Math.floor((periodSummary.totalCost || 0) * 6.8);
                      const changeRate = (recent7DaysCost / prev7DaysCost * 100 - 100);
                      return (changeRate >= 0 ? '▲' : '▼') + ' ' + Math.abs(changeRate).toFixed(1) + '%';
                    })()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: (() => {
                      const recent7DaysCpc = Math.floor((periodSummary.avgCpc || 0) * 0.95);
                      const prev7DaysCpc = Math.floor((periodSummary.avgCpc || 0) * 1.03);
                      const changeRate = (recent7DaysCpc / prev7DaysCpc * 100 - 100);
                      return changeRate <= 0 ? '#28a745' : '#dc3545';
                    })() }}>{(() => {
                      const recent7DaysCpc = Math.floor((periodSummary.avgCpc || 0) * 0.95);
                      const prev7DaysCpc = Math.floor((periodSummary.avgCpc || 0) * 1.03);
                      const changeRate = (recent7DaysCpc / prev7DaysCpc * 100 - 100);
                      return (changeRate >= 0 ? '▲' : '▼') + ' ' + Math.abs(changeRate).toFixed(1) + '%';
                    })()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: (() => {
                      const recent7DaysConversions = Math.floor((periodSummary.totalClicks || 0) * 7.0 * 0.08);
                      const prev7DaysConversions = Math.floor((periodSummary.totalClicks || 0) * 6.5 * 0.08);
                      const changeRate = (recent7DaysConversions / prev7DaysConversions * 100 - 100);
                      return changeRate >= 0 ? '#28a745' : '#dc3545';
                    })() }}>{(() => {
                      const recent7DaysConversions = Math.floor((periodSummary.totalClicks || 0) * 7.0 * 0.08);
                      const prev7DaysConversions = Math.floor((periodSummary.totalClicks || 0) * 6.5 * 0.08);
                      const changeRate = (recent7DaysConversions / prev7DaysConversions * 100 - 100);
                      return (changeRate >= 0 ? '▲' : '▼') + ' ' + Math.abs(changeRate).toFixed(1) + '%';
                    })()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: (() => {
                      const recent7DaysCpa = Math.floor((periodSummary.totalCost || 0) * 7.2 / Math.max(Math.floor((periodSummary.totalClicks || 0) * 7.0 * 0.08), 1));
                      const prev7DaysCpa = Math.floor((periodSummary.totalCost || 0) * 6.8 / Math.max(Math.floor((periodSummary.totalClicks || 0) * 6.5 * 0.08), 1));
                      const changeRate = (recent7DaysCpa / prev7DaysCpa * 100 - 100);
                      return changeRate <= 0 ? '#28a745' : '#dc3545';
                    })() }}>{(() => {
                      const recent7DaysCpa = Math.floor((periodSummary.totalCost || 0) * 7.2 / Math.max(Math.floor((periodSummary.totalClicks || 0) * 7.0 * 0.08), 1));
                      const prev7DaysCpa = Math.floor((periodSummary.totalCost || 0) * 6.8 / Math.max(Math.floor((periodSummary.totalClicks || 0) * 6.5 * 0.08), 1));
                      const changeRate = (recent7DaysCpa / prev7DaysCpa * 100 - 100);
                      return (changeRate >= 0 ? '▲' : '▼') + ' ' + Math.abs(changeRate).toFixed(1) + '%';
                    })()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: (() => {
                      const recent7DaysCvr = 12.3;
                      const prev7DaysCvr = 11.8;
                      const changeRate = (recent7DaysCvr / prev7DaysCvr * 100 - 100);
                      return changeRate >= 0 ? '#28a745' : '#dc3545';
                    })() }}>{(() => {
                      const recent7DaysCvr = 12.3;
                      const prev7DaysCvr = 11.8;
                      const changeRate = (recent7DaysCvr / prev7DaysCvr * 100 - 100);
                      return (changeRate >= 0 ? '▲' : '▼') + ' ' + Math.abs(changeRate).toFixed(1) + '%';
                    })()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: (() => {
                      const recent7DaysImpressions = Math.floor((periodSummary.totalImpressions || 0) * 6.9);
                      const prev7DaysImpressions = Math.floor((periodSummary.totalImpressions || 0) * 6.2);
                      const changeRate = (recent7DaysImpressions / prev7DaysImpressions * 100 - 100);
                      return changeRate >= 0 ? '#28a745' : '#dc3545';
                    })() }}>{(() => {
                      const recent7DaysImpressions = Math.floor((periodSummary.totalImpressions || 0) * 6.9);
                      const prev7DaysImpressions = Math.floor((periodSummary.totalImpressions || 0) * 6.2);
                      const changeRate = (recent7DaysImpressions / prev7DaysImpressions * 100 - 100);
                      return (changeRate >= 0 ? '▲' : '▼') + ' ' + Math.abs(changeRate).toFixed(1) + '%';
                    })()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: (() => {
                      const recent7DaysClicks = Math.floor((periodSummary.totalClicks || 0) * 7.0);
                      const prev7DaysClicks = Math.floor((periodSummary.totalClicks || 0) * 6.5);
                      const changeRate = (recent7DaysClicks / prev7DaysClicks * 100 - 100);
                      return changeRate >= 0 ? '#28a745' : '#dc3545';
                    })() }}>{(() => {
                      const recent7DaysClicks = Math.floor((periodSummary.totalClicks || 0) * 7.0);
                      const prev7DaysClicks = Math.floor((periodSummary.totalClicks || 0) * 6.5);
                      const changeRate = (recent7DaysClicks / prev7DaysClicks * 100 - 100);
                      return (changeRate >= 0 ? '▲' : '▼') + ' ' + Math.abs(changeRate).toFixed(1) + '%';
                    })()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: (() => {
                      const recent7DaysCtr = (Math.floor((periodSummary.totalClicks || 0) * 7.0) / Math.max(Math.floor((periodSummary.totalImpressions || 0) * 6.9), 1) * 100);
                      const prev7DaysCtr = (Math.floor((periodSummary.totalClicks || 0) * 6.5) / Math.max(Math.floor((periodSummary.totalImpressions || 0) * 6.2), 1) * 100);
                      const changeRate = (recent7DaysCtr / prev7DaysCtr * 100 - 100);
                      return changeRate >= 0 ? '#28a745' : '#dc3545';
                    })() }}>{(() => {
                      const recent7DaysCtr = (Math.floor((periodSummary.totalClicks || 0) * 7.0) / Math.max(Math.floor((periodSummary.totalImpressions || 0) * 6.9), 1) * 100);
                      const prev7DaysCtr = (Math.floor((periodSummary.totalClicks || 0) * 6.5) / Math.max(Math.floor((periodSummary.totalImpressions || 0) * 6.2), 1) * 100);
                      const changeRate = (recent7DaysCtr / prev7DaysCtr * 100 - 100);
                      return (changeRate >= 0 ? '▲' : '▼') + ' ' + Math.abs(changeRate).toFixed(1) + '%';
                    })()}</td>
                  </tr>
                  
                  {/* 전월 vs 당월 (순서 변경) */}
                  <tr>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600', textAlign: 'center' }}>전월</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>₩{Math.floor((periodSummary.totalCost || 0) * 31.2).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>₩{Math.floor((periodSummary.avgCpc || 0) * 1.05).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalClicks || 0) * 3.8).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>₩{Math.floor((periodSummary.totalCost || 0) * 31.2 / Math.max(Math.floor((periodSummary.totalClicks || 0) * 3.8), 1)).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>12.6%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalImpressions || 0) * 32.1).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalClicks || 0) * 30.2).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{(Math.floor((periodSummary.totalClicks || 0) * 30.2) / Math.max(Math.floor((periodSummary.totalImpressions || 0) * 32.1), 1) * 100).toFixed(1)}%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600', textAlign: 'center' }}>당월</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>₩{Math.floor((periodSummary.totalCost || 0) * 28.5).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>₩{Math.floor((periodSummary.avgCpc || 0) * 0.97).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalClicks || 0) * 3.4).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>₩{Math.floor((periodSummary.totalCost || 0) * 28.5 / Math.max(Math.floor((periodSummary.totalClicks || 0) * 3.4), 1)).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>11.3%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalImpressions || 0) * 29.3).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalClicks || 0) * 30.1).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{(Math.floor((periodSummary.totalClicks || 0) * 30.1) / Math.max(Math.floor((periodSummary.totalImpressions || 0) * 29.3), 1) * 100).toFixed(1)}%</td>
                  </tr>
                  <tr style={{ background: '#f8f9fa' }}>
                    <td style={{ padding: '8px 10px', fontWeight: '600', color: '#dc3545', textAlign: 'center' }}>등락</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: (() => {
                      const currentMonthCost = Math.floor((periodSummary.totalCost || 0) * 28.5);
                      const prevMonthCost = Math.floor((periodSummary.totalCost || 0) * 31.2);
                      const changeRate = (currentMonthCost / prevMonthCost * 100 - 100);
                      return changeRate >= 0 ? '#28a745' : '#dc3545';
                    })() }}>{(() => {
                      const currentMonthCost = Math.floor((periodSummary.totalCost || 0) * 28.5);
                      const prevMonthCost = Math.floor((periodSummary.totalCost || 0) * 31.2);
                      const changeRate = (currentMonthCost / prevMonthCost * 100 - 100);
                      return (changeRate >= 0 ? '▲' : '▼') + ' ' + Math.abs(changeRate).toFixed(1) + '%';
                    })()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: (() => {
                      const currentMonthCpc = Math.floor((periodSummary.avgCpc || 0) * 0.97);
                      const prevMonthCpc = Math.floor((periodSummary.avgCpc || 0) * 1.05);
                      const changeRate = (currentMonthCpc / prevMonthCpc * 100 - 100);
                      return changeRate <= 0 ? '#28a745' : '#dc3545';
                    })() }}>{(() => {
                      const currentMonthCpc = Math.floor((periodSummary.avgCpc || 0) * 0.97);
                      const prevMonthCpc = Math.floor((periodSummary.avgCpc || 0) * 1.05);
                      const changeRate = (currentMonthCpc / prevMonthCpc * 100 - 100);
                      return (changeRate >= 0 ? '▲' : '▼') + ' ' + Math.abs(changeRate).toFixed(1) + '%';
                    })()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: (() => {
                      const currentMonthConversions = Math.floor((periodSummary.totalClicks || 0) * 3.4);
                      const prevMonthConversions = Math.floor((periodSummary.totalClicks || 0) * 3.8);
                      const changeRate = (currentMonthConversions / prevMonthConversions * 100 - 100);
                      return changeRate >= 0 ? '#28a745' : '#dc3545';
                    })() }}>{(() => {
                      const currentMonthConversions = Math.floor((periodSummary.totalClicks || 0) * 3.4);
                      const prevMonthConversions = Math.floor((periodSummary.totalClicks || 0) * 3.8);
                      const changeRate = (currentMonthConversions / prevMonthConversions * 100 - 100);
                      return (changeRate >= 0 ? '▲' : '▼') + ' ' + Math.abs(changeRate).toFixed(1) + '%';
                    })()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: (() => {
                      const currentMonthCpa = Math.floor((periodSummary.totalCost || 0) * 28.5 / Math.max(Math.floor((periodSummary.totalClicks || 0) * 3.4), 1));
                      const prevMonthCpa = Math.floor((periodSummary.totalCost || 0) * 31.2 / Math.max(Math.floor((periodSummary.totalClicks || 0) * 3.8), 1));
                      const changeRate = (currentMonthCpa / prevMonthCpa * 100 - 100);
                      return changeRate <= 0 ? '#28a745' : '#dc3545';
                    })() }}>{(() => {
                      const currentMonthCpa = Math.floor((periodSummary.totalCost || 0) * 28.5 / Math.max(Math.floor((periodSummary.totalClicks || 0) * 3.4), 1));
                      const prevMonthCpa = Math.floor((periodSummary.totalCost || 0) * 31.2 / Math.max(Math.floor((periodSummary.totalClicks || 0) * 3.8), 1));
                      const changeRate = (currentMonthCpa / prevMonthCpa * 100 - 100);
                      return (changeRate >= 0 ? '▲' : '▼') + ' ' + Math.abs(changeRate).toFixed(1) + '%';
                    })()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: (() => {
                      const currentMonthCvr = 11.3;
                      const prevMonthCvr = 12.6;
                      const changeRate = (currentMonthCvr / prevMonthCvr * 100 - 100);
                      return changeRate >= 0 ? '#28a745' : '#dc3545';
                    })() }}>{(() => {
                      const currentMonthCvr = 11.3;
                      const prevMonthCvr = 12.6;
                      const changeRate = (currentMonthCvr / prevMonthCvr * 100 - 100);
                      return (changeRate >= 0 ? '▲' : '▼') + ' ' + Math.abs(changeRate).toFixed(1) + '%';
                    })()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: (() => {
                      const currentMonthImpressions = Math.floor((periodSummary.totalImpressions || 0) * 29.3);
                      const prevMonthImpressions = Math.floor((periodSummary.totalImpressions || 0) * 32.1);
                      const changeRate = (currentMonthImpressions / prevMonthImpressions * 100 - 100);
                      return changeRate >= 0 ? '#28a745' : '#dc3545';
                    })() }}>{(() => {
                      const currentMonthImpressions = Math.floor((periodSummary.totalImpressions || 0) * 29.3);
                      const prevMonthImpressions = Math.floor((periodSummary.totalImpressions || 0) * 32.1);
                      const changeRate = (currentMonthImpressions / prevMonthImpressions * 100 - 100);
                      return (changeRate >= 0 ? '▲' : '▼') + ' ' + Math.abs(changeRate).toFixed(1) + '%';
                    })()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: (() => {
                      const currentMonthClicks = Math.floor((periodSummary.totalClicks || 0) * 30.1);
                      const prevMonthClicks = Math.floor((periodSummary.totalClicks || 0) * 30.2);
                      const changeRate = (currentMonthClicks / prevMonthClicks * 100 - 100);
                      return changeRate >= 0 ? '#28a745' : '#dc3545';
                    })() }}>{(() => {
                      const currentMonthClicks = Math.floor((periodSummary.totalClicks || 0) * 30.1);
                      const prevMonthClicks = Math.floor((periodSummary.totalClicks || 0) * 30.2);
                      const changeRate = (currentMonthClicks / prevMonthClicks * 100 - 100);
                      return (changeRate >= 0 ? '▲' : '▼') + ' ' + Math.abs(changeRate).toFixed(1) + '%';
                    })()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: (() => {
                      const currentMonthCtr = (Math.floor((periodSummary.totalClicks || 0) * 30.1) / Math.max(Math.floor((periodSummary.totalImpressions || 0) * 29.3), 1) * 100);
                      const prevMonthCtr = (Math.floor((periodSummary.totalClicks || 0) * 30.2) / Math.max(Math.floor((periodSummary.totalImpressions || 0) * 32.1), 1) * 100);
                      const changeRate = (currentMonthCtr / prevMonthCtr * 100 - 100);
                      return changeRate >= 0 ? '#28a745' : '#dc3545';
                    })() }}>{(() => {
                      const currentMonthCtr = (Math.floor((periodSummary.totalClicks || 0) * 30.1) / Math.max(Math.floor((periodSummary.totalImpressions || 0) * 29.3), 1) * 100);
                      const prevMonthCtr = (Math.floor((periodSummary.totalClicks || 0) * 30.2) / Math.max(Math.floor((periodSummary.totalImpressions || 0) * 32.1), 1) * 100);
                      const changeRate = (currentMonthCtr / prevMonthCtr * 100 - 100);
                      return (changeRate >= 0 ? '▲' : '▼') + ' ' + Math.abs(changeRate).toFixed(1) + '%';
                    })()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div style={{ 
          background: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid #e9ecef' 
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '15px' 
          }}>
            <h3 style={{ margin: 0, color: '#495057' }}>일자별 상세 데이터</h3>
            <div style={{ textAlign: 'right' }}>
              <span style={{ 
                fontSize: '0.9rem', 
                color: '#6c757d',
                fontStyle: 'italic',
                display: 'block'
              }}>
                일자를 클릭하면 매체별 비교가 가능합니다.
              </span>
              <span style={{ 
                fontSize: '0.8rem', 
                color: '#6c757d',
                fontWeight: '600'
              }}>
                총 {filteredDailyData.length}일 데이터
              </span>
            </div>
          </div>
          
          {filteredDailyData.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px',
              color: '#6c757d',
              background: 'white',
              borderRadius: '6px',
              border: '1px dashed #dee2e6'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📅</div>
              <h4 style={{ margin: '0 0 8px 0', color: '#495057' }}>선택한 기간에 데이터가 없습니다</h4>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>
                다른 기간을 선택해주세요.
              </p>
            </div>
          ) : (
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#e9ecef' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>일자</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>광고비</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>CPC</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>전환수</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>CPA</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>CVR</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>노출수</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>클릭수</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>CTR</th>
                </tr>
              </thead>
              <tbody onClick={handleOutsideClick}>
                {filteredDailyData.map((item, index) => {
                  const isEvenRow = index % 2 === 0
                  const backgroundColor = isEvenRow ? 'white' : '#f8f9fa'
                  
                  return (
                    <React.Fragment key={index}>
                      <tr 
                        style={{ 
                          background: backgroundColor,
                          borderLeft: index % 2 === 0 ? '3px solid #667eea' : '3px solid #28a745',
                          cursor: 'pointer'
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDateRowClick(index, item.date)
                        }}
                      >
                        <td style={{ 
                          padding: '12px', 
                          borderBottom: '1px solid #dee2e6',
                          fontWeight: '600',
                          color: '#495057'
                        }}>
                          {item.date}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>
                          {item.cost.toLocaleString()}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>
                          {item.cpc.toLocaleString()}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>
                          {item.conversions.toLocaleString()}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>
                          {item.cpa.toLocaleString()}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>
                          {item.cvr}%
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>
                          {item.impressions.toLocaleString()}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>
                          {item.clicks.toLocaleString()}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>
                          {item.ctr}%
                        </td>
                      </tr>
                      
                      {/* 일자 행 클릭 시 나타나는 매체별 세부 데이터 */}
                      {selectedDateIndex === index && (
                        expandedDateData.map((mediaItem, mediaIndex) => (
                          <tr key={`${index}-${mediaIndex}`} style={{ 
                            background: '#f0f8ff', 
                            borderLeft: '3px solid #ffc107',
                            animation: 'slideDown 0.3s ease-out'
                          }}>
                            <td style={{ 
                              padding: '8px 12px', 
                              borderBottom: '1px solid #dee2e6',
                              fontWeight: '500',
                              color: '#6c757d',
                              paddingLeft: '20px'
                            }}>
                              └ {mediaItem.media}
                            </td>
                            <td style={{ 
                              padding: '8px 12px', 
                              textAlign: 'right', 
                              borderBottom: '1px solid #dee2e6',
                              color: '#6c757d'
                            }}>
                              {mediaItem.cost.toLocaleString()}
                            </td>
                            <td style={{ 
                              padding: '8px 12px', 
                              textAlign: 'right', 
                              borderBottom: '1px solid #dee2e6',
                              color: '#6c757d'
                            }}>
                              {mediaItem.cpc.toLocaleString()}
                            </td>
                            <td style={{ 
                              padding: '8px 12px', 
                              textAlign: 'right', 
                              borderBottom: '1px solid #dee2e6',
                              color: '#6c757d'
                            }}>
                              {mediaItem.conversions.toLocaleString()}
                            </td>
                            <td style={{ 
                              padding: '8px 12px', 
                              textAlign: 'right', 
                              borderBottom: '1px solid #dee2e6',
                              color: '#6c757d'
                            }}>
                              {mediaItem.cpa.toLocaleString()}
                            </td>
                            <td style={{ 
                              padding: '8px 12px', 
                              textAlign: 'right', 
                              borderBottom: '1px solid #dee2e6',
                              color: '#6c757d'
                            }}>
                              {mediaItem.cvr}%
                            </td>
                            <td style={{ 
                              padding: '8px 12px', 
                              textAlign: 'right', 
                              borderBottom: '1px solid #dee2e6',
                              color: '#6c757d'
                            }}>
                              {mediaItem.impressions.toLocaleString()}
                            </td>
                            <td style={{ 
                              padding: '8px 12px', 
                              textAlign: 'right', 
                              borderBottom: '1px solid #dee2e6',
                              color: '#6c757d'
                            }}>
                              {mediaItem.clicks.toLocaleString()}
                            </td>
                            <td style={{ 
                              padding: '8px 12px', 
                              textAlign: 'right', 
                              borderBottom: '1px solid #dee2e6',
                              color: '#6c757d'
                            }}>
                              {mediaItem.ctr}%
                            </td>
                          </tr>
                        ))
                      )}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
          )}
        </div>

      </div>
    </div>
  )
}

function KeywordDataContent() {
  const { selectedAdvertiser } = useAuth()
  
  // 어제 날짜 계산 (로컬 시간 기준)
  const yesterday = utils.getDateOffset(1)
  
  // 필터 상태 관리
  const [selectedMedias, setSelectedMedias] = useState(['네이버', '카카오', '구글', '메타', '틱톡'])
  const [keywordMetric, setKeywordMetric] = useState('광고비')
  const [sortOrder, setSortOrder] = useState('내림차순')
  const [keywordCount, setKeywordCount] = useState('')
  const [selectedDate, setSelectedDate] = useState(utils.formatDate(yesterday))
  const [costRangeMin, setCostRangeMin] = useState('')
  const [costRangeMax, setCostRangeMax] = useState('')
  
  // 검색 결과 상태 관리
  const [filteredKeywords, setFilteredKeywords] = useState([])
  const [keywordData, setKeywordData] = useState([])
  const [periodSummary, setPeriodSummary] = useState({
    totalCostToday: 0,
    totalCostYesterday: 0,
    totalCost7Days: 0,
    totalCostPrev7Days: 0,
    totalCostCurrentMonth: 0,
    totalCostPrevMonth: 0,
    avgCpcToday: 0,
    avgCpcYesterday: 0,
    avgCpc7Days: 0,
    avgCpcPrev7Days: 0,
    avgCpcCurrentMonth: 0,
    avgCpcPrevMonth: 0,
    totalConversionsToday: 0,
    totalConversionsYesterday: 0,
    totalConversions7Days: 0,
    totalConversionsPrev7Days: 0,
    totalConversionsCurrentMonth: 0,
    totalConversionsPrevMonth: 0,
    avgCpaToday: 0,
    avgCpaYesterday: 0,
    avgCpa7Days: 0,
    avgCpaPrev7Days: 0,
    avgCpaCurrentMonth: 0,
    avgCpaPrevMonth: 0
  })
  
  // 키워드 행 선택 및 슬라이드 상태 관리
  const [selectedKeywordIndex, setSelectedKeywordIndex] = useState(null)
  const [expandedKeywordData, setExpandedKeywordData] = useState([])
  
  // 상세 데이터 필터 및 페이지네이션 상태
  const [selectedDataFilters, setSelectedDataFilters] = useState(['광고비', 'CPC'])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [horizontalScrollPosition, setHorizontalScrollPosition] = useState(0)
  
  // 스크롤바 동기화를 위한 ref
  const topScrollRef = useRef(null)
  const tableScrollRef = useRef(null)
  
  // 상단 스크롤바와 테이블 스크롤 동기화
  const handleTopScroll = () => {
    if (topScrollRef.current && tableScrollRef.current) {
      tableScrollRef.current.scrollLeft = topScrollRef.current.scrollLeft
    }
  }
  
  const handleTableScroll = () => {
    if (topScrollRef.current && tableScrollRef.current) {
      topScrollRef.current.scrollLeft = tableScrollRef.current.scrollLeft
    }
  }
  
  if (!selectedAdvertiser) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '400px' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}></div>
          <h3 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '600', 
            color: '#2c3e50', 
            marginBottom: '10px' 
          }}>
            광고주를 선택해주세요
          </h3>
          <p style={{ color: '#6c757d' }}>
            상단 네비게이션에서 광고주를 선택하면 키워드별 데이터를 확인할 수 있습니다.
          </p>
        </div>
      </div>
    )
  }

  // 매체 선택 처리
  const handleMediaChange = (media) => {
    setSelectedMedias(prev => {
      if (prev.includes(media)) {
        // 최소 1개는 선택되어야 함
        if (prev.length > 1) {
          return prev.filter(m => m !== media)
        }
        return prev
      } else {
        return [...prev, media]
      }
    })
  }

  // 검색 실행
  const handleSearch = () => {
    const results = getFilteredKeywords()
    setFilteredKeywords(results)
    
    // 기간별 요약 정보 계산
    const summary = calculateKeywordPeriodSummary(results)
    setPeriodSummary(summary)
    
    // 검색 시 확장된 키워드 정보 초기화
    setSelectedKeywordIndex(null)
    setExpandedKeywordData([])
    
    // 첫 번째 페이지로 이동
    setCurrentPage(1)
  }

  // 키워드 행 클릭 처리
  const handleKeywordRowClick = (index, keyword) => {
    if (selectedKeywordIndex === index) {
      setSelectedKeywordIndex(null)
      setExpandedKeywordData([])
    } else {
      setSelectedKeywordIndex(index)
      
      // 해당 키워드의 모든 매체 데이터를 실제 데이터에서 찾아서 가져오기
      const keywordSpecificData = keywordData.filter(item => item.keyword === keyword)
      
      // 확장된 데이터 생성
      const expandedData = keywordSpecificData.map(item => ({
        ...generateExpandedKeywordData(item),
        isExpanded: true
      }))
      
      setExpandedKeywordData(expandedData)
    }
  }

  // 외부 클릭 처리
  const handleOutsideClick = (event) => {
    // 테이블 행을 클릭한 경우가 아닐 때만 닫기
    if (!event.target.closest('.keyword-table-row')) {
      setSelectedKeywordIndex(null)
      setExpandedKeywordData([])
    }
  }

  // 문서 전체에 클릭 이벤트 리스너 추가
  useEffect(() => {
    const handleDocumentClick = (event) => {
      handleOutsideClick(event)
    }
    
    document.addEventListener('click', handleDocumentClick)
    return () => {
      document.removeEventListener('click', handleDocumentClick)
    }
  }, [])

  // 일자별 데이터 생성
  const generateDailyData = () => {
    const data = []
    for (let i = 0; i < 30; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      data.push({
        date: date.toISOString().split('T')[0],
        impressions: Math.floor(Math.random() * 50000) + 10000,
        clicks: Math.floor(Math.random() * 2000) + 500,
        conversions: Math.floor(Math.random() * 100) + 20,
        cpc: Math.floor(Math.random() * 2000) + 300,
        cost: Math.floor(Math.random() * 500000) + 100000
      })
    }
    return data
  }

  // 컴포넌트 마운트 시 데이터 생성
  useEffect(() => {
    // 기본 데이터 생성 (페이지 진입 시 바로 표시)
    const data = generateKeywordData()
    setKeywordData(data)
    
    // 기본 검색 실행하여 초기 데이터 표시
    const results = data.filter(item => selectedMedias.includes(item.media))
    setFilteredKeywords(results)
    
    // 기간별 요약 정보 계산
    const summary = calculateKeywordPeriodSummary(results)
    setPeriodSummary(summary)
  }, [])

  // 키워드 데이터 생성
  const generateKeywordData = () => {
    const keywordTemplates = [
      { keyword: '브랜드명', category: '브랜드', priority: 1 },
      { keyword: '제품명', category: '제품', priority: 2 },
      { keyword: '카테고리', category: '카테고리', priority: 3 },
      { keyword: '경쟁사', category: '브랜드', priority: 4 },
      { keyword: '일반키워드', category: '일반', priority: 5 },
      { keyword: '롱테일키워드', category: '일반', priority: 6 },
      { keyword: '상품후기', category: '정보', priority: 7 },
      { keyword: '가격비교', category: '구매', priority: 8 },
      { keyword: '이벤트', category: '프로모션', priority: 9 },
      { keyword: '할인', category: '프로모션', priority: 10 },
      { keyword: '챌린지', category: '트렌드', priority: 11 },
      { keyword: '댄스', category: '트렌드', priority: 12 },
      { keyword: '트렌드', category: '트렌드', priority: 13 },
      { keyword: '바이럴', category: '트렌드', priority: 14 },
      { keyword: '인플루언서', category: '트렌드', priority: 15 }
    ]
    
    const mediaList = ['네이버', '카카오', '구글', '메타', '틱톡']
    const data = []
    
    keywordTemplates.forEach(template => {
      mediaList.forEach(media => {
        // 틱톡 전용 키워드는 틱톡에만 적용
        if (template.category === '트렌드' && media !== '틱톡') return
        
        const mediaConfig = getMediaBaseData(media)
        const baseImpressions = Math.floor(mediaConfig.baseImpressions * utils.randomBetween(0.8, 1.5))
        
        const performanceToday = generatePerformanceData({
          baseImpressions,
          platform: media.toLowerCase(),
          dateString: utils.formatDate(new Date()),
          advertiserName: selectedAdvertiser?.name || 'A광고주'
        })
        
        const performanceYesterday = generatePerformanceData({
          baseImpressions: Math.floor(baseImpressions * utils.randomBetween(0.9, 1.1)),
          platform: media.toLowerCase(),
          dateString: utils.formatDate(utils.getDateOffset(1)),
          advertiserName: selectedAdvertiser?.name || 'A광고주'
        })
        
        const performance7Days = generatePerformanceData({
          baseImpressions: Math.floor(baseImpressions * utils.randomBetween(6.5, 7.5)),
          platform: media.toLowerCase(),
          dateString: utils.formatDate(utils.getDateOffset(7)),
          advertiserName: selectedAdvertiser?.name || 'A광고주'
        })
        
        const performanceLastWeek = generatePerformanceData({
          baseImpressions: Math.floor(baseImpressions * utils.randomBetween(6.0, 7.0)),
          platform: media.toLowerCase(),
          dateString: utils.formatDate(utils.getDateOffset(14)),
          advertiserName: selectedAdvertiser?.name || 'A광고주'
        })
        
        data.push({
          keyword: template.keyword,
          media,
          campaign: `${media} ${template.category} 캠페인`,
          adGroup: `${media} ${template.category} 키워드`,
          impressions: performanceToday.impressions,
          clicks: performanceToday.clicks,
          ctr: performanceToday.ctr,
          cpc_today: performanceToday.cpc,
          cpc_yesterday: performanceYesterday.cpc,
          cpc_7days: performance7Days.cpc,
          cpc_last_week: performanceLastWeek.cpc,
          cost_today: performanceToday.cost,
          cost_yesterday: performanceYesterday.cost,
          cost_7days: performance7Days.cost,
          cost_last_week: performanceLastWeek.cost,
          conversions: performanceToday.conversions,
          priority: template.priority
        })
      })
    })
    
    return data.sort((a, b) => a.priority - b.priority)
  }

  // 키워드 데이터 필터링 및 정렬
  const getFilteredKeywords = () => {
    let filtered = [...keywordData]
    
    // 선택된 매체로 필터링
    filtered = filtered.filter(item => selectedMedias.includes(item.media))
    
    // 키워드별로 그룹화하고 광고비 합계 계산
    const groupedByKeyword = {}
    filtered.forEach(item => {
      if (!groupedByKeyword[item.keyword]) {
        groupedByKeyword[item.keyword] = {
          keyword: item.keyword,
          media: item.media,
          campaign: item.campaign,
          adGroup: item.adGroup,
          impressions: item.impressions,
          clicks: item.clicks,
          ctr: item.ctr,
          cpc_today: item.cpc_today,
          cpc_yesterday: item.cpc_yesterday,
          cpc_7days: item.cpc_7days,
          cpc_last_week: item.cpc_last_week,
          cost_today: item.cost_today,
          cost_yesterday: item.cost_yesterday,
          cost_7days: item.cost_7days,
          cost_last_week: item.cost_last_week
        }
      } else {
        // 키워드가 이미 존재하면 광고비 합계 계산
        groupedByKeyword[item.keyword].impressions += item.impressions
        groupedByKeyword[item.keyword].clicks += item.clicks
        groupedByKeyword[item.keyword].cost_today += item.cost_today
        groupedByKeyword[item.keyword].cost_yesterday += item.cost_yesterday
        groupedByKeyword[item.keyword].cost_7days += item.cost_7days
        groupedByKeyword[item.keyword].cost_last_week += item.cost_last_week
      }
    })
    
    // 그룹화된 데이터를 배열로 변환
    let result = Object.values(groupedByKeyword)
    
    // CPC 선택 시 광고비 범위 필터링
    if (keywordMetric === 'CPC') {
      if (costRangeMin && !isNaN(costRangeMin)) {
        result = result.filter(item => item.cost_today >= parseInt(costRangeMin))
      }
      if (costRangeMax && !isNaN(costRangeMax)) {
        result = result.filter(item => item.cost_today <= parseInt(costRangeMax))
      }
    }
    
    // 정렬 기준에 따라 정렬
    if (keywordMetric === '광고비') {
      result.sort((a, b) => {
        const aValue = a.cost_today + a.cost_yesterday + a.cost_7days + a.cost_last_week
        const bValue = b.cost_today + b.cost_yesterday + b.cost_7days + b.cost_last_week
        return sortOrder === '내림차순' ? bValue - aValue : aValue - bValue
      })
    } else if (keywordMetric === '클릭수') {
      result.sort((a, b) => {
        return sortOrder === '내림차순' ? b.clicks - a.clicks : a.clicks - b.clicks
      })
    } else if (keywordMetric === 'CPC') {
      result.sort((a, b) => {
        return sortOrder === '내림차순' ? b.cpc_today - a.cpc_today : a.cpc_today - b.cpc_today
      })
    }
    
    // 키워드 개수 제한 적용
    if (keywordCount && parseInt(keywordCount) > 0) {
      result = result.slice(0, parseInt(keywordCount))
    }
    
    return result
  }

  // 컴포넌트 마운트 시 데이터 생성
  useEffect(() => {
    // 기본 데이터 생성 (페이지 진입 시 바로 표시)
    const data = generateKeywordData()
    setKeywordData(data)
    
    // 기본 검색 실행하여 초기 데이터 표시
    const results = data.filter(item => selectedMedias.includes(item.media))
    setFilteredKeywords(results)
    
    // 기간별 요약 정보 계산
    const summary = calculateKeywordPeriodSummary(results)
    setPeriodSummary(summary)
  }, [])

  // 키워드 데이터용 기간별 합산 정보 계산
  const calculateKeywordPeriodSummary = (data) => {
    if (!data || data.length === 0) {
      const defaultData = {
        totalImpressions: 320000,
        totalClicks: 16000,
        totalCost: 2400000,  // 기본값에 totalCost 추가
        totalCostToday: 2400000,
        totalCostYesterday: 2208000,
        totalCost7Days: 16800000,
        totalCostLastWeek: 15840000,
        avgCtr: 5.0,
        avgCpc: 150,
        avgCpa: 1250
      }
      
      return {
        ...defaultData,
        totalConversions: Math.floor(defaultData.totalClicks * 0.12),
        totalConversionsYesterday: Math.floor(defaultData.totalClicks * 0.10),
        avgCtrYesterday: parseFloat((defaultData.avgCtr * 0.96).toFixed(1)),
        avgCpcYesterday: Math.floor(defaultData.avgCpc * 1.08),
        avgCpaYesterday: Math.floor(defaultData.avgCpa * 1.12),
        // 등락률
        costChangeRate: 8.7,
        cpcChangeRate: -7.4,
        conversionChangeRate: 20.0,
        cpaChangeRate: -10.7,
        ctrChangeRate: 4.2
      }
    }
    
    const totalImpressions = data.reduce((sum, item) => sum + item.impressions, 0)
    const totalClicks = data.reduce((sum, item) => sum + item.clicks, 0)
    const totalCostToday = data.reduce((sum, item) => sum + item.cost_today, 0)
    const totalCostYesterday = data.reduce((sum, item) => sum + item.cost_yesterday, 0)
    const totalCost7Days = data.reduce((sum, item) => sum + item.cost_7days, 0)
    const totalCostLastWeek = data.reduce((sum, item) => sum + item.cost_last_week, 0)
    
    const totalConversions = Math.floor(totalClicks * 0.12) // 전환수는 클릭수의 12%로 가정
    const totalConversionsYesterday = Math.floor(totalClicks * 0.10) // 어제는 10%로 가정
    
    // 평균 CTR 계산 (전체 클릭수 / 전체 노출수)
    const avgCtr = totalImpressions > 0 ? parseFloat(((totalClicks / totalImpressions) * 100).toFixed(1)) : 0
    const avgCtrYesterday = totalImpressions > 0 ? parseFloat(((totalClicks * 0.96 / totalImpressions) * 100).toFixed(1)) : 0
    
    // 평균 CPC 계산 (전체 광고비 / 전체 클릭수)
    const avgCpc = totalClicks > 0 ? Math.round(totalCostToday / totalClicks) : 0
    const avgCpcYesterday = totalClicks > 0 ? Math.round(totalCostYesterday / totalClicks) : 0
    
    // 평균 CPA 계산 (전체 광고비 / 전체 전환수)
    const avgCpa = totalConversions > 0 ? Math.round(totalCostToday / totalConversions) : 0
    const avgCpaYesterday = totalConversionsYesterday > 0 ? Math.round(totalCostYesterday / totalConversionsYesterday) : 0
    
    // 실제 등락률 계산
    const costChangeRate = totalCostYesterday > 0 ? ((totalCostToday - totalCostYesterday) / totalCostYesterday * 100) : 0
    const cpcChangeRate = avgCpcYesterday > 0 ? ((avgCpc - avgCpcYesterday) / avgCpcYesterday * 100) : 0
    const conversionChangeRate = totalConversionsYesterday > 0 ? ((totalConversions - totalConversionsYesterday) / totalConversionsYesterday * 100) : 0
    const cpaChangeRate = avgCpaYesterday > 0 ? ((avgCpa - avgCpaYesterday) / avgCpaYesterday * 100) : 0
    const ctrChangeRate = avgCtrYesterday > 0 ? ((avgCtr - avgCtrYesterday) / avgCtrYesterday * 100) : 0
    
    return {
      totalImpressions,
      totalClicks,
      totalCost: totalCostToday,  // totalCost 필드 추가
      totalCostToday,
      totalCostYesterday,
      totalCost7Days,
      totalCostLastWeek,
      totalConversions,
      totalConversionsYesterday,
      avgCtr,
      avgCtrYesterday,
      avgCpc,
      avgCpcYesterday,
      avgCpa,
      avgCpaYesterday,
      costChangeRate,
      cpcChangeRate,
      conversionChangeRate,
      cpaChangeRate,
      ctrChangeRate
    }
  }

  // 상세 데이터 테이블 컬럼 정의
  const getDetailedColumns = () => {
    const allColumns = [
      { key: 'media', title: '매체', group: 'basic', width: '80px' },
      { key: 'keyword', title: '키워드(소재)', group: 'basic', width: '120px' },
      { key: 'cost_today', title: '당일(광고비)', group: '광고비', width: '100px' },
      { key: 'cost_yesterday', title: '전일(광고비)', group: '광고비', width: '100px' },
      { key: 'cost_7days', title: '최근 7일(광고비)', group: '광고비', width: '110px' },
      { key: 'cost_prev7days', title: '이전 7일(광고비)', group: '광고비', width: '110px' },
      { key: 'cost_currentMonth', title: '당월(광고비)', group: '광고비', width: '100px' },
      { key: 'cost_prevMonth', title: '전월(광고비)', group: '광고비', width: '100px' },
      { key: 'cpc_today', title: '당일(CPC)', group: 'CPC', width: '90px' },
      { key: 'cpc_yesterday', title: '전일(CPC)', group: 'CPC', width: '90px' },
      { key: 'cpc_7days', title: '최근 7일(CPC)', group: 'CPC', width: '100px' },
      { key: 'cpc_prev7days', title: '이전 7일(CPC)', group: 'CPC', width: '100px' },
      { key: 'cpc_currentMonth', title: '당월(CPC)', group: 'CPC', width: '90px' },
      { key: 'cpc_prevMonth', title: '전월(CPC)', group: 'CPC', width: '90px' },
      { key: 'conversions_today', title: '당일(전환수)', group: '전환수', width: '90px' },
      { key: 'conversions_yesterday', title: '전일(전환수)', group: '전환수', width: '90px' },
      { key: 'conversions_7days', title: '최근 7일(전환수)', group: '전환수', width: '110px' },
      { key: 'conversions_prev7days', title: '이전 7일(전환수)', group: '전환수', width: '110px' },
      { key: 'conversions_currentMonth', title: '당월(전환수)', group: '전환수', width: '90px' },
      { key: 'conversions_prevMonth', title: '전월(전환수)', group: '전환수', width: '90px' },
      { key: 'cpa_today', title: '당일(CPA)', group: 'CPA', width: '90px' },
      { key: 'cpa_yesterday', title: '전일(CPA)', group: 'CPA', width: '90px' },
      { key: 'cpa_7days', title: '최근 7일(CPA)', group: 'CPA', width: '100px' },
      { key: 'cpa_prev7days', title: '이전 7일(CPA)', group: 'CPA', width: '100px' },
      { key: 'cpa_currentMonth', title: '당월(CPA)', group: 'CPA', width: '90px' },
      { key: 'cpa_prevMonth', title: '전월(CPA)', group: 'CPA', width: '90px' },
      { key: 'cvr', title: 'CVR', group: '기타', width: '70px' },
      { key: 'campaign', title: '캠페인', group: '기타', width: '120px' },
      { key: 'adGroup', title: '광고그룹', group: '기타', width: '120px' },
      { key: 'impressions', title: '노출수', group: '기타', width: '90px' },
      { key: 'clicks', title: '클릭수', group: '기타', width: '80px' },
      { key: 'ctr', title: 'CTR', group: '기타', width: '70px' }
    ]

    // 선택된 필터에 따라 컬럼 필터링
    const filteredColumns = allColumns.filter(col => 
      col.group === 'basic' || selectedDataFilters.includes(col.group)
    )

    return filteredColumns // 모든 컬럼 표시
  }

  // 확장된 키워드 데이터 생성 (새로운 컬럼 구조에 맞게)
  const generateExpandedKeywordData = (item) => {
    return {
      ...item,
      cost_prev7days: Math.floor(item.cost_7days * 0.92),
      cost_currentMonth: Math.floor(item.cost_today * 25),
      cost_prevMonth: Math.floor(item.cost_today * 28),
      cpc_prev7days: Math.floor(item.cpc_7days * 1.05),
      cpc_currentMonth: Math.floor(item.cpc_today * 0.98),
      cpc_prevMonth: Math.floor(item.cpc_today * 1.06),
      conversions_today: Math.floor(item.clicks * 0.08),
      conversions_yesterday: Math.floor(item.clicks * 0.07),
      conversions_7days: Math.floor(item.clicks * 0.56),
      conversions_prev7days: Math.floor(item.clicks * 0.52),
      conversions_currentMonth: Math.floor(item.clicks * 2.4),
      conversions_prevMonth: Math.floor(item.clicks * 2.2),
      cpa_today: Math.floor(item.cost_today / Math.max(Math.floor(item.clicks * 0.08), 1)),
      cpa_yesterday: Math.floor(item.cost_yesterday / Math.max(Math.floor(item.clicks * 0.07), 1)),
      cpa_7days: Math.floor(item.cost_7days / Math.max(Math.floor(item.clicks * 0.56), 1)),
      cpa_prev7days: Math.floor((item.cost_7days * 0.92) / Math.max(Math.floor(item.clicks * 0.52), 1)),
      cpa_currentMonth: Math.floor((item.cost_today * 25) / Math.max(Math.floor(item.clicks * 2.4), 1)),
      cpa_prevMonth: Math.floor((item.cost_today * 28) / Math.max(Math.floor(item.clicks * 2.2), 1)),
      cvr: ((Math.floor(item.clicks * 0.08) / item.clicks) * 100).toFixed(1) + '%'
    }
  }

  // 페이지네이션된 데이터 반환
  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredKeywords.slice(startIndex, endIndex).map(generateExpandedKeywordData)
  }

  // 총 페이지 수 계산
  const getTotalPages = () => {
    return Math.ceil(filteredKeywords.length / itemsPerPage)
  }

  // 페이지 변경 핸들러
  const handlePageChange = (page) => {
    setCurrentPage(page)
    // 페이지 변경 시 확장된 키워드 정보 초기화
    setSelectedKeywordIndex(null)
    setExpandedKeywordData([])
  }

  // 필터 변경 핸들러
  const handleFilterChange = (filter) => {
    setSelectedDataFilters(prev => {
      if (prev.includes(filter)) {
        return prev.filter(f => f !== filter)
      } else {
        return [...prev, filter]
      }
    })
  }

  return (
    <div className="content-area">
      {/* 필터 영역 */}
      <div style={{ 
        background: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px',
        border: '1px solid #e9ecef',
        marginTop: '20px',
        marginBottom: '20px'
      }}>
        <div style={{ 
          display: 'flex', 
          gap: '15px',
          alignItems: 'flex-start'
        }}>
          {/* 매체 선택 */}
          <div style={{ flex: '1' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#495057'
            }}>매체 선택</label>
            <div style={{ 
              display: 'flex', 
              gap: '15px',
              flexWrap: 'wrap' 
            }}>
              {['네이버', '카카오', '구글', '메타', '틱톡'].map(media => (
                <label key={media} style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  color: '#495057'
                }}>
                  <input
                    type="checkbox"
                    checked={selectedMedias.includes(media)}
                    onChange={() => handleMediaChange(media)}
                    style={{ marginRight: '6px' }}
                  />
                  {media}
                </label>
              ))}
            </div>
          </div>

          {/* 조회 날짜 */}
          <div style={{ minWidth: '160px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#495057'
            }}>조회 날짜</label>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center'
            }}>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{
                  padding: '6px 8px',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                  width: '140px'
                }}
              />
            </div>
          </div>
          
          {/* 키워드 필터링 */}
          <div style={{ flex: '2' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#495057'
            }}>키워드 필터링</label>
            <div style={{ 
              display: 'flex', 
              gap: '15px',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{
                display: 'flex',
                gap: '15px',
                alignItems: 'center'
              }}>
                {/* 지표 선택 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '0.9rem', color: '#6c757d', minWidth: '30px' }}>지표</label>
                  <select 
                    value={keywordMetric} 
                    onChange={(e) => setKeywordMetric(e.target.value)}
                    style={{
                      padding: '6px 8px',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      width: '100px',
                      height: '34px'
                    }}
                  >
                    <option value="클릭수">클릭수</option>
                    <option value="CPC">CPC</option>
                    <option value="광고비">광고비</option>
                  </select>
                </div>
                
                {/* 정렬 선택 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '0.9rem', color: '#6c757d', minWidth: '30px' }}>정렬</label>
                  <select 
                    value={sortOrder} 
                    onChange={(e) => setSortOrder(e.target.value)}
                    style={{
                      padding: '6px 8px',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      width: '100px',
                      height: '34px'
                    }}
                  >
                    <option value="내림차순">내림차순</option>
                    <option value="오름차순">오름차순</option>
                  </select>
                </div>
                
                {/* 개수 입력 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '0.9rem', color: '#6c757d', minWidth: '30px' }}>개수</label>
                  <input
                    type="number"
                    value={keywordCount}
                    onChange={(e) => setKeywordCount(e.target.value)}
                    placeholder="전체"
                    min="1"
                    style={{
                      padding: '6px 8px',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      width: '100px',
                      height: '34px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* 검색 버튼 */}
              <button
                onClick={handleSearch}
                style={{
                  padding: '6px 16px',
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  transition: 'background 0.2s',
                  height: '34px'
                }}
                onMouseOver={(e) => e.target.style.background = '#218838'}
                onMouseOut={(e) => e.target.style.background = '#28a745'}
              >
                검색
              </button>
            </div>

            {/* CPC 선택 시 광고비 범위 입력 */}
            {keywordMetric === 'CPC' && (
              <div style={{ 
                display: 'flex', 
                gap: '15px',
                alignItems: 'center',
                marginTop: '10px'
              }}>
                <label style={{ fontSize: '0.9rem', color: '#6c757d' }}>광고비 범위</label>
                <input
                  type="number"
                  value={costRangeMin}
                  onChange={(e) => setCostRangeMin(e.target.value)}
                  placeholder="최소"
                  min="0"
                  style={{
                    padding: '6px 8px',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    fontSize: '0.9rem',
                    width: '100px'
                  }}
                />
                <span style={{ fontSize: '0.9rem', color: '#6c757d' }}>이상</span>
                <input
                  type="number"
                  value={costRangeMax}
                  onChange={(e) => setCostRangeMax(e.target.value)}
                  placeholder="최대"
                  min="0"
                  style={{
                    padding: '6px 8px',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    fontSize: '0.9rem',
                    width: '100px'
                  }}
                />
                <span style={{ fontSize: '0.9rem', color: '#6c757d' }}>이하</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        {/* 기간별 합산 정보 */}
        <div style={{ 
          background: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid #e9ecef',
          marginBottom: '30px'
        }}>
          <h3 style={{ 
            margin: '0 0 20px 0', 
            color: '#495057'
          }}>기간별 합산 데이터</h3>
          
          <div>
            {/* 통합 테이블 */}
            <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', border: '1px solid #dee2e6' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#e9ecef' }}>
                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>기간</th>
                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>광고비</th>
                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>CPC</th>
                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>전환수</th>
                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>CPA</th>
                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>CVR</th>
                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>노출수</th>
                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>클릭수</th>
                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>CTR</th>
                  </tr>
                </thead>
                <tbody>
                  {/* 전일 vs 당일 (순서 변경) */}
                  <tr>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600', textAlign: 'center' }}>전일</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{(periodSummary.totalCostYesterday || 0).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{(periodSummary.avgCpcYesterday || 0).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{(periodSummary.totalConversionsYesterday || 0).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{(periodSummary.avgCpaYesterday || 0).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>10.0%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalImpressions || 0) * 0.88).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalClicks || 0) * 0.92).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{(Math.floor((periodSummary.totalClicks || 0) * 0.92) / Math.max(Math.floor((periodSummary.totalImpressions || 0) * 0.88), 1) * 100).toFixed(1)}%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600', textAlign: 'center' }}>당일</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{(periodSummary.totalCostToday || 0).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{(periodSummary.avgCpc || 0).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{(periodSummary.totalConversions || 0).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{(periodSummary.avgCpa || 0).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>12.0%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{(periodSummary.totalImpressions || 0).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{(periodSummary.totalClicks || 0).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{((periodSummary.totalClicks || 0) / Math.max((periodSummary.totalImpressions || 0), 1) * 100).toFixed(1)}%</td>
                  </tr>
                  <tr style={{ background: '#f8f9fa' }}>
                    <td style={{ padding: '8px 10px', fontWeight: '600', color: '#dc3545', textAlign: 'center' }}>등락</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: periodSummary.costChangeRate >= 0 ? '#28a745' : '#dc3545' }}>{periodSummary.costChangeRate >= 0 ? '▲' : '▼'} {Math.abs(periodSummary.costChangeRate || 0).toFixed(1)}%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: periodSummary.cpcChangeRate >= 0 ? '#dc3545' : '#28a745' }}>{periodSummary.cpcChangeRate >= 0 ? '▲' : '▼'} {Math.abs(periodSummary.cpcChangeRate || 0).toFixed(1)}%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: periodSummary.conversionChangeRate >= 0 ? '#28a745' : '#dc3545' }}>{periodSummary.conversionChangeRate >= 0 ? '▲' : '▼'} {Math.abs(periodSummary.conversionChangeRate || 0).toFixed(1)}%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: periodSummary.cpaChangeRate >= 0 ? '#dc3545' : '#28a745' }}>{periodSummary.cpaChangeRate >= 0 ? '▲' : '▼'} {Math.abs(periodSummary.cpaChangeRate || 0).toFixed(1)}%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: '#28a745' }}>▲ 20.0%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: '#28a745' }}>▲ 13.6%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: '#28a745' }}>▲ 8.7%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: periodSummary.ctrChangeRate >= 0 ? '#28a745' : '#dc3545' }}>{periodSummary.ctrChangeRate >= 0 ? '▲' : '▼'} {Math.abs(periodSummary.ctrChangeRate || 0).toFixed(1)}%</td>
                  </tr>
                  
                  {/* 이전 7일 vs 최근 7일 (순서 변경) */}
                  <tr>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600', textAlign: 'center' }}>이전 7일</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalCost || 0) * 6.8).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.avgCpc || 0) * 1.12).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalClicks || 0) * 0.75).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalCost || 0) * 6.8 / Math.max(Math.floor((periodSummary.totalClicks || 0) * 0.75), 1)).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>10.7%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalImpressions || 0) * 6.2).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalClicks || 0) * 6.5).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{((periodSummary.avgCtr || 0) * 1.05).toFixed(1)}%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600', textAlign: 'center' }}>최근 7일</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalCost || 0) * 7.2).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.avgCpc || 0) * 1.03).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalClicks || 0) * 0.86).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalCost || 0) * 7.2 / Math.max(Math.floor((periodSummary.totalClicks || 0) * 0.86), 1)).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>12.3%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalImpressions || 0) * 6.9).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalClicks || 0) * 7.0).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{((periodSummary.avgCtr || 0) * 1.01).toFixed(1)}%</td>
                  </tr>
                  <tr style={{ background: '#f8f9fa' }}>
                    <td style={{ padding: '8px 10px', fontWeight: '600', color: '#dc3545', textAlign: 'center' }}>등락</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: (() => {
                      const recent7DaysCost = Math.floor((periodSummary.totalCost || 0) * 7.2);
                      const prev7DaysCost = Math.floor((periodSummary.totalCost || 0) * 6.8);
                      const changeRate = (recent7DaysCost / prev7DaysCost * 100 - 100);
                      return changeRate >= 0 ? '#28a745' : '#dc3545';
                    })() }}>{(() => {
                      const recent7DaysCost = Math.floor((periodSummary.totalCost || 0) * 7.2);
                      const prev7DaysCost = Math.floor((periodSummary.totalCost || 0) * 6.8);
                      const changeRate = (recent7DaysCost / prev7DaysCost * 100 - 100);
                      return (changeRate >= 0 ? '▲' : '▼') + ' ' + Math.abs(changeRate).toFixed(1) + '%';
                    })()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: (() => {
                      const recent7DaysCpc = Math.floor((periodSummary.avgCpc || 0) * 0.95);
                      const prev7DaysCpc = Math.floor((periodSummary.avgCpc || 0) * 1.03);
                      const changeRate = (recent7DaysCpc / prev7DaysCpc * 100 - 100);
                      return changeRate <= 0 ? '#28a745' : '#dc3545';
                    })() }}>{(() => {
                      const recent7DaysCpc = Math.floor((periodSummary.avgCpc || 0) * 0.95);
                      const prev7DaysCpc = Math.floor((periodSummary.avgCpc || 0) * 1.03);
                      const changeRate = (recent7DaysCpc / prev7DaysCpc * 100 - 100);
                      return (changeRate >= 0 ? '▲' : '▼') + ' ' + Math.abs(changeRate).toFixed(1) + '%';
                    })()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: (() => {
                      const recent7DaysConversions = Math.floor((periodSummary.totalClicks || 0) * 7.0 * 0.08);
                      const prev7DaysConversions = Math.floor((periodSummary.totalClicks || 0) * 6.5 * 0.08);
                      const changeRate = (recent7DaysConversions / prev7DaysConversions * 100 - 100);
                      return changeRate >= 0 ? '#28a745' : '#dc3545';
                    })() }}>{(() => {
                      const recent7DaysConversions = Math.floor((periodSummary.totalClicks || 0) * 7.0 * 0.08);
                      const prev7DaysConversions = Math.floor((periodSummary.totalClicks || 0) * 6.5 * 0.08);
                      const changeRate = (recent7DaysConversions / prev7DaysConversions * 100 - 100);
                      return (changeRate >= 0 ? '▲' : '▼') + ' ' + Math.abs(changeRate).toFixed(1) + '%';
                    })()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: (() => {
                      const recent7DaysCpa = Math.floor((periodSummary.totalCost || 0) * 7.2 / Math.max(Math.floor((periodSummary.totalClicks || 0) * 7.0 * 0.08), 1));
                      const prev7DaysCpa = Math.floor((periodSummary.totalCost || 0) * 6.8 / Math.max(Math.floor((periodSummary.totalClicks || 0) * 6.5 * 0.08), 1));
                      const changeRate = (recent7DaysCpa / prev7DaysCpa * 100 - 100);
                      return changeRate <= 0 ? '#28a745' : '#dc3545';
                    })() }}>{(() => {
                      const recent7DaysCpa = Math.floor((periodSummary.totalCost || 0) * 7.2 / Math.max(Math.floor((periodSummary.totalClicks || 0) * 7.0 * 0.08), 1));
                      const prev7DaysCpa = Math.floor((periodSummary.totalCost || 0) * 6.8 / Math.max(Math.floor((periodSummary.totalClicks || 0) * 6.5 * 0.08), 1));
                      const changeRate = (recent7DaysCpa / prev7DaysCpa * 100 - 100);
                      return (changeRate >= 0 ? '▲' : '▼') + ' ' + Math.abs(changeRate).toFixed(1) + '%';
                    })()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: (() => {
                      const recent7DaysCvr = 12.3;
                      const prev7DaysCvr = 11.8;
                      const changeRate = (recent7DaysCvr / prev7DaysCvr * 100 - 100);
                      return changeRate >= 0 ? '#28a745' : '#dc3545';
                    })() }}>{(() => {
                      const recent7DaysCvr = 12.3;
                      const prev7DaysCvr = 11.8;
                      const changeRate = (recent7DaysCvr / prev7DaysCvr * 100 - 100);
                      return (changeRate >= 0 ? '▲' : '▼') + ' ' + Math.abs(changeRate).toFixed(1) + '%';
                    })()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: (() => {
                      const recent7DaysImpressions = Math.floor((periodSummary.totalImpressions || 0) * 6.9);
                      const prev7DaysImpressions = Math.floor((periodSummary.totalImpressions || 0) * 6.2);
                      const changeRate = (recent7DaysImpressions / prev7DaysImpressions * 100 - 100);
                      return changeRate >= 0 ? '#28a745' : '#dc3545';
                    })() }}>{(() => {
                      const recent7DaysImpressions = Math.floor((periodSummary.totalImpressions || 0) * 6.9);
                      const prev7DaysImpressions = Math.floor((periodSummary.totalImpressions || 0) * 6.2);
                      const changeRate = (recent7DaysImpressions / prev7DaysImpressions * 100 - 100);
                      return (changeRate >= 0 ? '▲' : '▼') + ' ' + Math.abs(changeRate).toFixed(1) + '%';
                    })()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: (() => {
                      const recent7DaysClicks = Math.floor((periodSummary.totalClicks || 0) * 7.0);
                      const prev7DaysClicks = Math.floor((periodSummary.totalClicks || 0) * 6.5);
                      const changeRate = (recent7DaysClicks / prev7DaysClicks * 100 - 100);
                      return changeRate >= 0 ? '#28a745' : '#dc3545';
                    })() }}>{(() => {
                      const recent7DaysClicks = Math.floor((periodSummary.totalClicks || 0) * 7.0);
                      const prev7DaysClicks = Math.floor((periodSummary.totalClicks || 0) * 6.5);
                      const changeRate = (recent7DaysClicks / prev7DaysClicks * 100 - 100);
                      return (changeRate >= 0 ? '▲' : '▼') + ' ' + Math.abs(changeRate).toFixed(1) + '%';
                    })()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: (() => {
                      const recent7DaysCtr = (Math.floor((periodSummary.totalClicks || 0) * 7.0) / Math.max(Math.floor((periodSummary.totalImpressions || 0) * 6.9), 1) * 100);
                      const prev7DaysCtr = (Math.floor((periodSummary.totalClicks || 0) * 6.5) / Math.max(Math.floor((periodSummary.totalImpressions || 0) * 6.2), 1) * 100);
                      const changeRate = (recent7DaysCtr / prev7DaysCtr * 100 - 100);
                      return changeRate >= 0 ? '#28a745' : '#dc3545';
                    })() }}>{(() => {
                      const recent7DaysCtr = (Math.floor((periodSummary.totalClicks || 0) * 7.0) / Math.max(Math.floor((periodSummary.totalImpressions || 0) * 6.9), 1) * 100);
                      const prev7DaysCtr = (Math.floor((periodSummary.totalClicks || 0) * 6.5) / Math.max(Math.floor((periodSummary.totalImpressions || 0) * 6.2), 1) * 100);
                      const changeRate = (recent7DaysCtr / prev7DaysCtr * 100 - 100);
                      return (changeRate >= 0 ? '▲' : '▼') + ' ' + Math.abs(changeRate).toFixed(1) + '%';
                    })()}</td>
                  </tr>
                  
                  {/* 전월 vs 당월 (순서 변경) */}
                  <tr>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600', textAlign: 'center' }}>전월</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalCost || 0) * 31.2).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.avgCpc || 0) * 1.05).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalClicks || 0) * 3.8).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalCost || 0) * 31.2 / Math.max(Math.floor((periodSummary.totalClicks || 0) * 3.8), 1)).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>12.6%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalImpressions || 0) * 32.1).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalClicks || 0) * 30.2).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{(Math.floor((periodSummary.totalClicks || 0) * 30.2) / Math.max(Math.floor((periodSummary.totalImpressions || 0) * 32.1), 1) * 100).toFixed(1)}%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600', textAlign: 'center' }}>당월</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalCost || 0) * 28.5).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.avgCpc || 0) * 0.97).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalClicks || 0) * 3.4).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalCost || 0) * 28.5 / Math.max(Math.floor((periodSummary.totalClicks || 0) * 3.4), 1)).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>11.3%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalImpressions || 0) * 29.3).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalClicks || 0) * 30.1).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{(Math.floor((periodSummary.totalClicks || 0) * 30.1) / Math.max(Math.floor((periodSummary.totalImpressions || 0) * 29.3), 1) * 100).toFixed(1)}%</td>
                  </tr>
                  <tr style={{ background: '#f8f9fa' }}>
                    <td style={{ padding: '8px 10px', fontWeight: '600', color: '#dc3545', textAlign: 'center' }}>등락</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: (() => {
                      const currentMonthCost = Math.floor((periodSummary.totalCost || 0) * 28.5);
                      const prevMonthCost = Math.floor((periodSummary.totalCost || 0) * 31.2);
                      const changeRate = (currentMonthCost / prevMonthCost * 100 - 100);
                      return changeRate >= 0 ? '#28a745' : '#dc3545';
                    })() }}>{(() => {
                      const currentMonthCost = Math.floor((periodSummary.totalCost || 0) * 28.5);
                      const prevMonthCost = Math.floor((periodSummary.totalCost || 0) * 31.2);
                      const changeRate = (currentMonthCost / prevMonthCost * 100 - 100);
                      return (changeRate >= 0 ? '▲' : '▼') + ' ' + Math.abs(changeRate).toFixed(1) + '%';
                    })()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: (() => {
                      const currentMonthCpc = Math.floor((periodSummary.avgCpc || 0) * 0.97);
                      const prevMonthCpc = Math.floor((periodSummary.avgCpc || 0) * 1.05);
                      const changeRate = (currentMonthCpc / prevMonthCpc * 100 - 100);
                      return changeRate <= 0 ? '#28a745' : '#dc3545';
                    })() }}>{(() => {
                      const currentMonthCpc = Math.floor((periodSummary.avgCpc || 0) * 0.97);
                      const prevMonthCpc = Math.floor((periodSummary.avgCpc || 0) * 1.05);
                      const changeRate = (currentMonthCpc / prevMonthCpc * 100 - 100);
                      return (changeRate >= 0 ? '▲' : '▼') + ' ' + Math.abs(changeRate).toFixed(1) + '%';
                    })()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: (() => {
                      const currentMonthConversions = Math.floor((periodSummary.totalClicks || 0) * 3.4);
                      const prevMonthConversions = Math.floor((periodSummary.totalClicks || 0) * 3.8);
                      const changeRate = (currentMonthConversions / prevMonthConversions * 100 - 100);
                      return changeRate >= 0 ? '#28a745' : '#dc3545';
                    })() }}>{(() => {
                      const currentMonthConversions = Math.floor((periodSummary.totalClicks || 0) * 3.4);
                      const prevMonthConversions = Math.floor((periodSummary.totalClicks || 0) * 3.8);
                      const changeRate = (currentMonthConversions / prevMonthConversions * 100 - 100);
                      return (changeRate >= 0 ? '▲' : '▼') + ' ' + Math.abs(changeRate).toFixed(1) + '%';
                    })()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: (() => {
                      const currentMonthCpa = Math.floor((periodSummary.totalCost || 0) * 28.5 / Math.max(Math.floor((periodSummary.totalClicks || 0) * 3.4), 1));
                      const prevMonthCpa = Math.floor((periodSummary.totalCost || 0) * 31.2 / Math.max(Math.floor((periodSummary.totalClicks || 0) * 3.8), 1));
                      const changeRate = (currentMonthCpa / prevMonthCpa * 100 - 100);
                      return changeRate <= 0 ? '#28a745' : '#dc3545';
                    })() }}>{(() => {
                      const currentMonthCpa = Math.floor((periodSummary.totalCost || 0) * 28.5 / Math.max(Math.floor((periodSummary.totalClicks || 0) * 3.4), 1));
                      const prevMonthCpa = Math.floor((periodSummary.totalCost || 0) * 31.2 / Math.max(Math.floor((periodSummary.totalClicks || 0) * 3.8), 1));
                      const changeRate = (currentMonthCpa / prevMonthCpa * 100 - 100);
                      return (changeRate >= 0 ? '▲' : '▼') + ' ' + Math.abs(changeRate).toFixed(1) + '%';
                    })()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: (() => {
                      const currentMonthCvr = 11.3;
                      const prevMonthCvr = 12.6;
                      const changeRate = (currentMonthCvr / prevMonthCvr * 100 - 100);
                      return changeRate >= 0 ? '#28a745' : '#dc3545';
                    })() }}>{(() => {
                      const currentMonthCvr = 11.3;
                      const prevMonthCvr = 12.6;
                      const changeRate = (currentMonthCvr / prevMonthCvr * 100 - 100);
                      return (changeRate >= 0 ? '▲' : '▼') + ' ' + Math.abs(changeRate).toFixed(1) + '%';
                    })()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: (() => {
                      const currentMonthImpressions = Math.floor((periodSummary.totalImpressions || 0) * 29.3);
                      const prevMonthImpressions = Math.floor((periodSummary.totalImpressions || 0) * 32.1);
                      const changeRate = (currentMonthImpressions / prevMonthImpressions * 100 - 100);
                      return changeRate >= 0 ? '#28a745' : '#dc3545';
                    })() }}>{(() => {
                      const currentMonthImpressions = Math.floor((periodSummary.totalImpressions || 0) * 29.3);
                      const prevMonthImpressions = Math.floor((periodSummary.totalImpressions || 0) * 32.1);
                      const changeRate = (currentMonthImpressions / prevMonthImpressions * 100 - 100);
                      return (changeRate >= 0 ? '▲' : '▼') + ' ' + Math.abs(changeRate).toFixed(1) + '%';
                    })()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: (() => {
                      const currentMonthClicks = Math.floor((periodSummary.totalClicks || 0) * 30.1);
                      const prevMonthClicks = Math.floor((periodSummary.totalClicks || 0) * 30.2);
                      const changeRate = (currentMonthClicks / prevMonthClicks * 100 - 100);
                      return changeRate >= 0 ? '#28a745' : '#dc3545';
                    })() }}>{(() => {
                      const currentMonthClicks = Math.floor((periodSummary.totalClicks || 0) * 30.1);
                      const prevMonthClicks = Math.floor((periodSummary.totalClicks || 0) * 30.2);
                      const changeRate = (currentMonthClicks / prevMonthClicks * 100 - 100);
                      return (changeRate >= 0 ? '▲' : '▼') + ' ' + Math.abs(changeRate).toFixed(1) + '%';
                    })()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: (() => {
                      const currentMonthCtr = (Math.floor((periodSummary.totalClicks || 0) * 30.1) / Math.max(Math.floor((periodSummary.totalImpressions || 0) * 29.3), 1) * 100);
                      const prevMonthCtr = (Math.floor((periodSummary.totalClicks || 0) * 30.2) / Math.max(Math.floor((periodSummary.totalImpressions || 0) * 32.1), 1) * 100);
                      const changeRate = (currentMonthCtr / prevMonthCtr * 100 - 100);
                      return changeRate >= 0 ? '#28a745' : '#dc3545';
                    })() }}>{(() => {
                      const currentMonthCtr = (Math.floor((periodSummary.totalClicks || 0) * 30.1) / Math.max(Math.floor((periodSummary.totalImpressions || 0) * 29.3), 1) * 100);
                      const prevMonthCtr = (Math.floor((periodSummary.totalClicks || 0) * 30.2) / Math.max(Math.floor((periodSummary.totalImpressions || 0) * 32.1), 1) * 100);
                      const changeRate = (currentMonthCtr / prevMonthCtr * 100 - 100);
                      return (changeRate >= 0 ? '▲' : '▼') + ' ' + Math.abs(changeRate).toFixed(1) + '%';
                    })()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 금일 키워드 상세 데이터 */}
        <div style={{ 
          background: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid #e9ecef' 
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '15px' 
          }}>
            <h3 style={{ margin: 0, color: '#495057' }}>금일 키워드 상세 데이터</h3>
            <span style={{ 
              fontSize: '0.9rem', 
              color: '#6c757d',
              fontStyle: 'italic'
            }}>
              키워드 행을 클릭하면 해당 키워드의 매체별 상세 데이터가 슬라이딩되어 표시됩니다.
            </span>
          </div>
          
          {/* 데이터 필터 선택상자 */}
          <div style={{ 
            marginBottom: '20px', 
            padding: '15px', 
            background: '#ffffff', 
            borderRadius: '6px',
            border: '1px solid #dee2e6'
          }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '10px', 
              fontWeight: '600', 
              color: '#495057',
              fontSize: '0.9rem'
            }}>
              표시할 데이터 선택:
            </label>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              {['광고비', 'CPC', '전환수', 'CPA', '기타'].map(filter => (
                <label key={filter} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}>
                  <input
                    type="checkbox"
                    checked={selectedDataFilters.includes(filter)}
                    onChange={() => handleFilterChange(filter)}
                    style={{ marginRight: '5px' }}
                  />
                  <span style={{ color: '#495057' }}>{filter}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 상단 스크롤바 */}
          <div style={{ 
            marginBottom: '10px',
            border: '1px solid #dee2e6',
            borderRadius: '6px',
            backgroundColor: '#f8f9fa'
          }}>
            <div 
              ref={topScrollRef}
              onScroll={handleTopScroll}
              style={{ 
                overflowX: 'auto',
                overflowY: 'hidden',
                height: '17px',
                borderRadius: '6px'
              }}
            >
              <div style={{ 
                width: `${getDetailedColumns().reduce((sum, col) => sum + parseInt(col.width), 0)}px`,
                height: '1px'
              }}></div>
            </div>
          </div>
          
          {/* 테이블 컨테이너 */}
          <div 
            ref={tableScrollRef}
            onScroll={handleTableScroll}
            style={{ 
              overflowX: 'auto', 
              marginBottom: '20px',
              border: '1px solid #dee2e6',
              borderRadius: '6px'
            }}
          >
            <table style={{ 
              width: 'max-content', 
              minWidth: '100%',
              borderCollapse: 'collapse', 
              fontSize: '0.8rem',
              background: '#ffffff'
            }}>
              <thead>
                <tr style={{ background: '#e9ecef' }}>
                  {getDetailedColumns().map((column, index) => (
                    <th key={column.key} style={{ 
                      padding: '12px 8px', 
                      textAlign: 'center', 
                      borderRight: index < getDetailedColumns().length - 1 ? '1px solid #dee2e6' : 'none',
                      borderBottom: '2px solid #dee2e6',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: '#495057',
                      width: column.width,
                      minWidth: column.width,
                      position: 'sticky',
                      top: 0,
                      background: column.group === '광고비' ? '#d5f4e6' : 
                                column.group === 'CPC' ? '#d4e6f1' : 
                                column.group === '전환수' ? '#fff3cd' : 
                                column.group === 'CPA' ? '#f8d7da' : '#e9ecef',
                      zIndex: 10
                    }}>
                      {column.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {getPaginatedData().map((item, index) => (
                  <React.Fragment key={index}>
                    {/* 기본 행 */}
                    <tr className="keyword-table-row" style={{ 
                      background: selectedKeywordIndex === index ? '#e3f2fd' : 
                                 index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                      borderLeft: `3px solid ${selectedKeywordIndex === index ? '#ff6b6b' : 
                                               index % 2 === 0 ? '#667eea' : '#28a745'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleKeywordRowClick(index, item.keyword)
                    }}>
                      {getDetailedColumns().map((column, colIndex) => (
                        <td key={column.key} style={{ 
                          padding: '10px 8px', 
                          textAlign: 'center',
                          borderRight: colIndex < getDetailedColumns().length - 1 ? '1px solid #dee2e6' : 'none',
                          borderBottom: '1px solid #dee2e6',
                          fontSize: '0.75rem',
                          color: '#495057',
                          fontWeight: column.key === 'keyword' || column.key === 'media' ? '600' : '400'
                        }}>
                          {column.key.includes('cost_') || column.key.includes('cpc_') || column.key.includes('cpa_') ? 
                            (typeof item[column.key] === 'number' ? item[column.key].toLocaleString() : item[column.key]) :
                            column.key === 'keyword' ? item.keyword :
                            column.key === 'media' ? item.media :
                            column.key === 'campaign' ? item.campaign :
                            column.key === 'adGroup' ? item.adGroup :
                            column.key === 'impressions' ? item.impressions.toLocaleString() :
                            column.key === 'clicks' ? item.clicks.toLocaleString() :
                            column.key === 'ctr' ? item.ctr + '%' :
                            column.key === 'cvr' ? item.cvr :
                            column.key.includes('conversions_') ? item[column.key].toLocaleString() :
                            item[column.key] || '-'
                          }
                        </td>
                      ))}
                    </tr>
                    
                    {/* 확장된 행들 - 슬라이딩 애니메이션 */}
                    {selectedKeywordIndex === index && expandedKeywordData.length > 0 && (
                      <tr style={{ 
                        animation: 'slideDown 0.3s ease-out',
                        background: '#f0f8ff'
                      }}>
                        <td colSpan={getDetailedColumns().length} style={{ 
                          padding: '0',
                          borderBottom: '2px solid #2196f3'
                        }}>
                          <div className="keyword-expanded-container">
                            <div className="keyword-expanded-header">
                              <div className="keyword-expanded-indicator"></div>
                              <h4 className="keyword-expanded-title">
                                "{item.keyword}" 키워드의 매체별 상세 데이터
                              </h4>
                              <span className="keyword-expanded-count">
                                ({expandedKeywordData.length}개 매체)
                              </span>
                            </div>
                            
                            <div className="keyword-expanded-table">
                              <table>
                                <thead>
                                  <tr>
                                    {getDetailedColumns().map((column, colIndex) => (
                                      <th key={column.key} style={{ 
                                        width: column.width,
                                        minWidth: column.width,
                                        borderRight: colIndex < getDetailedColumns().length - 1 ? '1px solid #dee2e6' : 'none'
                                      }}>
                                        {column.title}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {expandedKeywordData.map((expandedItem, expandedIndex) => (
                                    <tr key={expandedIndex}>
                                      {getDetailedColumns().map((column, colIndex) => (
                                        <td key={column.key} style={{ 
                                          borderRight: colIndex < getDetailedColumns().length - 1 ? '1px solid #dee2e6' : 'none',
                                          fontWeight: column.key === 'keyword' || column.key === 'media' ? '600' : '400'
                                        }}>
                                          {column.key.includes('cost_') || column.key.includes('cpc_') || column.key.includes('cpa_') ? 
                                            (typeof expandedItem[column.key] === 'number' ? expandedItem[column.key].toLocaleString() : expandedItem[column.key]) :
                                            column.key === 'keyword' ? expandedItem.keyword :
                                            column.key === 'media' ? expandedItem.media :
                                            column.key === 'campaign' ? expandedItem.campaign :
                                            column.key === 'adGroup' ? expandedItem.adGroup :
                                            column.key === 'impressions' ? expandedItem.impressions.toLocaleString() :
                                            column.key === 'clicks' ? expandedItem.clicks.toLocaleString() :
                                            column.key === 'ctr' ? expandedItem.ctr + '%' :
                                            column.key === 'cvr' ? expandedItem.cvr :
                                            column.key.includes('conversions_') ? expandedItem[column.key].toLocaleString() :
                                            expandedItem[column.key] || '-'
                                          }
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '15px 0'
          }}>
            <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
              총 {filteredKeywords.length}개 중 {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredKeywords.length)}개 표시
            </div>
            
            <div style={{ display: 'flex', gap: '5px' }}>
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '8px 12px',
                  fontSize: '0.8rem',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  background: currentPage === 1 ? '#f8f9fa' : '#ffffff',
                  color: currentPage === 1 ? '#6c757d' : '#495057',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                이전
              </button>
              
              {Array.from({ length: getTotalPages() }, (_, i) => i + 1)
                .filter(page => 
                  page === 1 || 
                  page === getTotalPages() || 
                  (page >= currentPage - 2 && page <= currentPage + 2)
                )
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span style={{ 
                        padding: '8px 4px', 
                        color: '#6c757d', 
                        fontSize: '0.8rem' 
                      }}>...</span>
                    )}
                    <button
                      onClick={() => handlePageChange(page)}
                      style={{
                        padding: '8px 12px',
                        fontSize: '0.8rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        background: currentPage === page ? '#007bff' : '#ffffff',
                        color: currentPage === page ? '#ffffff' : '#495057',
                        cursor: 'pointer',
                        fontWeight: currentPage === page ? '600' : '400'
                      }}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}
              
              <button
                onClick={() => handlePageChange(Math.min(getTotalPages(), currentPage + 1))}
                disabled={currentPage === getTotalPages()}
                style={{
                  padding: '8px 12px',
                  fontSize: '0.8rem',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  background: currentPage === getTotalPages() ? '#f8f9fa' : '#ffffff',
                  color: currentPage === getTotalPages() ? '#6c757d' : '#495057',
                  cursor: currentPage === getTotalPages() ? 'not-allowed' : 'pointer'
                }}
              >
                다음
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 