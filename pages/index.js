import Layout from '../components/Layout'
import ProtectedRoute from '../components/ProtectedRoute'
import React, { useState, useEffect } from 'react'
import { useAuth, ROLES } from '../context/AuthContext'
import { useRouter } from 'next/router'
import DashboardContainer from '../components/Dashboard/DashboardContainer'
import SuperAdminDashboard from '../components/Dashboard/SuperAdminDashboard'

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

  return (
    <div className="content-area">
      <div className="media-overview">
        <h2>{selectedAdvertiser.name} - {media} 광고</h2>
        <p>{selectedAdvertiser.name}의 {media} 광고 캠페인 성과를 관리하고 분석하세요.</p>
      </div>

      <div className="media-stats">
        <div className="stat-card">
          <h4>이번 달 광고비</h4>
          <p className="stat-value">₩2,345,678</p>
        </div>
        <div className="stat-card">
          <h4>활성 캠페인</h4>
          <p className="stat-value">8</p>
        </div>
        <div className="stat-card">
          <h4>클릭률</h4>
          <p className="stat-value">2.8%</p>
        </div>
        <div className="stat-card">
          <h4>전환율</h4>
          <p className="stat-value">1.2%</p>
        </div>
      </div>

      <div className="campaign-list">
        <h3>활성 캠페인 목록</h3>
        <div className="campaign-grid">
          <div className="campaign-item">
            <h4>브랜드 검색 캠페인</h4>
            <p>상태: <span className="status active">활성</span></p>
            <p>예산: ₩50,000/일</p>
            <p>클릭률: 3.2%</p>
            <p>광고주: {selectedAdvertiser.name}</p>
          </div>
          <div className="campaign-item">
            <h4>제품 홍보 캠페인</h4>
            <p>상태: <span className="status active">활성</span></p>
            <p>예산: ₩30,000/일</p>
            <p>클릭률: 2.8%</p>
            <p>광고주: {selectedAdvertiser.name}</p>
          </div>
          <div className="campaign-item">
            <h4>브랜드 인지도 캠페인</h4>
            <p>상태: <span className="status paused">일시정지</span></p>
            <p>예산: ₩20,000/일</p>
            <p>클릭률: 1.9%</p>
            <p>광고주: {selectedAdvertiser.name}</p>
          </div>
        </div>
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
  
  // 당월 1일과 당일 계산
  const today = new Date()
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  
  // 필터 상태 관리
  const [selectedMedias, setSelectedMedias] = useState(['네이버', '카카오', '구글', '메타'])
  const [keywordMetric, setKeywordMetric] = useState('광고비')
  const [sortOrder, setSortOrder] = useState('내림차순')
  const [keywordCount, setKeywordCount] = useState('')
  const [startDate, setStartDate] = useState(firstDayOfMonth.toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0])
  
  // 검색 결과 상태 관리
  const [filteredKeywords, setFilteredKeywords] = useState([])
  const [keywordData, setKeywordData] = useState([])
  
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
    const results = getFilteredKeywords()
    setFilteredKeywords(results)
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
      const mediaData = ['네이버', '카카오', '구글', '메타'].map(media => ({
        date,
        media,
        campaign: `${media} 일자별 캠페인`,
        impressions: Math.floor(Math.random() * 15000) + 5000,
        clicks: Math.floor(Math.random() * 800) + 200,
        ctr: ((Math.random() * 4) + 1).toFixed(2),
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

  // 일자별 샘플 데이터 생성
  const generateDailyData = () => {
    const data = []
    for (let i = 30; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      data.push({
        date: date.toISOString().split('T')[0],
        impressions: Math.floor(Math.random() * 50000) + 10000,
        clicks: Math.floor(Math.random() * 2000) + 500,
        conversions: Math.floor(Math.random() * 100) + 20,
        cost: Math.floor(Math.random() * 500000) + 100000,
        revenue: Math.floor(Math.random() * 1000000) + 200000,
        cpc: Math.floor(Math.random() * 800) + 200
      })
    }
    return data
  }

  // 키워드 샘플 데이터 생성
  const generateKeywordData = () => {
    const keywords = [
      '브랜드명', '제품명', '카테고리', '경쟁사', '일반키워드', 
      '롱테일키워드', '상품후기', '가격비교', '이벤트', '할인',
      '신제품', '인기상품', '추천', '베스트', '특가'
    ]
    
    const medias = ['네이버', '카카오', '구글', '메타']
    const campaigns = ['브랜드캠페인', '제품캠페인', '이벤트캠페인']
    const adGroups = ['그룹A', '그룹B', '그룹C']
    
    const data = []
    
    keywords.forEach(keyword => {
      // 각 키워드당 1-3개의 매체 데이터 생성
      const numMedias = Math.floor(Math.random() * 3) + 1
      const selectedMedias = medias.slice(0, numMedias)
      
      selectedMedias.forEach(media => {
        data.push({
          keyword,
          media,
          campaign: campaigns[Math.floor(Math.random() * campaigns.length)],
          adGroup: adGroups[Math.floor(Math.random() * adGroups.length)],
          impressions: Math.floor(Math.random() * 20000) + 5000,
          clicks: Math.floor(Math.random() * 800) + 200,
          ctr: ((Math.random() * 5) + 1).toFixed(2),
          cpc_today: Math.floor(Math.random() * 1000) + 200,
          cpc_yesterday: Math.floor(Math.random() * 1000) + 200,
          cpc_7days: Math.floor(Math.random() * 1000) + 200,
          cpc_last_week: Math.floor(Math.random() * 1000) + 200,
          cost_today: Math.floor(Math.random() * 100000) + 50000,
          cost_yesterday: Math.floor(Math.random() * 100000) + 50000,
          cost_7days: Math.floor(Math.random() * 500000) + 200000,
          cost_last_week: Math.floor(Math.random() * 500000) + 200000
        })
      })
    })
    
    return data
  }

  const dailyData = generateDailyData()

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
        groupedByKeyword[item.keyword].ctr = ((groupedByKeyword[item.keyword].clicks / groupedByKeyword[item.keyword].impressions) * 100).toFixed(2)
      }
    })
    
    // 그룹화된 데이터를 배열로 변환
    filtered = Object.values(groupedByKeyword)
    
    // 광고비 기준 내림차순 정렬
    filtered.sort((a, b) => b.cost_today - a.cost_today)
    
    // 개수 제한
    if (keywordCount && !isNaN(keywordCount) && keywordCount > 0) {
      filtered = filtered.slice(0, parseInt(keywordCount))
    }
    
    return filtered
  }

  // 초기 데이터 설정
  useEffect(() => {
    if (selectedAdvertiser) {
      // 키워드 데이터 생성
      const initialData = generateKeywordData()
      setKeywordData(initialData)
      
      // 초기에는 모든 키워드 데이터를 표시 (광고비 기준 내림차순, 키워드별 그룹화)
      setTimeout(() => {
        const initialResults = getFilteredKeywords()
        setFilteredKeywords(initialResults)
      }, 0)
    }
  }, [selectedAdvertiser])

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
              {['네이버', '카카오', '구글', '메타'].map(media => (
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

          {/* 기간 설정 */}
          <div style={{ flex: '1' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#495057'
            }}>기간 설정</label>
            <div style={{ 
              display: 'flex', 
              gap: '15px',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.9rem', color: '#6c757d' }}>시작일</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{
                    padding: '6px 8px',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    fontSize: '0.9rem',
                    width: '140px'
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.9rem', color: '#6c757d' }}>종료일</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
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
          </div>
          
          {/* 키워드 필터링 */}
          <div style={{ flex: '1', position: 'relative' }}>
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
              alignItems: 'flex-end'
            }}>
              {/* 지표 선택 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.9rem', color: '#6c757d' }}>지표</label>
                <select 
                  value={keywordMetric}
                  onChange={(e) => setKeywordMetric(e.target.value)}
                  style={{
                    padding: '6px 8px',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    fontSize: '0.9rem',
                    width: '100px'
                  }}
                >
                  <option value="노출수">노출수</option>
                  <option value="클릭수">클릭수</option>
                  <option value="CPC">CPC</option>
                  <option value="광고비">광고비</option>
                </select>
              </div>
              
              {/* 정렬 선택 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.9rem', color: '#6c757d' }}>정렬</label>
                <select 
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  style={{
                    padding: '6px 8px',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    fontSize: '0.9rem',
                    width: '100px'
                  }}
                >
                  <option value="내림차순">내림차순</option>
                  <option value="오름차순">오름차순</option>
                </select>
              </div>
              
              {/* 개수 입력 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.9rem', color: '#6c757d' }}>개수</label>
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
                    width: '100px'
                  }}
                />
              </div>
            </div>

            {/* 검색 버튼 - 우측 하단에 위치 */}
            <div style={{ 
              position: 'absolute', 
              bottom: '10px', 
              right: '10px' 
            }}>
              <button
                onClick={handleSearch}
                style={{
                  padding: '8px 16px',
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#218838'}
                onMouseOut={(e) => e.target.style.background = '#28a745'}
              >
                검색
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '15px',
          marginBottom: '30px'
        }}>
          <div style={{ 
            background: '#667eea', 
            color: 'white', 
            padding: '12px', 
            borderRadius: '8px',
            textAlign: 'center',
            height: '65px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <div style={{ fontSize: '0.8rem', marginBottom: '4px' }}>총 노출수</div>
            <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>
              {dailyData.reduce((sum, item) => sum + item.impressions, 0).toLocaleString()}
            </div>
          </div>
          <div style={{ 
            background: '#28a745', 
            color: 'white', 
            padding: '12px', 
            borderRadius: '8px',
            textAlign: 'center',
            height: '65px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <div style={{ fontSize: '0.8rem', marginBottom: '4px' }}>총 클릭수</div>
            <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>
              {dailyData.reduce((sum, item) => sum + item.clicks, 0).toLocaleString()}
            </div>
          </div>
          <div style={{ 
            background: '#ffc107', 
            color: 'white', 
            padding: '12px', 
            borderRadius: '8px',
            textAlign: 'center',
            height: '65px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <div style={{ fontSize: '0.8rem', marginBottom: '4px' }}>총 전환수</div>
            <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>
              {dailyData.reduce((sum, item) => sum + item.conversions, 0).toLocaleString()}
            </div>
          </div>
          <div style={{ 
            background: '#dc3545', 
            color: 'white', 
            padding: '12px', 
            borderRadius: '8px',
            textAlign: 'center',
            height: '65px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <div style={{ fontSize: '0.8rem', marginBottom: '4px' }}>총 광고비</div>
            <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>
              ₩{Math.floor(dailyData.reduce((sum, item) => sum + item.cost, 0) / 10000)}만원
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
            <span style={{ 
              fontSize: '0.9rem', 
              color: '#6c757d',
              fontStyle: 'italic'
            }}>
              일자를 클릭하면 매체별 비교가 가능합니다.
            </span>
          </div>
          
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
                {dailyData.slice(0, 15).map((item, index) => {
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
                          {item.impressions > 0 ? ((item.clicks / item.impressions) * 100).toFixed(2) + '%' : '0.00%'}
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
                              {mediaItem.ctr}%
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
        </div>

      </div>
    </div>
  )
}

function KeywordDataContent() {
  const { selectedAdvertiser } = useAuth()
  
  // 당월 1일과 당일 계산
  const today = new Date()
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  
  // 필터 상태 관리
  const [selectedMedias, setSelectedMedias] = useState(['네이버', '카카오', '구글', '메타'])
  const [keywordMetric, setKeywordMetric] = useState('광고비')
  const [sortOrder, setSortOrder] = useState('내림차순')
  const [keywordCount, setKeywordCount] = useState('')
  const [startDate, setStartDate] = useState(firstDayOfMonth.toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0])
  
  // 검색 결과 상태 관리
  const [filteredKeywords, setFilteredKeywords] = useState([])
  const [keywordData, setKeywordData] = useState([])
  
  // 키워드 행 선택 및 슬라이드 상태 관리
  const [selectedKeywordIndex, setSelectedKeywordIndex] = useState(null)
  const [expandedKeywordData, setExpandedKeywordData] = useState([])
  
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
  }

  // 키워드 행 클릭 처리
  const handleKeywordRowClick = (index, keyword) => {
    if (selectedKeywordIndex === index) {
      setSelectedKeywordIndex(null)
      setExpandedKeywordData([])
    } else {
      setSelectedKeywordIndex(index)
      
      // 해당 키워드의 매체별 데이터 생성
      const mediaData = ['네이버', '카카오', '구글', '메타'].map(media => ({
        media,
        keyword,
        campaign: `${media} ${keyword} 캠페인`,
        adGroup: `${media} ${keyword} 광고그룹`,
        impressions: Math.floor(Math.random() * 10000) + 1000,
        clicks: Math.floor(Math.random() * 500) + 50,
        ctr: ((Math.random() * 5) + 1).toFixed(2),
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

  // 키워드 데이터 생성
  const generateKeywordData = () => {
    const keywords = [
      '브랜드명', '제품명', '카테고리', '경쟁사', '일반키워드', 
      '롱테일키워드', '상품후기', '가격비교', '이벤트', '할인',
      '신제품', '인기상품', '추천', '베스트', '특가', '리뷰',
      '사용법', '구매', '배송', '무료', '추천템', '인기템',
      '베스트셀러', '할인가', '특가상품', '이벤트상품'
    ]
    
    const medias = ['네이버', '카카오', '구글', '메타']
    const campaigns = ['브랜드 캠페인', '제품 캠페인', '카테고리 캠페인']
    const adGroups = ['핵심 키워드', '브랜드 키워드', '제품 키워드']
    
    const data = []
    keywords.forEach(keyword => {
      medias.forEach(media => {
        const randomCampaign = campaigns[Math.floor(Math.random() * campaigns.length)]
        const randomAdGroup = adGroups[Math.floor(Math.random() * adGroups.length)]
        
        data.push({
          keyword,
          media,
          campaign: `${media} ${randomCampaign}`,
          adGroup: `${media} ${randomAdGroup}`,
          impressions: Math.floor(Math.random() * 10000) + 1000,
          clicks: Math.floor(Math.random() * 500) + 50,
          ctr: ((Math.random() * 5) + 1).toFixed(2),
          cpc_today: Math.floor(Math.random() * 1000) + 100,
          cpc_yesterday: Math.floor(Math.random() * 1000) + 100,
          cpc_7days: Math.floor(Math.random() * 1000) + 100,
          cpc_last_week: Math.floor(Math.random() * 1000) + 100,
          cost_today: Math.floor(Math.random() * 100000) + 10000,
          cost_yesterday: Math.floor(Math.random() * 100000) + 10000,
          cost_7days: Math.floor(Math.random() * 700000) + 70000,
          cost_last_week: Math.floor(Math.random() * 700000) + 70000
        })
      })
    })
    
    return data
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
    
    // 정렬 기준에 따라 정렬
    if (keywordMetric === '광고비') {
      result.sort((a, b) => {
        const aValue = a.cost_today + a.cost_yesterday + a.cost_7days + a.cost_last_week
        const bValue = b.cost_today + b.cost_yesterday + b.cost_7days + b.cost_last_week
        return sortOrder === '내림차순' ? bValue - aValue : aValue - bValue
      })
    } else if (keywordMetric === '노출수') {
      result.sort((a, b) => {
        return sortOrder === '내림차순' ? b.impressions - a.impressions : a.impressions - b.impressions
      })
    } else if (keywordMetric === '클릭수') {
      result.sort((a, b) => {
        return sortOrder === '내림차순' ? b.clicks - a.clicks : a.clicks - b.clicks
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
    const data = generateKeywordData()
    setKeywordData(data)
  }, [])

  // 검색 결과 초기화
  useEffect(() => {
    if (keywordData.length > 0) {
      const results = getFilteredKeywords()
      setFilteredKeywords(results)
    }
  }, [selectedMedias, keywordMetric, sortOrder, keywordCount, keywordData])

  // 카드 데이터 계산
  const calculateCardData = () => {
    const totalImpressions = filteredKeywords.reduce((sum, item) => sum + item.impressions, 0)
    const totalClicks = filteredKeywords.reduce((sum, item) => sum + item.clicks, 0)
    const totalConversions = Math.floor(totalClicks * 0.05) // 5% 전환율 가정
    const totalCost = filteredKeywords.reduce((sum, item) => sum + item.cost_today, 0)
    
    return {
      totalImpressions,
      totalClicks,
      totalConversions,
      totalCost
    }
  }

  const cardData = calculateCardData()

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
              {['네이버', '카카오', '구글', '메타'].map(media => (
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

          {/* 기간 설정 */}
          <div style={{ flex: '1' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#495057'
            }}>기간 설정</label>
            <div style={{ 
              display: 'flex', 
              gap: '15px',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.9rem', color: '#6c757d' }}>시작일</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{
                    padding: '6px 8px',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    fontSize: '0.9rem',
                    width: '140px'
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.9rem', color: '#6c757d' }}>종료일</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
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
          </div>
          
          {/* 키워드 필터링 */}
          <div style={{ flex: '1', position: 'relative' }}>
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
              alignItems: 'flex-end'
            }}>
              {/* 지표 선택 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.9rem', color: '#6c757d' }}>지표</label>
                <select 
                  value={keywordMetric} 
                  onChange={(e) => setKeywordMetric(e.target.value)}
                  style={{
                    padding: '6px 8px',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    fontSize: '0.9rem',
                    width: '100px'
                  }}
                >
                  <option value="노출수">노출수</option>
                  <option value="클릭수">클릭수</option>
                  <option value="CPC">CPC</option>
                  <option value="광고비">광고비</option>
                </select>
              </div>
              
              {/* 정렬 선택 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.9rem', color: '#6c757d' }}>정렬</label>
                <select 
                  value={sortOrder} 
                  onChange={(e) => setSortOrder(e.target.value)}
                  style={{
                    padding: '6px 8px',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    fontSize: '0.9rem',
                    width: '100px'
                  }}
                >
                  <option value="내림차순">내림차순</option>
                  <option value="오름차순">오름차순</option>
                </select>
              </div>
              
              {/* 개수 입력 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.9rem', color: '#6c757d' }}>개수</label>
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
                    width: '100px'
                  }}
                />
              </div>
            </div>

            {/* 검색 버튼 - 우측 하단에 위치 */}
            <div style={{ 
              position: 'absolute', 
              bottom: '10px', 
              right: '10px' 
            }}>
              <button
                onClick={handleSearch}
                style={{
                  padding: '8px 16px',
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#218838'}
                onMouseOut={(e) => e.target.style.background = '#28a745'}
              >
                검색
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        {/* 카드 영역 */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '15px',
          marginBottom: '30px'
        }}>
          <div style={{ 
            background: '#667eea', 
            color: 'white', 
            padding: '12px', 
            borderRadius: '8px',
            textAlign: 'center',
            height: '65px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <div style={{ fontSize: '0.8rem', marginBottom: '4px' }}>총 노출수</div>
            <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>
              {cardData.totalImpressions.toLocaleString()}
            </div>
          </div>
          
          <div style={{ 
            background: '#28a745', 
            color: 'white', 
            padding: '12px', 
            borderRadius: '8px',
            textAlign: 'center',
            height: '65px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <div style={{ fontSize: '0.8rem', marginBottom: '4px' }}>총 클릭수</div>
            <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>
              {cardData.totalClicks.toLocaleString()}
            </div>
          </div>
          
          <div style={{ 
            background: '#ffc107', 
            color: 'white', 
            padding: '12px', 
            borderRadius: '8px',
            textAlign: 'center',
            height: '65px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <div style={{ fontSize: '0.8rem', marginBottom: '4px' }}>총 전환수</div>
            <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>
              {cardData.totalConversions.toLocaleString()}
            </div>
          </div>
          
          <div style={{ 
            background: '#dc3545', 
            color: 'white', 
            padding: '12px', 
            borderRadius: '8px',
            textAlign: 'center',
            height: '65px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <div style={{ fontSize: '0.8rem', marginBottom: '4px' }}>총 광고비</div>
            <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>
              ₩{Math.floor(cardData.totalCost / 10000)}만원
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
                {/* 첫 번째 헤더 행 */}
                <tr style={{ background: '#e9ecef' }}>
                  <th rowSpan="2" style={{ 
                    padding: '12px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #dee2e6',
                    borderRight: '1px solid #dee2e6',
                    verticalAlign: 'middle'
                  }}>키워드</th>
                  <th rowSpan="2" style={{ 
                    padding: '12px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #dee2e6',
                    borderRight: '1px solid #dee2e6',
                    verticalAlign: 'middle'
                  }}>매체</th>
                  <th rowSpan="2" style={{ 
                    padding: '12px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #dee2e6',
                    borderRight: '1px solid #dee2e6',
                    verticalAlign: 'middle'
                  }}>캠페인</th>
                  <th rowSpan="2" style={{ 
                    padding: '12px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #dee2e6',
                    borderRight: '1px solid #dee2e6',
                    verticalAlign: 'middle'
                  }}>광고그룹</th>
                  <th rowSpan="2" style={{ 
                    padding: '12px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #dee2e6',
                    borderRight: '1px solid #dee2e6',
                    verticalAlign: 'middle'
                  }}>노출수</th>
                  <th rowSpan="2" style={{ 
                    padding: '12px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #dee2e6',
                    borderRight: '1px solid #dee2e6',
                    verticalAlign: 'middle'
                  }}>클릭수</th>
                  <th rowSpan="2" style={{ 
                    padding: '12px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #dee2e6',
                    borderRight: '1px solid #dee2e6',
                    verticalAlign: 'middle'
                  }}>CTR</th>
                  <th colSpan="4" style={{ 
                    padding: '12px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #dee2e6',
                    borderRight: '1px solid #dee2e6',
                    background: '#d4e6f1'
                  }}>CPC</th>
                  <th colSpan="4" style={{ 
                    padding: '12px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #dee2e6',
                    background: '#d5f4e6'
                  }}>광고비</th>
                </tr>
                {/* 두 번째 헤더 행 */}
                <tr style={{ background: '#e9ecef' }}>
                  <th style={{ 
                    padding: '8px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #dee2e6',
                    borderRight: '1px solid #dee2e6',
                    background: '#d4e6f1',
                    fontSize: '0.8rem'
                  }}>금일</th>
                  <th style={{ 
                    padding: '8px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #dee2e6',
                    borderRight: '1px solid #dee2e6',
                    background: '#d4e6f1',
                    fontSize: '0.8rem'
                  }}>전일</th>
                  <th style={{ 
                    padding: '8px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #dee2e6',
                    borderRight: '1px solid #dee2e6',
                    background: '#d4e6f1',
                    fontSize: '0.8rem'
                  }}>최근 7일</th>
                  <th style={{ 
                    padding: '8px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #dee2e6',
                    borderRight: '1px solid #dee2e6',
                    background: '#d4e6f1',
                    fontSize: '0.8rem'
                  }}>지난 주</th>
                  <th style={{ 
                    padding: '8px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #dee2e6',
                    borderRight: '1px solid #dee2e6',
                    background: '#d5f4e6',
                    fontSize: '0.8rem'
                  }}>금일</th>
                  <th style={{ 
                    padding: '8px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #dee2e6',
                    borderRight: '1px solid #dee2e6',
                    background: '#d5f4e6',
                    fontSize: '0.8rem'
                  }}>전일</th>
                  <th style={{ 
                    padding: '8px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #dee2e6',
                    borderRight: '1px solid #dee2e6',
                    background: '#d5f4e6',
                    fontSize: '0.8rem'
                  }}>최근 7일</th>
                  <th style={{ 
                    padding: '8px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #dee2e6',
                    background: '#d5f4e6',
                    fontSize: '0.8rem'
                  }}>지난 주</th>
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
                        {item.ctr}%
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
                        textAlign: 'right',
                        background: '#f0f9ff'
                      }}>
                        {item.cost_last_week.toLocaleString()}
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
                            {mediaItem.ctr}%
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
                            textAlign: 'right',
                            background: '#f0f9ff',
                            color: '#6c757d'
                          }}>
                            {mediaItem.cost_last_week.toLocaleString()}
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