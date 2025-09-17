// 문의 관리 컴포넌트

import React from 'react'

const InquiryManagement = ({ dateRange }) => {
  const inquiries = [
    { id: 1, type: '계정 문의', content: '로그인이 되지 않습니다', time: '2시간 전', priority: 'high' },
    { id: 2, type: '기술 문의', content: '대시보드 데이터가 로드되지 않습니다', time: '4시간 전', priority: 'medium' },
    { id: 3, type: '일반 문의', content: '새로운 기능 요청', time: '1일 전', priority: 'low' }
  ]

  return (
    <div className="dashboard-section">
      <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#2c3e50', marginBottom: '20px' }}>
        문의 관리 
        <span style={{ fontSize: '0.9rem', color: '#6c757d', fontWeight: '400' }}>
          ({dateRange.startDate.toLocaleDateString()} ~ {dateRange.endDate.toLocaleDateString()})
        </span>
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* 미처리 문의 */}
        <div style={{ 
          background: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#495057', marginBottom: '15px' }}>
            미처리 문의
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {inquiries.map((inquiry, index) => (
              <div key={index} style={{ 
                padding: '12px', 
                background: 'white', 
                borderRadius: '6px',
                border: '1px solid #e9ecef',
                borderLeft: `4px solid ${inquiry.priority === 'high' ? '#dc3545' : inquiry.priority === 'medium' ? '#ffc107' : '#28a745'}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ 
                    fontSize: '0.8rem', 
                    fontWeight: '600',
                    color: inquiry.priority === 'high' ? '#dc3545' : inquiry.priority === 'medium' ? '#ffc107' : '#28a745'
                  }}>
                    {inquiry.type}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#6c757d' }}>{inquiry.time}</span>
                </div>
                <div style={{ fontSize: '0.9rem', color: '#495057', marginBottom: '8px' }}>
                  {inquiry.content}
                </div>
                <button style={{
                  padding: '4px 8px',
                  fontSize: '0.8rem',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}>
                  답변하기
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 문의 통계 */}
        <div style={{ 
          background: '#f8f9fa', 
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#495057', marginBottom: '15px' }}>
            문의 통계 (이번 달)
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#495057' }}>총 문의 수</span>
              <span style={{ fontWeight: '600', color: '#2c3e50' }}>87건</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#495057' }}>처리 완료</span>
              <span style={{ fontWeight: '600', color: '#28a745' }}>72건</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#495057' }}>처리 중</span>
              <span style={{ fontWeight: '600', color: '#ffc107' }}>12건</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#495057' }}>미처리</span>
              <span style={{ fontWeight: '600', color: '#dc3545' }}>3건</span>
            </div>
            <div style={{ 
              height: '1px', 
              background: '#e9ecef', 
              margin: '10px 0' 
            }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#495057' }}>평균 응답 시간</span>
              <span style={{ fontWeight: '600', color: '#667eea' }}>2.3시간</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#495057' }}>고객 만족도</span>
              <span style={{ fontWeight: '600', color: '#28a745' }}>4.7/5.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InquiryManagement