import Navigation from './Navigation'
import { useAuth } from '../context/AuthContext'

export default function Layout({ children, currentPage, setCurrentPage }) {
  const { user, selectedAdvertiser } = useAuth()

  return (
    <div className="app-layout">
      <Navigation 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
      />
      <main className="main-content">
        <div className="main-header">
          <div className="page-info">
            <h1 className="page-title">
              {currentPage === 'dashboard' && '대시보드'}
              {currentPage === 'daily-data' && '일자별 데이터'}
              {currentPage === 'keyword-data' && '키워드별 데이터'}
              {currentPage === 'keyword-management' && '광고주 관리'}
              {currentPage === 'naver' && '네이버 광고'}
              {currentPage === 'kakao' && '카카오 광고'}
              {currentPage === 'google' && '구글 광고'}
              {currentPage === 'facebook' && '페이스북 광고'}
              {currentPage === 'tiktok' && '틱톡 광고'}
            </h1>
            {selectedAdvertiser && user?.role !== 'admin' && (
              <div className="selected-advertiser-display">
                <span className="advertiser-label">선택된 광고주:</span>
                <span className="advertiser-name">{selectedAdvertiser.name}</span>
              </div>
            )}
          </div>
        </div>
        <div className="main-body">
          {children}
        </div>
      </main>
    </div>
  )
} 