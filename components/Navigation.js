import { useAuth, ROLES } from '../context/AuthContext'
import { useRouter } from 'next/router'
import { useState } from 'react'

export default function Navigation({ currentPage, setCurrentPage }) {
  const { user, getAccessibleAdvertisers, selectedAdvertiser, setSelectedAdvertiser } = useAuth()
  const router = useRouter()
  const [expandedMenu, setExpandedMenu] = useState('dashboard') // 기본적으로 대시보드 메뉴 열림

  // 역할별 메뉴 항목
  const getMenuItems = () => {
    if (user?.role === 'admin') {
      return [
        { id: 'dashboard', label: '대시보드', icon: '📊' },
        { id: 'users', label: '유저관리', icon: '👥' },
        { id: 'inquiries', label: '문의관리', icon: '📞' },
        { id: 'payments', label: '결제관리', icon: '💳' }
      ]
    } else {
      return [
        { 
          id: 'dashboard', 
          label: '대시보드', 
          icon: '📊',
          submenu: [
            { id: 'daily-data', label: '일자별 데이터', icon: '📅' },
            { id: 'keyword-data', label: '키워드별 데이터', icon: '🔍' }
          ]
        },
        { id: 'naver', label: '네이버 광고', icon: '🟢' },
        { id: 'kakao', label: '카카오 광고', icon: '💛' },
        { id: 'google', label: '구글 광고', icon: '🔍' },
        { id: 'facebook', label: '페이스북 광고', icon: '📘' }
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

  // 메뉴 토글 핸들러
  const handleMenuToggle = (menuId) => {
    setExpandedMenu(expandedMenu === menuId ? null : menuId)
  }

  // 서브메뉴 클릭 핸들러  
  const handleSubmenuClick = (submenuId) => {
    setCurrentPage(submenuId)
  }

  return (
    <nav className="navigation">
      {/* 서비스 로고 */}
      <div className="nav-logo">
        <h2>📢 광고 관리 시스템</h2>
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
              {/* 메인 메뉴 버튼 */}
              <button
                className={`nav-item ${
                  (currentPage === item.id || 
                   (item.submenu && item.submenu.some(sub => sub.id === currentPage))) 
                  ? 'active' : ''
                }`}
                onClick={() => {
                  if (item.submenu) {
                    handleMenuToggle(item.id)
                  } else {
                    setCurrentPage(item.id)
                  }
                }}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {item.submenu && (
                  <span className="nav-arrow" style={{ marginLeft: 'auto' }}>
                    {expandedMenu === item.id ? '▼' : '▶'}
                  </span>
                )}
              </button>
              
              {/* 서브메뉴 */}
              {item.submenu && expandedMenu === item.id && (
                <ul className="nav-submenu" style={{ 
                  paddingLeft: '20px',
                  marginTop: '5px',
                  borderLeft: '2px solid #e9ecef'
                }}>
                  {item.submenu.map((subItem) => (
                    <li key={subItem.id} style={{ marginBottom: '5px' }}>
                      <button
                        className={`nav-item submenu-item ${currentPage === subItem.id ? 'active' : ''}`}
                        onClick={() => handleSubmenuClick(subItem.id)}
                        style={{
                          width: '100%',
                          fontSize: '0.9rem',
                          padding: '8px 12px',
                          background: currentPage === subItem.id ? '#667eea' : 'transparent',
                          color: currentPage === subItem.id ? 'white' : '#6c757d',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <span className="nav-icon">{subItem.icon}</span>
                        <span className="nav-label" style={{ marginLeft: '8px' }}>{subItem.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>


    </nav>
  )
} 