import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import KeywordResultTable from '../components/KeywordManagement/KeywordResultTable.js'
import styles from '../styles/components/KeywordManagement.module.css'

export default function KeywordManagementContent() {
  const { selectedAdvertiser } = useAuth()
  const [selectedMedia, setSelectedMedia] = useState(['네이버', '카카오', '구글', '메타', '틱톡'])
  const [keywordInput, setKeywordInput] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [newKeyword, setNewKeyword] = useState({
    media: '',
    campaign: '',
    group: '',
    keyword: '',
    content: ''
  })
  const [keywordSearch, setKeywordSearch] = useState('')
  const [filteredKeywords, setFilteredKeywords] = useState([])

  const mediaOptions = ['네이버', '카카오', '구글', '메타', '틱톡']
  const campaignOptions = ['브랜드 캠페인', '상품 캠페인', '이벤트 캠페인', '프로모션 캠페인']
  const groupOptions = ['그룹A', '그룹B', '그룹C', '그룹D', '그룹E']
  const keywordOptions = ['광고', '마케팅', '브랜딩', '세일', '할인', '이벤트', '신제품', '리뷰', '프로모션', '특가', '런칭', '신상', '인기', '베스트', '추천', '후기', '체험', '무료', '혜택']

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

  const handleAddKeyword = () => {
    setShowAddModal(true)
  }

  const handleCloseAddModal = () => {
    setShowAddModal(false)
    setNewKeyword({
      media: '',
      campaign: '',
      group: '',
      keyword: '',
      content: ''
    })
    setKeywordSearch('')
    setFilteredKeywords([])
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseAddModal()
    }
  }

  const handleSaveKeyword = () => {
    // 실제 구현에서는 여기서 API 호출하여 키워드 저장
    console.log('새 키워드 저장:', newKeyword)
    handleCloseAddModal()
    // 검색 결과 새로고침
    handleSearch()
  }

  const handleKeywordSearchChange = (value) => {
    setKeywordSearch(value)
    if (value.trim()) {
      const filtered = keywordOptions.filter(keyword => 
        keyword.toLowerCase().includes(value.toLowerCase())
      )
      setFilteredKeywords(filtered)
    } else {
      setFilteredKeywords([])
    }
  }

  const handleKeywordSelect = (keyword) => {
    setNewKeyword({ ...newKeyword, keyword })
    setKeywordSearch(keyword)
    setFilteredKeywords([])
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

  // 광고주가 선택되지 않은 경우
  if (!selectedAdvertiser) {
    return (
      <div className="content-area">
        <div className="empty-state">
          <div className="empty-state-content">
            <div className="empty-state-icon">⚙️</div>
            <h3 className="empty-state-title">광고주를 선택해주세요</h3>
            <p className="empty-state-description">
              상단 네비게이션에서 광고주를 선택하면 키워드 관리 기능을 사용할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="content-area">
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
        <div className="keyword-results-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 className="keyword-results-title" style={{ margin: 0 }}>관리 키워드 목록</h3>
          <button 
            type="button" 
            className="btn btn-primary btn-md"
            onClick={handleAddKeyword}
          >
            관리 키워드 추가
          </button>
        </div>
        <KeywordResultTable keywords={searchResults} />
      </div>

      {/* 키워드 추가 모달 */}
      {showAddModal && (
        <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
          <div className={styles.modalContainer}>
            <div className={styles.modalHeader}>
              <h3>관리 키워드 추가</h3>
              <button 
                type="button" 
                className="btn-close"
                onClick={handleCloseAddModal}
              >
                ×
              </button>
            </div>
            
            <div className={styles.modalContent}>
              <div className="keyword-add-form" style={{ padding: '20px' }}>
                {/* 매체, 캠페인, 그룹을 한 행에 배치 */}
                <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>매체</label>
                    <select
                      value={newKeyword.media}
                      onChange={(e) => setNewKeyword({ ...newKeyword, media: e.target.value })}
                      style={{ 
                        width: '100%', 
                        padding: '8px', 
                        border: '1px solid #ddd', 
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="">선택하세요</option>
                      {mediaOptions.map(media => (
                        <option key={media} value={media}>{media}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>캠페인</label>
                    <select
                      value={newKeyword.campaign}
                      onChange={(e) => setNewKeyword({ ...newKeyword, campaign: e.target.value })}
                      style={{ 
                        width: '100%', 
                        padding: '8px', 
                        border: '1px solid #ddd', 
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="">선택하세요</option>
                      {campaignOptions.map(campaign => (
                        <option key={campaign} value={campaign}>{campaign}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>그룹</label>
                    <select
                      value={newKeyword.group}
                      onChange={(e) => setNewKeyword({ ...newKeyword, group: e.target.value })}
                      style={{ 
                        width: '100%', 
                        padding: '8px', 
                        border: '1px solid #ddd', 
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="">선택하세요</option>
                      {groupOptions.map(group => (
                        <option key={group} value={group}>{group}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 키워드 검색 영역 */}
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>키워드(소재)</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={keywordSearch}
                      onChange={(e) => handleKeywordSearchChange(e.target.value)}
                      placeholder="키워드를 검색하세요"
                      style={{ 
                        width: '100%', 
                        padding: '8px', 
                        border: '1px solid #ddd', 
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                    {filteredKeywords.length > 0 && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        backgroundColor: 'white',
                        border: '1px solid #ddd',
                        borderTop: 'none',
                        borderRadius: '0 0 4px 4px',
                        maxHeight: '150px',
                        overflowY: 'auto',
                        zIndex: 1000
                      }}>
                        {filteredKeywords.map((keyword, index) => (
                          <div
                            key={index}
                            onClick={() => handleKeywordSelect(keyword)}
                            style={{
                              padding: '8px 12px',
                              cursor: 'pointer',
                              borderBottom: index < filteredKeywords.length - 1 ? '1px solid #eee' : 'none',
                              fontSize: '14px'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                          >
                            {keyword}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>내용</label>
                  <textarea
                    value={newKeyword.content}
                    onChange={(e) => setNewKeyword({ ...newKeyword, content: e.target.value })}
                    placeholder="관리 내용을 입력하세요"
                    style={{ 
                      width: '100%', 
                      padding: '8px', 
                      border: '1px solid #ddd', 
                      borderRadius: '4px',
                      fontSize: '14px',
                      minHeight: '80px',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>
            </div>
            
            <div className={styles.modalFooter} style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={handleCloseAddModal}
              >
                취소
              </button>
              <button 
                type="button" 
                className="btn btn-success btn-sm"
                onClick={handleSaveKeyword}
                disabled={!newKeyword.media || !newKeyword.campaign || !newKeyword.group || !newKeyword.keyword}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}