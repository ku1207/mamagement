import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import KeywordResultTable from '../components/KeywordManagement/KeywordResultTable.js'
import KpiManagement from '../components/KpiManagement/KpiManagement.js'
import styles from '../styles/components/KeywordManagement.module.css'

// KPI 관리 탭 컴포넌트 (재사용 가능한 컴포넌트 사용)
function KpiManagementTab() {
  return <KpiManagement />
}

// 키워드 관리 탭 컴포넌트
function KeywordManagement() {
  const { selectedAdvertiser } = useAuth()
  const [selectedMedia, setSelectedMedia] = useState(['네이버', '카카오', '구글', '메타', '틱톡'])
  const [keywordInput, setKeywordInput] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const mediaOptions = ['네이버', '카카오', '구글', '메타', '틱톡']

  const handleMediaChange = (media) => {
    setSelectedMedia(prev => 
      prev.includes(media) 
        ? prev.filter(m => m !== media)
        : [...prev, media]
    )
  }


  const handleSearch = () => {
    // 실제 API 호출 대신 더미 데이터 생성
    const dummyResults = generateDummyKeywordData(selectedMedia, keywordInput)
    setSearchResults(dummyResults)
  }


  // 더미 데이터 생성 함수
  const generateDummyKeywordData = (medias, keyword) => {
    if (!keyword.trim()) return []
    
    const campaigns = ['브랜드 캠페인', '상품 캠페인', '이벤트 캠페인']
    const groups = ['그룹A', '그룹B', '그룹C']
    const keywords = [keyword, `${keyword} 추천`, `${keyword} 후기`, `${keyword} 가격`]
    
    return medias.flatMap((media, mediaIndex) => 
      keywords.map((kw, kwIndex) => {
        // 관리 내역 생성
        const managementHistory = [
          {
            content: '키워드 등록',
            modifiedTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            content: '입찰가 조정',
            modifiedTime: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            content: '키워드 수정',
            modifiedTime: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]
        
        // 관리 내역 중 가장 최근 시간을 찾아서 lastModified로 설정
        const mostRecentTime = managementHistory.reduce((latest, entry) => {
          return new Date(entry.modifiedTime) > new Date(latest) ? entry.modifiedTime : latest
        }, managementHistory[0].modifiedTime)
        
        return {
          id: `${mediaIndex}-${kwIndex}`,
          media,
          campaign: campaigns[Math.floor(Math.random() * campaigns.length)],
          group: groups[Math.floor(Math.random() * groups.length)],
          keyword: kw,
          lastModified: mostRecentTime,
          managementHistory
        }
      })
    )
  }

  // 페이지 로드 시 초기 데이터 표시
  useEffect(() => {
    if (selectedAdvertiser) {
      // 기본 키워드 "광고"로 초기 데이터 생성
      const initialData = generateDummyKeywordData(selectedMedia, '광고')
      setSearchResults(initialData)
    }
  }, [selectedAdvertiser, selectedMedia])

  return (
    <div>
      {/* 필터 영역 */}
      <div className="keyword-filter-section">
        <div className="keyword-filter-row">
          <div className="keyword-filter-group">
            <label className="keyword-filter-label">매체 선택</label>
            <div className="keyword-media-selector">
              <div className="keyword-media-checkboxes">
                {mediaOptions.map(media => (
                  <label key={media} className="keyword-media-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedMedia.includes(media)}
                      onChange={() => handleMediaChange(media)}
                    />
                    <span>{media}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="keyword-filter-group">
            <label className="keyword-filter-label">키워드</label>
            <input
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              className="keyword-input"
              placeholder="키워드를 입력하세요"
            />
          </div>

          <div className="keyword-filter-actions">
            <button 
              type="button" 
              className="keyword-search-btn"
              onClick={handleSearch}
            >
              검색
            </button>
          </div>
        </div>
      </div>

      {/* 결과 영역 */}
      <div className="keyword-results-section">
        <div className="keyword-results-header" style={{ marginBottom: '20px' }}>
          <h3 className="keyword-results-title" style={{ margin: 0 }}>관리 키워드 목록</h3>
        </div>
        <KeywordResultTable keywords={searchResults} />
      </div>

    </div>
  )
}

export default function AdvertiserManagementContent() {
  const { selectedAdvertiser } = useAuth()
  const [activeTab, setActiveTab] = useState('kpi')

  // 광고주가 선택되지 않은 경우
  if (!selectedAdvertiser) {
    return (
      <div className="content-area">
        <div className="empty-state">
          <div className="empty-state-content">
            <div className="empty-state-icon">⚙️</div>
            <h3 className="empty-state-title">광고주를 선택해주세요</h3>
            <p className="empty-state-description">
              상단 네비게이션에서 광고주를 선택하면 광고주 관리 기능을 사용할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="content-area">
      {/* 탭 네비게이션 */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'kpi' ? 'active' : ''}`}
          onClick={() => setActiveTab('kpi')}
        >
          KPI 관리
        </button>
        <button 
          className={`tab-button ${activeTab === 'keyword' ? 'active' : ''}`}
          onClick={() => setActiveTab('keyword')}
        >
          키워드 관리
        </button>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="tab-content">
        {activeTab === 'kpi' && <KpiManagementTab />}
        {activeTab === 'keyword' && <KeywordManagement />}
      </div>
    </div>
  )
}