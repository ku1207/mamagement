import Layout from '../components/Layout'
import ProtectedRoute from '../components/ProtectedRoute'
import React, { useState, useEffect } from 'react'
import { useAuth, ROLES } from '../context/AuthContext'
import { useRouter } from 'next/router'
import DashboardContainer from '../components/Dashboard/DashboardContainer'
import SuperAdminDashboard from '../components/Dashboard/SuperAdminDashboard'
import FilterSection from '../components/Dashboard/FilterSection'
import KPICards from '../components/Dashboard/KPICards'
import InteractiveChart from '../components/Dashboard/InteractiveChart'
import DataTable from '../components/Dashboard/DataTable'
import ExportBar from '../components/Dashboard/ExportBar'

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

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardContent />
      case 'daily-data':
        return <DailyDataContent />
      case 'keyword-data':
        return <KeywordDataContent />
      case 'naver':
        return <MediaContent media="네이버" />
      case 'kakao':
        return <MediaContent media="카카오" />
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
            <span>총 노출수: 456,789</span>
          </div>
          <div className="report-item">
            <span>총 클릭수: 12,345</span>
          </div>
          <div className="report-item">
            <span>총 광고비: ₩2,345,678</span>
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
          <p className="stat-value">₩11,000,000</p>
        </div>
        <div className="stat-card">
          <h4>완료된 결제</h4>
          <p className="stat-value">15건</p>
        </div>
        <div className="stat-card">
          <h4>대기 중인 결제</h4>
          <p className="stat-value">3건</p>
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
  
  // 어제 날짜 계산 (로컬 시간 기준)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  // 로컬 시간 기준으로 YYYY-MM-DD 형식 변환
  const formatLocalDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  // 필터 상태 관리
  const [selectedMedias, setSelectedMedias] = useState(['네이버', '카카오', '구글', '메타', '틱톡'])
  const [keywordMetric, setKeywordMetric] = useState('광고비')
  const [sortOrder, setSortOrder] = useState('내림차순')
  const [keywordCount, setKeywordCount] = useState('')
  const [selectedDate, setSelectedDate] = useState(formatLocalDate(yesterday))
  const [costRangeMin, setCostRangeMin] = useState('')
  const [costRangeMax, setCostRangeMax] = useState('')
  
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
      // 해당 날짜의 매체별 데이터 생성
      const mediaData = ['네이버', '카카오', '구글', '메타', '틱톡'].map(media => ({
        date,
        media,
        campaign: `${media} 일자별 캠페인`,
        impressions: Math.floor(Math.random() * 15000) + 5000,
        clicks: Math.floor(Math.random() * 800) + 200,
        ctr: parseFloat(((Math.random() * 4) + 1).toFixed(1)),
        cpc: Math.floor(Math.random() * 600) + 200,
        cost: Math.floor(Math.random() * 200000) + 50000,
        conversions: Math.floor(Math.random() * 50) + 10,
        revenue: Math.floor(Math.random() * 500000) + 100000
      }))
      
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

  // 일자별 고정 더미 데이터 생성
  const generateDailyData = () => {
    const fixedData = [
      { impressions: 25000, clicks: 1250, conversions: 75, cost: 300000, revenue: 600000, cpc: 240 },
      { impressions: 32000, clicks: 1600, conversions: 95, cost: 380000, revenue: 750000, cpc: 238 },
      { impressions: 28000, clicks: 1400, conversions: 82, cost: 335000, revenue: 680000, cpc: 239 },
      { impressions: 35000, clicks: 1750, conversions: 105, cost: 420000, revenue: 850000, cpc: 240 },
      { impressions: 22000, clicks: 1100, conversions: 65, cost: 265000, revenue: 530000, cpc: 241 },
      { impressions: 40000, clicks: 2000, conversions: 120, cost: 480000, revenue: 960000, cpc: 240 },
      { impressions: 30000, clicks: 1500, conversions: 90, cost: 360000, revenue: 720000, cpc: 240 },
    ]
    
    const data = []
    for (let i = 30; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      const dayData = fixedData[i % fixedData.length]
      data.push({
        date: date.toISOString().split('T')[0],
        impressions: dayData.impressions,
        clicks: dayData.clicks,
        conversions: dayData.conversions,
        cost: dayData.cost,
        revenue: dayData.revenue,
        cpc: dayData.cpc
      })
    }
    return data
  }

  // 키워드 고정 더미 데이터 생성
  const generateKeywordData = () => {
    const fixedKeywordData = [
      { keyword: '브랜드명', media: '네이버', campaign: '브랜드캠페인', adGroup: '그룹A', impressions: 15000, clicks: 750, ctr: 5.0, cpc_today: 320, cpc_yesterday: 315, cpc_7days: 318, cpc_last_week: 322, cost_today: 80000, cost_yesterday: 78000, cost_7days: 320000, cost_last_week: 325000 },
      { keyword: '브랜드명', media: '구글', campaign: '브랜드캠페인', adGroup: '그룹B', impressions: 12000, clicks: 600, ctr: 5.0, cpc_today: 350, cpc_yesterday: 345, cpc_7days: 348, cpc_last_week: 352, cost_today: 70000, cost_yesterday: 69000, cost_7days: 280000, cost_last_week: 285000 },
      
      { keyword: '제품명', media: '네이버', campaign: '제품캠페인', adGroup: '그룹A', impressions: 18000, clicks: 900, ctr: 5.0, cpc_today: 280, cpc_yesterday: 275, cpc_7days: 278, cpc_last_week: 282, cost_today: 95000, cost_yesterday: 92000, cost_7days: 380000, cost_last_week: 385000 },
      { keyword: '제품명', media: '카카오', campaign: '제품캠페인', adGroup: '그룹C', impressions: 14000, clicks: 700, ctr: 5.0, cpc_today: 300, cpc_yesterday: 295, cpc_7days: 298, cpc_last_week: 302, cost_today: 75000, cost_yesterday: 73000, cost_7days: 300000, cost_last_week: 305000 },
      
      { keyword: '카테고리', media: '구글', campaign: '이벤트캠페인', adGroup: '그룹B', impressions: 20000, clicks: 1000, ctr: 5.0, cpc_today: 250, cpc_yesterday: 245, cpc_7days: 248, cpc_last_week: 252, cost_today: 100000, cost_yesterday: 98000, cost_7days: 400000, cost_last_week: 405000 },
      { keyword: '카테고리', media: '메타', campaign: '이벤트캠페인', adGroup: '그룹A', impressions: 16000, clicks: 800, ctr: 5.0, cpc_today: 275, cpc_yesterday: 270, cpc_7days: 273, cpc_last_week: 277, cost_today: 85000, cost_yesterday: 83000, cost_7days: 340000, cost_last_week: 345000 },
      
      { keyword: '경쟁사', media: '네이버', campaign: '브랜드캠페인', adGroup: '그룹C', impressions: 10000, clicks: 500, ctr: 5.0, cpc_today: 400, cpc_yesterday: 395, cpc_7days: 398, cpc_last_week: 402, cost_today: 65000, cost_yesterday: 63000, cost_7days: 260000, cost_last_week: 265000 },
      
      { keyword: '일반키워드', media: '구글', campaign: '제품캠페인', adGroup: '그룹A', impressions: 22000, clicks: 1100, ctr: 5.0, cpc_today: 230, cpc_yesterday: 225, cpc_7days: 228, cpc_last_week: 232, cost_today: 110000, cost_yesterday: 108000, cost_7days: 440000, cost_last_week: 445000 },
      { keyword: '일반키워드', media: '카카오', campaign: '제품캠페인', adGroup: '그룹B', impressions: 13000, clicks: 650, ctr: 5.0, cpc_today: 260, cpc_yesterday: 255, cpc_7days: 258, cpc_last_week: 262, cost_today: 72000, cost_yesterday: 70000, cost_7days: 290000, cost_last_week: 295000 },
      
      { keyword: '롱테일키워드', media: '네이버', campaign: '이벤트캠페인', adGroup: '그룹C', impressions: 8000, clicks: 400, ctr: 5.0, cpc_today: 350, cpc_yesterday: 345, cpc_7days: 348, cpc_last_week: 352, cost_today: 55000, cost_yesterday: 53000, cost_7days: 220000, cost_last_week: 225000 },
      
      { keyword: '상품후기', media: '메타', campaign: '브랜드캠페인', adGroup: '그룹A', impressions: 12000, clicks: 600, ctr: 5.0, cpc_today: 300, cpc_yesterday: 295, cpc_7days: 298, cpc_last_week: 302, cost_today: 68000, cost_yesterday: 66000, cost_7days: 270000, cost_last_week: 275000 },
      
      { keyword: '가격비교', media: '구글', campaign: '이벤트캠페인', adGroup: '그룹B', impressions: 17000, clicks: 850, ctr: 5.0, cpc_today: 290, cpc_yesterday: 285, cpc_7days: 288, cpc_last_week: 292, cost_today: 88000, cost_yesterday: 86000, cost_7days: 350000, cost_last_week: 355000 },
      { keyword: '가격비교', media: '네이버', campaign: '이벤트캠페인', adGroup: '그룹C', impressions: 11000, clicks: 550, ctr: 5.0, cpc_today: 320, cpc_yesterday: 315, cpc_7days: 318, cpc_last_week: 322, cost_today: 64000, cost_yesterday: 62000, cost_7days: 250000, cost_last_week: 255000 },
      
      { keyword: '이벤트', media: '카카오', campaign: '이벤트캠페인', adGroup: '그룹A', impressions: 25000, clicks: 1250, ctr: 5.0, cpc_today: 200, cpc_yesterday: 195, cpc_7days: 198, cpc_last_week: 202, cost_today: 120000, cost_yesterday: 118000, cost_7days: 480000, cost_last_week: 485000 },
      
      { keyword: '할인', media: '메타', campaign: '제품캠페인', adGroup: '그룹B', impressions: 19000, clicks: 950, ctr: 5.0, cpc_today: 260, cpc_yesterday: 255, cpc_7days: 258, cpc_last_week: 262, cost_today: 95000, cost_yesterday: 93000, cost_7days: 380000, cost_last_week: 385000 },
      
      // 틱톡 전용 키워드 데이터 추가
      { keyword: '브랜드명', media: '틱톡', campaign: '틱톡 브랜드 챌린지', adGroup: '틱톡 브랜드 그룹', impressions: 50000, clicks: 2500, ctr: 5.0, cpc_today: 180, cpc_yesterday: 175, cpc_7days: 178, cpc_last_week: 182, cost_today: 150000, cost_yesterday: 148000, cost_7days: 600000, cost_last_week: 605000 },
      { keyword: '제품명', media: '틱톡', campaign: '틱톡 제품 프로모션', adGroup: '틱톡 제품 그룹', impressions: 45000, clicks: 2250, ctr: 5.0, cpc_today: 200, cpc_yesterday: 195, cpc_7days: 198, cpc_last_week: 202, cost_today: 140000, cost_yesterday: 138000, cost_7days: 560000, cost_last_week: 565000 },
      { keyword: '카테고리', media: '틱톡', campaign: '틱톡 카테고리 광고', adGroup: '틱톡 카테고리 그룹', impressions: 40000, clicks: 2000, ctr: 5.0, cpc_today: 170, cpc_yesterday: 165, cpc_7days: 168, cpc_last_week: 172, cost_today: 130000, cost_yesterday: 128000, cost_7days: 520000, cost_last_week: 525000 },
      { keyword: '챌린지', media: '틱톡', campaign: '틱톡 바이럴 챌린지', adGroup: '틱톡 해시태그 그룹', impressions: 80000, clicks: 4000, ctr: 5.0, cpc_today: 150, cpc_yesterday: 145, cpc_7days: 148, cpc_last_week: 152, cost_today: 200000, cost_yesterday: 198000, cost_7days: 800000, cost_last_week: 805000 },
      { keyword: '댄스', media: '틱톡', campaign: '틱톡 댄스 챌린지', adGroup: '틱톡 댄스 그룹', impressions: 75000, clicks: 3750, ctr: 5.0, cpc_today: 160, cpc_yesterday: 155, cpc_7days: 158, cpc_last_week: 162, cost_today: 180000, cost_yesterday: 178000, cost_7days: 720000, cost_last_week: 725000 },
      { keyword: '트렌드', media: '틱톡', campaign: '틱톡 트렌드 마케팅', adGroup: '틱톡 트렌드 그룹', impressions: 60000, clicks: 3000, ctr: 5.0, cpc_today: 190, cpc_yesterday: 185, cpc_7days: 188, cpc_last_week: 192, cost_today: 170000, cost_yesterday: 168000, cost_7days: 680000, cost_last_week: 685000 }
    ]
    
    return fixedKeywordData
  }

  // 선택된 날짜에 따른 일자별 데이터 필터링
  const getFilteredDailyData = () => {
    if (!selectedDate) return dailyData

    return dailyData.filter(item => {
      return item.date === selectedDate
    })
  }

  // 컴포넌트 마운트 시 데이터 생성
  useEffect(() => {
    if (selectedAdvertiser) {
      // 일자별 데이터 생성
      const initialData = generateDailyData()
      setDailyData(initialData)
      
      // 키워드 데이터 생성
      const keywordInitialData = generateKeywordData()
      setKeywordData(keywordInitialData)
      
      // 초기 로딩 시 기본 검색 실행
      setTimeout(() => {
        handleSearch()
      }, 100)
    }
  }, [selectedAdvertiser])

  // 기간별 합산 정보 계산
  const calculatePeriodSummary = (data) => {
    const totalImpressions = data.reduce((sum, item) => sum + item.impressions, 0)
    const totalClicks = data.reduce((sum, item) => sum + item.clicks, 0)
    const totalCost = data.reduce((sum, item) => sum + item.cost, 0)
    const totalConversions = Math.floor(totalClicks * 0.12) // 전환수는 클릭수의 12%로 가정
    
    // 평균 CTR 계산 (전체 클릭수 / 전체 노출수)
    const avgCtr = totalImpressions > 0 ? parseFloat(((totalClicks / totalImpressions) * 100).toFixed(1)) : 0
    
    // 평균 CPC 계산 (전체 광고비 / 전체 클릭수)
    const avgCpc = totalClicks > 0 ? Math.round(totalCost / totalClicks) : 0
    
    // 평균 CPA 계산 (전체 광고비 / 전체 전환수)
    const avgCpa = totalConversions > 0 ? Math.round(totalCost / totalConversions) : 0
    
    // 실제 등락률 계산을 위한 어제와 오늘 비교 데이터
    const yesterday = totalCost * 0.95  // 어제는 5% 적었다고 가정
    const costChangeRate = totalCost > 0 ? ((totalCost - yesterday) / yesterday * 100) : 0
    
    const yesterdayCpc = avgCpc * 1.08  // 어제 CPC는 8% 높았다고 가정
    const cpcChangeRate = avgCpc > 0 ? ((avgCpc - yesterdayCpc) / yesterdayCpc * 100) : 0
    
    const yesterdayConversions = Math.floor(totalConversions * 0.83)  // 어제 전환수는 17% 적었다고 가정
    const conversionChangeRate = totalConversions > 0 ? ((totalConversions - yesterdayConversions) / yesterdayConversions * 100) : 0
    
    const yesterdayCpa = avgCpa * 1.15  // 어제 CPA는 15% 높았다고 가정
    const cpaChangeRate = avgCpa > 0 ? ((avgCpa - yesterdayCpa) / yesterdayCpa * 100) : 0
    
    const yesterdayCtr = avgCtr * 0.96  // 어제 CTR은 4% 낮았다고 가정
    const ctrChangeRate = avgCtr > 0 ? ((avgCtr - yesterdayCtr) / yesterdayCtr * 100) : 0
    
    return {
      totalImpressions,
      totalClicks,
      totalCost,
      totalConversions,
      avgCtr,
      avgCpc,
      avgCpa,
      yesterday,
      yesterdayCpc,
      yesterdayConversions,
      yesterdayCpa,
      yesterdayCtr,
      costChangeRate,
      cpcChangeRate,
      conversionChangeRate,
      cpaChangeRate,
      ctrChangeRate
    }
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
    
    // CPC 선택 시 광고비 범위 필터링
    if (keywordMetric === 'CPC') {
      if (costRangeMin && !isNaN(costRangeMin)) {
        filtered = filtered.filter(item => item.cost_today >= parseInt(costRangeMin))
      }
      if (costRangeMax && !isNaN(costRangeMax)) {
        filtered = filtered.filter(item => item.cost_today <= parseInt(costRangeMax))
      }
    }
    
    // 선택된 지표에 따라 정렬
    filtered.sort((a, b) => {
      let valueA, valueB
      switch (keywordMetric) {
        case '클릭수':
          valueA = a.clicks
          valueB = b.clicks
          break
        case 'CPC':
          valueA = a.cpc_today
          valueB = b.cpc_today
          break
        case '광고비':
        default:
          valueA = a.cost_today
          valueB = b.cost_today
          break
      }
      
      return sortOrder === '내림차순' ? valueB - valueA : valueA - valueB
    })
    
    // 개수 제한
    if (keywordCount && !isNaN(keywordCount) && keywordCount > 0) {
      filtered = filtered.slice(0, parseInt(keywordCount))
    }
    
    return filtered
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
    const summary = calculatePeriodSummary(results)
    setPeriodSummary(summary)
  }, [])

  // 기간별 합산 정보 계산
  const calculatePeriodSummary = (data) => {
    if (!data || data.length === 0) {
      return {
        totalImpressions: 0,
        totalClicks: 0,
        totalCostToday: 0,
        totalCostYesterday: 0,
        totalCost7Days: 0,
        totalCostLastWeek: 0,
        avgCtr: 0,
        avgCpc: 0,
        avgCpa: 0,
        costChangeRate: 0,
        cpcChangeRate: 0,
        conversionChangeRate: 0,
        cpaChangeRate: 0,
        ctrChangeRate: 0
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
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {/* 당일 vs 전일 테이블 */}
            <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', border: '1px solid #dee2e6' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#e9ecef' }}>
                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>기간</th>
                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>당일</th>
                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>전일</th>
                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>등락</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>광고비</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>₩{(periodSummary.totalCost || 0).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>₩{Math.floor((periodSummary.totalCost || 0) * 0.95).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6', color: '#28a745' }}>▲ 5.3%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>CPC</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>₩{(periodSummary.avgCpc || 0).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>₩{Math.floor((periodSummary.avgCpc || 0) * 1.08).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6', color: '#dc3545' }}>▼ 7.4%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>전환수</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalClicks || 0) * 0.12).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalClicks || 0) * 0.10).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6', color: '#28a745' }}>▲ 20.0%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>CPA</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>₩{Math.floor((periodSummary.totalCost || 0) / Math.max(Math.floor((periodSummary.totalClicks || 0) * 0.12), 1)).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>₩{Math.floor((periodSummary.totalCost || 0) * 0.95 / Math.max(Math.floor((periodSummary.totalClicks || 0) * 0.10), 1)).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6', color: '#dc3545' }}>▼ 12.3%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>CVR</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>12.0%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>10.0%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6', color: '#28a745' }}>▲ 20.0%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>노출수</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{(periodSummary.totalImpressions || 0).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalImpressions || 0) * 0.88).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6', color: '#28a745' }}>▲ 13.6%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>클릭수</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{(periodSummary.totalClicks || 0).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalClicks || 0) * 0.92).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6', color: '#28a745' }}>▲ 8.7%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 10px', fontWeight: '600' }}>CTR</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>{(periodSummary.avgCtr || 0).toFixed(1)}%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>{((periodSummary.avgCtr || 0) * 0.96).toFixed(1)}%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: '#dc3545' }}>▼ 4.2%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 최근 7일 vs 이전 7일 테이블 */}
            <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', border: '1px solid #dee2e6' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#e9ecef' }}>
                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>기간</th>
                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>최근 7일</th>
                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>이전 7일</th>
                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>등락</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>광고비</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>₩{Math.floor((periodSummary.totalCost || 0) * 7.2).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>₩{Math.floor((periodSummary.totalCost || 0) * 6.8).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6', color: '#28a745' }}>▲ 5.9%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>CPC</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>₩{Math.floor((periodSummary.avgCpc || 0) * 1.03).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>₩{Math.floor((periodSummary.avgCpc || 0) * 1.12).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6', color: '#dc3545' }}>▼ 8.0%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>전환수</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalClicks || 0) * 0.86).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalClicks || 0) * 0.75).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6', color: '#28a745' }}>▲ 14.7%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>CPA</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>₩{Math.floor((periodSummary.totalCost || 0) * 7.2 / Math.max(Math.floor((periodSummary.totalClicks || 0) * 0.86), 1)).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>₩{Math.floor((periodSummary.totalCost || 0) * 6.8 / Math.max(Math.floor((periodSummary.totalClicks || 0) * 0.75), 1)).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6', color: '#dc3545' }}>▼ 7.7%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>CVR</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>12.3%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>10.7%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6', color: '#28a745' }}>▲ 15.0%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>노출수</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalImpressions || 0) * 6.9).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalImpressions || 0) * 6.2).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6', color: '#28a745' }}>▲ 11.3%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>클릭수</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalClicks || 0) * 7.0).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalClicks || 0) * 6.5).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6', color: '#28a745' }}>▲ 7.7%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 10px', fontWeight: '600' }}>CTR</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>{((periodSummary.avgCtr || 0) * 1.01).toFixed(1)}%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>{((periodSummary.avgCtr || 0) * 1.05).toFixed(1)}%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: '#dc3545' }}>▼ 3.8%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 당월 vs 전월 테이블 */}
            <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', border: '1px solid #dee2e6' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#e9ecef' }}>
                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>기간</th>
                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>당월</th>
                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>전월</th>
                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>등락</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>광고비</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>₩{Math.floor((periodSummary.totalCost || 0) * 28.5).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>₩{Math.floor((periodSummary.totalCost || 0) * 31.2).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6', color: '#dc3545' }}>▼ 8.7%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>CPC</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>₩{Math.floor((periodSummary.avgCpc || 0) * 0.97).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>₩{Math.floor((periodSummary.avgCpc || 0) * 1.05).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6', color: '#28a745' }}>▲ 7.6%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>전환수</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalClicks || 0) * 3.4).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalClicks || 0) * 3.8).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6', color: '#dc3545' }}>▼ 10.5%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>CPA</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>₩{Math.floor((periodSummary.totalCost || 0) * 28.5 / Math.max(Math.floor((periodSummary.totalClicks || 0) * 3.4), 1)).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>₩{Math.floor((periodSummary.totalCost || 0) * 31.2 / Math.max(Math.floor((periodSummary.totalClicks || 0) * 3.8), 1)).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6', color: '#28a745' }}>▲ 1.8%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>CVR</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>11.3%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>12.6%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6', color: '#dc3545' }}>▼ 10.3%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>노출수</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalImpressions || 0) * 29.3).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalImpressions || 0) * 32.1).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6', color: '#dc3545' }}>▼ 8.7%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>클릭수</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalClicks || 0) * 30.1).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalClicks || 0) * 30.2).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6', color: '#dc3545' }}>▼ 0.3%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 10px', fontWeight: '600' }}>CTR</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>{((periodSummary.avgCtr || 0) * 1.03).toFixed(1)}%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>{((periodSummary.avgCtr || 0) * 0.94).toFixed(1)}%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: '#28a745' }}>▲ 9.6%</td>
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
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>노출수</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>클릭수</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>CTR</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>CPC</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>광고비</th>
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
                          {item.impressions.toLocaleString()}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>
                          {item.clicks.toLocaleString()}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>
                          {item.impressions > 0 ? ((item.clicks / item.impressions) * 100).toFixed(1) + '%' : '0.0%'}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>
                          {item.cpc.toLocaleString()}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>
                          {item.cost.toLocaleString()}
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
                              {mediaItem.ctr.toFixed(1)}%
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
                              {mediaItem.cost.toLocaleString()}
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
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  // 로컬 시간 기준으로 YYYY-MM-DD 형식 변환
  const formatLocalDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  // 필터 상태 관리
  const [selectedMedias, setSelectedMedias] = useState(['네이버', '카카오', '구글', '메타', '틱톡'])
  const [keywordMetric, setKeywordMetric] = useState('광고비')
  const [sortOrder, setSortOrder] = useState('내림차순')
  const [keywordCount, setKeywordCount] = useState('')
  const [selectedDate, setSelectedDate] = useState(formatLocalDate(yesterday))
  const [costRangeMin, setCostRangeMin] = useState('')
  const [costRangeMax, setCostRangeMax] = useState('')
  
  // 검색 결과 상태 관리
  const [filteredKeywords, setFilteredKeywords] = useState([])
  const [keywordData, setKeywordData] = useState([])
  
  // 키워드 행 선택 및 슬라이드 상태 관리
  const [selectedKeywordIndex, setSelectedKeywordIndex] = useState(null)
  const [expandedKeywordData, setExpandedKeywordData] = useState([])
  
  // 기간별 합산 정보 상태
  const [periodSummary, setPeriodSummary] = useState({
    totalImpressions: 0,
    totalClicks: 0,
    totalCostToday: 0,
    totalCostYesterday: 0,
    totalCost7Days: 0,
    totalCostLastWeek: 0,
    totalConversions: 0,
    totalConversionsYesterday: 0,
    avgCtr: 0,
    avgCtrYesterday: 0,
    avgCpc: 0,
    avgCpcYesterday: 0,
    avgCpa: 0,
    avgCpaYesterday: 0,
    costChangeRate: 0,
    cpcChangeRate: 0,
    conversionChangeRate: 0,
    cpaChangeRate: 0,
    ctrChangeRate: 0
  })
  
  if (!selectedAdvertiser) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '400px' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔍</div>
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
    const summary = calculateKeywordSummary(results)
    setPeriodSummary(summary)
  }

  // 키워드 행 클릭 처리
  const handleKeywordRowClick = (index, keyword) => {
    if (selectedKeywordIndex === index) {
      setSelectedKeywordIndex(null)
      setExpandedKeywordData([])
    } else {
      setSelectedKeywordIndex(index)
      
      // 해당 키워드의 매체별 데이터 생성
      const mediaData = ['네이버', '카카오', '구글', '메타', '틱톡'].map(media => ({
        media,
        keyword,
        campaign: `${media} ${keyword} 캠페인`,
        adGroup: `${media} ${keyword} 광고그룹`,
        impressions: Math.floor(Math.random() * 10000) + 1000,
        clicks: Math.floor(Math.random() * 500) + 50,
        ctr: parseFloat(((Math.random() * 5) + 1).toFixed(1)),
        cpc_today: Math.floor(Math.random() * 1000) + 100,
        cpc_yesterday: Math.floor(Math.random() * 1000) + 100,
        cpc_7days: Math.floor(Math.random() * 1000) + 100,
        cpc_last_week: Math.floor(Math.random() * 1000) + 100,
        cost_today: Math.floor(Math.random() * 100000) + 10000,
        cost_yesterday: Math.floor(Math.random() * 100000) + 10000,
        cost_7days: Math.floor(Math.random() * 700000) + 70000,
        cost_last_week: Math.floor(Math.random() * 700000) + 70000
      }))
      
      setExpandedKeywordData(mediaData)
    }
  }

  // 외부 클릭 처리
  const handleOutsideClick = () => {
    setSelectedKeywordIndex(null)
    setExpandedKeywordData([])
  }

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

  // 기간별 합산 정보 계산
  const calculateKeywordPeriodSummary = (data) => {
    if (!data || data.length === 0) {
      return {
        totalImpressions: 0,
        totalClicks: 0,
        totalCostToday: 0,
        totalCostYesterday: 0,
        totalCost7Days: 0,
        totalCostLastWeek: 0,
        avgCtr: 0,
        avgCpc: 0,
        avgCpa: 0,
        costChangeRate: 0,
        cpcChangeRate: 0,
        conversionChangeRate: 0,
        cpaChangeRate: 0,
        ctrChangeRate: 0
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

  // 키워드 고정 더미 데이터 생성
  const generateKeywordData = () => {
    const fixedKeywordData = [
      { keyword: '브랜드명', media: '네이버', campaign: '네이버 브랜드 캠페인', adGroup: '네이버 브랜드 키워드', impressions: 15000, clicks: 750, ctr: 5.0, cpc_today: 320, cpc_yesterday: 315, cpc_7days: 318, cpc_last_week: 322, cost_today: 80000, cost_yesterday: 78000, cost_7days: 320000, cost_last_week: 325000 },
      { keyword: '브랜드명', media: '구글', campaign: '구글 브랜드 캠페인', adGroup: '구글 브랜드 키워드', impressions: 12000, clicks: 600, ctr: 5.0, cpc_today: 350, cpc_yesterday: 345, cpc_7days: 348, cpc_last_week: 352, cost_today: 70000, cost_yesterday: 69000, cost_7days: 280000, cost_last_week: 285000 },
      { keyword: '브랜드명', media: '카카오', campaign: '카카오 브랜드 캠페인', adGroup: '카카오 브랜드 키워드', impressions: 10000, clicks: 500, ctr: 5.0, cpc_today: 380, cpc_yesterday: 375, cpc_7days: 378, cpc_last_week: 382, cost_today: 60000, cost_yesterday: 58000, cost_7days: 240000, cost_last_week: 245000 },
      { keyword: '브랜드명', media: '메타', campaign: '메타 브랜드 캠페인', adGroup: '메타 브랜드 키워드', impressions: 8000, clicks: 400, ctr: 5.0, cpc_today: 400, cpc_yesterday: 395, cpc_7days: 398, cpc_last_week: 402, cost_today: 50000, cost_yesterday: 48000, cost_7days: 200000, cost_last_week: 205000 },
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
    
    return fixedKeywordData
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
    const summary = calculatePeriodSummary(results)
    setPeriodSummary(summary)
  }, [])

  // 기간별 합산 정보 계산
  const calculatePeriodSummary = (data) => {
    if (!data || data.length === 0) {
      return {
        totalImpressions: 0,
        totalClicks: 0,
        totalCostToday: 0,
        totalCostYesterday: 0,
        totalCost7Days: 0,
        totalCostLastWeek: 0,
        avgCtr: 0,
        avgCpc: 0,
        avgCpa: 0,
        costChangeRate: 0,
        cpcChangeRate: 0,
        conversionChangeRate: 0,
        cpaChangeRate: 0,
        ctrChangeRate: 0
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
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {/* 당일 vs 전일 테이블 */}
            <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', border: '1px solid #dee2e6' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#e9ecef' }}>
                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>기간</th>
                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>당일</th>
                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>전일</th>
                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>등락</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>광고비</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{(periodSummary.totalCostToday || 0).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{(periodSummary.totalCostYesterday || 0).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6', color: periodSummary.costChangeRate >= 0 ? '#28a745' : '#dc3545' }}>{periodSummary.costChangeRate >= 0 ? '▲' : '▼'} {Math.abs(periodSummary.costChangeRate || 0).toFixed(1)}%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>CPC</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{(periodSummary.avgCpc || 0).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{(periodSummary.avgCpcYesterday || 0).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6', color: periodSummary.cpcChangeRate >= 0 ? '#28a745' : '#dc3545' }}>{periodSummary.cpcChangeRate >= 0 ? '▲' : '▼'} {Math.abs(periodSummary.cpcChangeRate || 0).toFixed(1)}%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>전환수</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{(periodSummary.totalConversions || 0).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{(periodSummary.totalConversionsYesterday || 0).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6', color: periodSummary.conversionChangeRate >= 0 ? '#28a745' : '#dc3545' }}>{periodSummary.conversionChangeRate >= 0 ? '▲' : '▼'} {Math.abs(periodSummary.conversionChangeRate || 0).toFixed(1)}%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>CPA</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{(periodSummary.avgCpa || 0).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{(periodSummary.avgCpaYesterday || 0).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6', color: periodSummary.cpaChangeRate >= 0 ? '#28a745' : '#dc3545' }}>{periodSummary.cpaChangeRate >= 0 ? '▲' : '▼'} {Math.abs(periodSummary.cpaChangeRate || 0).toFixed(1)}%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>CVR</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>12.0%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>10.0%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6', color: '#28a745' }}>▲ 20.0%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>노출수</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{(periodSummary.totalImpressions || 0).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalImpressions || 0) * 0.88).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6', color: '#28a745' }}>▲ 13.6%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>클릭수</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{(periodSummary.totalClicks || 0).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalClicks || 0) * 0.92).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6', color: '#28a745' }}>▲ 8.7%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 10px', fontWeight: '600' }}>CTR</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>{(periodSummary.avgCtr || 0).toFixed(1)}%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>{((periodSummary.avgCtr || 0) * 0.96).toFixed(1)}%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: '#dc3545' }}>▼ 4.2%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 최근 7일 vs 이전 7일 테이블 */}
            <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', border: '1px solid #dee2e6' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#e9ecef' }}>
                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>기간</th>
                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>최근 7일</th>
                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>이전 7일</th>
                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>등락</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>광고비</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>₩{Math.floor((periodSummary.totalCost || 0) * 7.2).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>₩{Math.floor((periodSummary.totalCost || 0) * 6.8).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6', color: '#28a745' }}>▲ 5.9%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>CPC</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>₩{Math.floor((periodSummary.avgCpc || 0) * 1.03).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>₩{Math.floor((periodSummary.avgCpc || 0) * 1.12).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6', color: '#dc3545' }}>▼ 8.0%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>전환수</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalClicks || 0) * 0.86).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalClicks || 0) * 0.75).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6', color: '#28a745' }}>▲ 14.7%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>CPA</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>₩{Math.floor((periodSummary.totalCost || 0) * 7.2 / Math.max(Math.floor((periodSummary.totalClicks || 0) * 0.86), 1)).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>₩{Math.floor((periodSummary.totalCost || 0) * 6.8 / Math.max(Math.floor((periodSummary.totalClicks || 0) * 0.75), 1)).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6', color: '#dc3545' }}>▼ 7.7%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>CVR</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>12.3%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>10.7%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6', color: '#28a745' }}>▲ 15.0%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>노출수</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalImpressions || 0) * 6.9).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalImpressions || 0) * 6.2).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6', color: '#28a745' }}>▲ 11.3%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>클릭수</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalClicks || 0) * 7.0).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalClicks || 0) * 6.5).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6', color: '#28a745' }}>▲ 7.7%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 10px', fontWeight: '600' }}>CTR</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>{((periodSummary.avgCtr || 0) * 1.01).toFixed(1)}%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>{((periodSummary.avgCtr || 0) * 1.05).toFixed(1)}%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: '#dc3545' }}>▼ 3.8%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 당월 vs 전월 테이블 */}
            <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', border: '1px solid #dee2e6' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#e9ecef' }}>
                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>기간</th>
                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>당월</th>
                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>전월</th>
                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>등락</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>광고비</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>₩{Math.floor((periodSummary.totalCost || 0) * 28.5).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>₩{Math.floor((periodSummary.totalCost || 0) * 31.2).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6', color: '#dc3545' }}>▼ 8.7%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>CPC</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>₩{Math.floor((periodSummary.avgCpc || 0) * 0.97).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>₩{Math.floor((periodSummary.avgCpc || 0) * 1.05).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6', color: '#28a745' }}>▲ 7.6%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>전환수</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalClicks || 0) * 3.4).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalClicks || 0) * 3.8).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6', color: '#dc3545' }}>▼ 10.5%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>CPA</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>₩{Math.floor((periodSummary.totalCost || 0) * 28.5 / Math.max(Math.floor((periodSummary.totalClicks || 0) * 3.4), 1)).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>₩{Math.floor((periodSummary.totalCost || 0) * 31.2 / Math.max(Math.floor((periodSummary.totalClicks || 0) * 3.8), 1)).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6', color: '#28a745' }}>▲ 1.8%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>CVR</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>11.3%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>12.6%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6', color: '#dc3545' }}>▼ 10.3%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>노출수</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalImpressions || 0) * 29.3).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalImpressions || 0) * 32.1).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6', color: '#dc3545' }}>▼ 8.7%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>클릭수</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalClicks || 0) * 30.1).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalClicks || 0) * 30.2).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6', color: '#dc3545' }}>▼ 0.3%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 10px', fontWeight: '600' }}>CTR</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>{((periodSummary.avgCtr || 0) * 1.03).toFixed(1)}%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>{((periodSummary.avgCtr || 0) * 0.94).toFixed(1)}%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', color: '#28a745' }}>▲ 9.6%</td>
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
              키워드를 클릭하면 매체별 비교가 가능합니다.
            </span>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#e9ecef' }}>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #dee2e6',
                    borderRight: '1px solid #dee2e6',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}>키워드</th>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #dee2e6',
                    borderRight: '1px solid #dee2e6',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}>매체</th>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #dee2e6',
                    borderRight: '1px solid #dee2e6',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}>캠페인</th>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #dee2e6',
                    borderRight: '1px solid #dee2e6',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}>광고그룹</th>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #dee2e6',
                    borderRight: '1px solid #dee2e6',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}>노출수</th>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #dee2e6',
                    borderRight: '1px solid #dee2e6',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}>클릭수</th>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #dee2e6',
                    borderRight: '1px solid #dee2e6',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}>CTR</th>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #dee2e6',
                    borderRight: '1px solid #dee2e6',
                    background: '#d4e6f1',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>금일(CPC)</th>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #dee2e6',
                    borderRight: '1px solid #dee2e6',
                    background: '#d4e6f1',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>전일(CPC)</th>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #dee2e6',
                    borderRight: '1px solid #dee2e6',
                    background: '#d4e6f1',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>최근 7일(CPC)</th>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #dee2e6',
                    borderRight: '1px solid #dee2e6',
                    background: '#d4e6f1',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>지난주(CPC)</th>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #dee2e6',
                    borderRight: '1px solid #dee2e6',
                    background: '#fef7cd',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>설정기간(CPC)</th>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #dee2e6',
                    borderRight: '1px solid #dee2e6',
                    background: '#d5f4e6',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>금일(광고비)</th>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #dee2e6',
                    borderRight: '1px solid #dee2e6',
                    background: '#d5f4e6',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>전일(광고비)</th>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #dee2e6',
                    borderRight: '1px solid #dee2e6',
                    background: '#d5f4e6',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>최근 7일(광고비)</th>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #dee2e6',
                    borderRight: '1px solid #dee2e6',
                    background: '#d5f4e6',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>지난주(광고비)</th>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #dee2e6',
                    background: '#fef7cd',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>설정기간(광고비)</th>
                </tr>
              </thead>
              <tbody onClick={handleOutsideClick}>
                {filteredKeywords.map((item, index) => {
                  // 키워드별 배경색 설정
                  const isEvenKeyword = index % 2 === 0
                  const backgroundColor = isEvenKeyword ? '#ffffff' : '#f8f9fa'
                  
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
                          handleKeywordRowClick(index, item.keyword)
                        }}
                      >
                        <td style={{ 
                          padding: '10px', 
                          borderBottom: '1px solid #dee2e6',
                          borderRight: '1px solid #dee2e6',
                          fontWeight: '600',
                          color: '#495057'
                        }}>
                          {item.keyword}
                        </td>
                      <td style={{ 
                        padding: '10px', 
                        borderBottom: '1px solid #dee2e6',
                        borderRight: '1px solid #dee2e6',
                        textAlign: 'center'
                      }}>
                        {item.media}
                      </td>
                      <td style={{ 
                        padding: '10px', 
                        borderBottom: '1px solid #dee2e6',
                        borderRight: '1px solid #dee2e6',
                        textAlign: 'center'
                      }}>
                        {item.campaign}
                      </td>
                      <td style={{ 
                        padding: '10px', 
                        borderBottom: '1px solid #dee2e6',
                        borderRight: '1px solid #dee2e6',
                        textAlign: 'center'
                      }}>
                        {item.adGroup}
                      </td>
                      <td style={{ 
                        padding: '10px', 
                        borderBottom: '1px solid #dee2e6',
                        borderRight: '1px solid #dee2e6',
                        textAlign: 'right'
                      }}>
                        {item.impressions.toLocaleString()}
                      </td>
                      <td style={{ 
                        padding: '10px', 
                        borderBottom: '1px solid #dee2e6',
                        borderRight: '1px solid #dee2e6',
                        textAlign: 'right'
                      }}>
                        {item.clicks.toLocaleString()}
                      </td>
                      <td style={{ 
                        padding: '10px', 
                        borderBottom: '1px solid #dee2e6',
                        borderRight: '1px solid #dee2e6',
                        textAlign: 'right'
                      }}>
                        {item.ctr.toFixed(1)}%
                      </td>
                      <td style={{ 
                        padding: '10px', 
                        borderBottom: '1px solid #dee2e6',
                        borderRight: '1px solid #dee2e6',
                        textAlign: 'right',
                        background: '#f8f9fa'
                      }}>
                        {item.cpc_today.toLocaleString()}
                      </td>
                      <td style={{ 
                        padding: '10px', 
                        borderBottom: '1px solid #dee2e6',
                        borderRight: '1px solid #dee2e6',
                        textAlign: 'right',
                        background: '#f8f9fa'
                      }}>
                        {item.cpc_yesterday.toLocaleString()}
                      </td>
                      <td style={{ 
                        padding: '10px', 
                        borderBottom: '1px solid #dee2e6',
                        borderRight: '1px solid #dee2e6',
                        textAlign: 'right',
                        background: '#f8f9fa'
                      }}>
                        {item.cpc_7days.toLocaleString()}
                      </td>
                      <td style={{ 
                        padding: '10px', 
                        borderBottom: '1px solid #dee2e6',
                        borderRight: '1px solid #dee2e6',
                        textAlign: 'right',
                        background: '#f8f9fa'
                      }}>
                        {item.cpc_last_week.toLocaleString()}
                      </td>
                      <td style={{ 
                        padding: '10px', 
                        borderBottom: '1px solid #dee2e6',
                        borderRight: '1px solid #dee2e6',
                        textAlign: 'right',
                        background: '#fffbf0'
                      }}>
                        {Math.round((item.cost_today + item.cost_yesterday + item.cost_7days + item.cost_last_week) / (item.clicks || 1)).toLocaleString()}
                      </td>
                      <td style={{ 
                        padding: '10px', 
                        borderBottom: '1px solid #dee2e6',
                        borderRight: '1px solid #dee2e6',
                        textAlign: 'right',
                        background: '#f0f9ff'
                      }}>
                        {item.cost_today.toLocaleString()}
                      </td>
                      <td style={{ 
                        padding: '10px', 
                        borderBottom: '1px solid #dee2e6',
                        borderRight: '1px solid #dee2e6',
                        textAlign: 'right',
                        background: '#f0f9ff'
                      }}>
                        {item.cost_yesterday.toLocaleString()}
                      </td>
                      <td style={{ 
                        padding: '10px', 
                        borderBottom: '1px solid #dee2e6',
                        borderRight: '1px solid #dee2e6',
                        textAlign: 'right',
                        background: '#f0f9ff'
                      }}>
                        {item.cost_7days.toLocaleString()}
                      </td>
                      <td style={{ 
                        padding: '10px', 
                        borderBottom: '1px solid #dee2e6',
                        borderRight: '1px solid #dee2e6',
                        textAlign: 'right',
                        background: '#f0f9ff'
                      }}>
                        {item.cost_last_week.toLocaleString()}
                      </td>
                      <td style={{ 
                        padding: '10px', 
                        borderBottom: '1px solid #dee2e6',
                        textAlign: 'right',
                        background: '#fffbf0'
                      }}>
                        {(item.cost_today + item.cost_yesterday + item.cost_7days + item.cost_last_week).toLocaleString()}
                      </td>
                    </tr>
                    {/* 키워드 행 클릭 시 나타나는 매체별 세부 데이터 */}
                    {selectedKeywordIndex === index && (
                      expandedKeywordData.map((mediaItem, mediaIndex) => (
                        <tr key={`${index}-${mediaIndex}`} style={{ 
                          background: '#f8f9fa', 
                          borderLeft: '3px solid #ffc107',
                          animation: 'slideDown 0.3s ease-out'
                        }}>
                          <td style={{ 
                            padding: '8px 10px', 
                            borderBottom: '1px solid #dee2e6',
                            borderRight: '1px solid #dee2e6',
                            fontWeight: '500',
                            color: '#6c757d',
                            paddingLeft: '20px'
                          }}>
                            └ {mediaItem.keyword}
                          </td>
                          <td style={{ 
                            padding: '8px 10px', 
                            borderBottom: '1px solid #dee2e6',
                            borderRight: '1px solid #dee2e6',
                            textAlign: 'center',
                            color: '#6c757d'
                          }}>
                            {mediaItem.media}
                          </td>
                          <td style={{ 
                            padding: '8px 10px', 
                            borderBottom: '1px solid #dee2e6',
                            borderRight: '1px solid #dee2e6',
                            textAlign: 'center',
                            color: '#6c757d'
                          }}>
                            {mediaItem.campaign}
                          </td>
                          <td style={{ 
                            padding: '8px 10px', 
                            borderBottom: '1px solid #dee2e6',
                            borderRight: '1px solid #dee2e6',
                            textAlign: 'center',
                            color: '#6c757d'
                          }}>
                            {mediaItem.adGroup}
                          </td>
                          <td style={{ 
                            padding: '8px 10px', 
                            borderBottom: '1px solid #dee2e6',
                            borderRight: '1px solid #dee2e6',
                            textAlign: 'right',
                            color: '#6c757d'
                          }}>
                            {mediaItem.impressions.toLocaleString()}
                          </td>
                          <td style={{ 
                            padding: '8px 10px', 
                            borderBottom: '1px solid #dee2e6',
                            borderRight: '1px solid #dee2e6',
                            textAlign: 'right',
                            color: '#6c757d'
                          }}>
                            {mediaItem.clicks.toLocaleString()}
                          </td>
                          <td style={{ 
                            padding: '8px 10px', 
                            borderBottom: '1px solid #dee2e6',
                            borderRight: '1px solid #dee2e6',
                            textAlign: 'right',
                            color: '#6c757d'
                          }}>
                            {mediaItem.ctr.toFixed(1)}%
                          </td>
                          <td style={{ 
                            padding: '8px 10px', 
                            borderBottom: '1px solid #dee2e6',
                            borderRight: '1px solid #dee2e6',
                            textAlign: 'right',
                            background: '#f1f5f9',
                            color: '#6c757d'
                          }}>
                            {mediaItem.cpc_today.toLocaleString()}
                          </td>
                          <td style={{ 
                            padding: '8px 10px', 
                            borderBottom: '1px solid #dee2e6',
                            borderRight: '1px solid #dee2e6',
                            textAlign: 'right',
                            background: '#f1f5f9',
                            color: '#6c757d'
                          }}>
                            {mediaItem.cpc_yesterday.toLocaleString()}
                          </td>
                          <td style={{ 
                            padding: '8px 10px', 
                            borderBottom: '1px solid #dee2e6',
                            borderRight: '1px solid #dee2e6',
                            textAlign: 'right',
                            background: '#f1f5f9',
                            color: '#6c757d'
                          }}>
                            {mediaItem.cpc_7days.toLocaleString()}
                          </td>
                          <td style={{ 
                            padding: '8px 10px', 
                            borderBottom: '1px solid #dee2e6',
                            borderRight: '1px solid #dee2e6',
                            textAlign: 'right',
                            background: '#f1f5f9',
                            color: '#6c757d'
                          }}>
                            {mediaItem.cpc_last_week.toLocaleString()}
                          </td>
                          <td style={{ 
                            padding: '8px 10px', 
                            borderBottom: '1px solid #dee2e6',
                            borderRight: '1px solid #dee2e6',
                            textAlign: 'right',
                            background: '#fff8e1',
                            color: '#6c757d'
                          }}>
                            {Math.round((mediaItem.cost_today + mediaItem.cost_yesterday + mediaItem.cost_7days + mediaItem.cost_last_week) / (mediaItem.clicks || 1)).toLocaleString()}
                          </td>
                          <td style={{ 
                            padding: '8px 10px', 
                            borderBottom: '1px solid #dee2e6',
                            borderRight: '1px solid #dee2e6',
                            textAlign: 'right',
                            background: '#f0f9ff',
                            color: '#6c757d'
                          }}>
                            {mediaItem.cost_today.toLocaleString()}
                          </td>
                          <td style={{ 
                            padding: '8px 10px', 
                            borderBottom: '1px solid #dee2e6',
                            borderRight: '1px solid #dee2e6',
                            textAlign: 'right',
                            background: '#f0f9ff',
                            color: '#6c757d'
                          }}>
                            {mediaItem.cost_yesterday.toLocaleString()}
                          </td>
                          <td style={{ 
                            padding: '8px 10px', 
                            borderBottom: '1px solid #dee2e6',
                            borderRight: '1px solid #dee2e6',
                            textAlign: 'right',
                            background: '#f0f9ff',
                            color: '#6c757d'
                          }}>
                            {mediaItem.cost_7days.toLocaleString()}
                          </td>
                          <td style={{ 
                            padding: '8px 10px', 
                            borderBottom: '1px solid #dee2e6',
                            borderRight: '1px solid #dee2e6',
                            textAlign: 'right',
                            background: '#f0f9ff',
                            color: '#6c757d'
                          }}>
                            {mediaItem.cost_last_week.toLocaleString()}
                          </td>
                          <td style={{ 
                            padding: '8px 10px', 
                            borderBottom: '1px solid #dee2e6',
                            textAlign: 'right',
                            background: '#fff8e1',
                            color: '#6c757d'
                          }}>
                            {(mediaItem.cost_today + mediaItem.cost_yesterday + mediaItem.cost_7days + mediaItem.cost_last_week).toLocaleString()}
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
          {filteredKeywords.length === 0 && (
            <div style={{ 
              textAlign: 'center',
              padding: '20px',
              color: '#6c757d'
            }}>
              검색 조건에 맞는 키워드가 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 