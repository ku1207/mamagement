import { useAuth, ROLES } from '../context/AuthContext'
import { useRouter } from 'next/router'
import { useState } from 'react'

export default function Navigation({ currentPage, setCurrentPage }) {
  const { user, getAccessibleAdvertisers, selectedAdvertiser, setSelectedAdvertiser } = useAuth()
  const router = useRouter()

  // 역할별 메뉴 항목
  const getMenuItems = () => {
    if (user?.role === 'admin') {
      return [
        { id: 'dashboard', label: '대시보드' },
        { id: 'users', label: '유저관리' },
        { id: 'inquiries', label: '문의관리' },
        { id: 'payments', label: '결제관리' }
      ]
    } else {
      return [
        { id: 'dashboard', label: '대시보드' },
        { id: 'daily-data', label: '일자별 데이터' },
        { id: 'keyword-data', label: '키워드별 데이터' },
        { id: 'keyword-management', label: '광고주 관리' }
      ]
    }
  }

  const menuItems = getMenuItems()
  const accessibleAdvertisers = getAccessibleAdvertisers()

  // 유저 ID 클릭 핸들러
  const handleUserIdClick = () => {
    setCurrentPage('profile')
  }

  // 광고주 선택 변경 핸들러
  const handleAdvertiserChange = (e) => {
    const advertiserId = parseInt(e.target.value)
    const advertiser = accessibleAdvertisers.find(adv => adv.id === advertiserId)
    setSelectedAdvertiser(advertiser)
  }


  return (
    <nav className="navigation">
      {/* 서비스 로고 */}
      <div className="nav-logo">
        <h2>광고 관리 시스템</h2>
      </div>

      {/* 유저 접속 정보 영역 */}
      <div className="nav-user-section">
        <div className="user-info-header">
          <div className="user-identity">
            <button 
              className="user-id-button"
              onClick={handleUserIdClick}
              title="개인 정보 및 관리 광고주 페이지로 이동"
            >
              {user?.name}
            </button>

          </div>
        </div>

        {user?.role !== 'admin' && (
          <div className="advertiser-selector">
            <label htmlFor="advertiser-select">광고주 계정</label>
            <select 
              id="advertiser-select"
              value={selectedAdvertiser?.id || ''}
              onChange={handleAdvertiserChange}
              className="advertiser-select"
            >
              <option value="">광고주 선택</option>
              {accessibleAdvertisers.map(advertiser => (
                <option key={advertiser.id} value={advertiser.id}>
                  {advertiser.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 메뉴 항목 */}
      <div className="nav-menu-section">
        <ul className="nav-menu">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => setCurrentPage(item.id)}
              >
                <span className="nav-label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>


    </nav>
  )
} 