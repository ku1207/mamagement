import { useAuth } from '../context/AuthContext'
import ProtectedRoute from '../components/ProtectedRoute'
import Layout from '../components/Layout'
import { useRouter } from 'next/router'
import { useState } from 'react'

export default function Profile() {
  const { user, getAccessibleAdvertisers, logout, updateUserInfo } = useAuth()
  const router = useRouter()
  const accessibleAdvertisers = getAccessibleAdvertisers()
  const [currentPage, setCurrentPage] = useState('profile')
  const [activeTab, setActiveTab] = useState('personal')
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })

  const handleLogout = () => {
    if (confirm('로그아웃하시겠습니까?')) {
      logout()
      router.push('/login')
    }
  }

  const handleEditToggle = () => {
    if (editMode) {
      // 취소 시 원래 데이터로 복원
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
      })
    }
    setEditMode(!editMode)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (updateUserInfo) {
      updateUserInfo(formData)
      alert('개인정보가 성공적으로 수정되었습니다.')
      setEditMode(false)
    } else {
      alert('개인정보 수정 기능이 구현되지 않았습니다.')
    }
  }

  const renderPersonalInfo = () => (
    <div className="profile-section">
      <div className="profile-section-header">
        <h2>개인 정보</h2>
        <button 
          className={`btn-${editMode ? 'secondary' : 'primary'}`}
          onClick={handleEditToggle}
        >
          {editMode ? '취소' : '수정'}
        </button>
      </div>
      
      {editMode ? (
        <form onSubmit={handleSubmit} className="profile-edit-form">
          <div className="form-group">
            <label>이름</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>이메일</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>연락처</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="010-1234-5678"
            />
          </div>

          <div className="form-group">
            <label>역할</label>
            <input
              type="text"
              value={
                user?.role === 'admin' ? '관리자' :
                user?.role === 'marketer' ? '마케터' : '알 수 없음'
              }
              disabled
              className="disabled-input"
            />
          </div>
          <div className="form-group">
            <label>가입일</label>
            <input
              type="text"
              value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
              disabled
              className="disabled-input"
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary">저장</button>
            <button type="button" className="btn-secondary" onClick={handleEditToggle}>취소</button>
          </div>
        </form>
      ) : (
        <div className="profile-info-card">
          <div className="info-row">
            <span className="info-label">이름</span>
            <span className="info-value">{user?.name}</span>
          </div>
          <div className="info-row">
            <span className="info-label">이메일</span>
            <span className="info-value">{user?.email}</span>
          </div>
          <div className="info-row">
            <span className="info-label">연락처</span>
            <span className="info-value">{user?.phone || '등록되지 않음'}</span>
          </div>

          <div className="info-row">
            <span className="info-label">역할</span>
            <span className="info-value">
              {user?.role === 'admin' && '관리자'}
              {user?.role === 'marketer' && '마케터'}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">가입일</span>
            <span className="info-value">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
            </span>
          </div>
        </div>
      )}
    </div>
  )

  const renderAdvertisersInfo = () => (
    <div className="profile-section">
      <h2>관리 광고주 목록</h2>
      <div className="advertisers-section">
        <p className="section-description">
          현재 접근 가능한 광고주 계정 목록입니다.
        </p>
        
        {accessibleAdvertisers.length > 0 ? (
          <div className="advertisers-grid">
            {accessibleAdvertisers.map(advertiser => (
              <div key={advertiser.id} className="advertiser-profile-card">
                <div className="advertiser-header">
                  <h3>{advertiser.name}</h3>
                  <span className="advertiser-id">#{advertiser.id}</span>
                </div>
                <div className="advertiser-details">
                  <p><strong>업종:</strong> {advertiser.business}</p>
                  <p><strong>등록일:</strong> {new Date(advertiser.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-advertisers">
            <p>접근 가능한 광고주가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  )

  const renderContent = () => {
    // 관리자는 개인정보만 표시
    if (user?.role === 'admin') {
      return (
        <div className="content-area">
          <div className="profile-content">
            <h1>개인 정보 관리</h1>
            {renderPersonalInfo()}
            
            <div className="profile-actions">
              <button 
                className="btn-danger"
                onClick={handleLogout}
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      )
    }

    // 마케터는 탭으로 구분
    return (
      <div className="content-area">
        <div className="profile-content">
          <h1>개인 정보 및 관리 광고주</h1>
          
          <div className="profile-tabs">
            <button 
              className={`tab-button ${activeTab === 'personal' ? 'active' : ''}`}
              onClick={() => setActiveTab('personal')}
            >
              개인 정보
            </button>
            <button 
              className={`tab-button ${activeTab === 'advertisers' ? 'active' : ''}`}
              onClick={() => setActiveTab('advertisers')}
            >
              관리 광고주
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'personal' && renderPersonalInfo()}
            {activeTab === 'advertisers' && renderAdvertisersInfo()}
          </div>

          <div className="profile-actions">
            <button 
              className="btn-danger"
              onClick={handleLogout}
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <Layout currentPage={currentPage} setCurrentPage={setCurrentPage}>
        {renderContent()}
      </Layout>
    </ProtectedRoute>
  )
} 