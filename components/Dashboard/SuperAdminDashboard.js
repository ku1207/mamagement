import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, Building2, TrendingUp, DollarSign, UserCheck, Calendar, RotateCcw } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const SuperAdminDashboard = () => {
  const { users, advertisers } = useAuth();
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalAdvertisers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    monthlyGrowth: 0
  });
  
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endDate: new Date()
  });

  const predefinedRanges = [
    { 
      label: '오늘', 
      value: 'today',
      startDate: new Date(),
      endDate: new Date()
    },
    { 
      label: '어제', 
      value: 'yesterday',
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 24 * 60 * 60 * 1000)
    },
    { 
      label: '지난 7일', 
      value: '7days',
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endDate: new Date()
    },
    { 
      label: '지난 30일', 
      value: '30days',
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date()
    },
    { 
      label: '이번 달', 
      value: 'thisMonth',
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      endDate: new Date()
    },
    { 
      label: '지난 달', 
      value: 'lastMonth',
      startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
      endDate: new Date(new Date().getFullYear(), new Date().getMonth(), 0)
    }
  ];

  const handlePredefinedRangeSelect = (range) => {
    setDateRange({
      startDate: range.startDate,
      endDate: range.endDate
    });
  };

  const handleReset = () => {
    setDateRange({
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endDate: new Date()
    });
  };

  useEffect(() => {
    // 시스템 통계 계산
    const totalUsers = users.length;
    const totalAdvertisers = advertisers.length;
    const activeUsers = users.filter(user => 
      user.role === 'admin' || user.role === 'marketer'
    ).length;
    
    // 모의 데이터 (선택된 기간에 따라 조정)
    const daysDiff = Math.ceil((dateRange.endDate - dateRange.startDate) / (1000 * 60 * 60 * 24));
    const baseRevenue = Math.floor(Math.random() * 100000000) + 50000000;
    const totalRevenue = Math.floor(baseRevenue * (daysDiff / 30)); // 30일 기준으로 조정
    const monthlyGrowth = Math.floor(Math.random() * 20) + 5;

    setSystemStats({
      totalUsers,
      totalAdvertisers,
      activeUsers,
      totalRevenue,
      monthlyGrowth
    });
  }, [users, advertisers, dateRange]);

  const formatCurrency = (amount) => {
    return '₩' + amount.toLocaleString();
  };

  const systemKPIs = [
    {
      title: '전체 사용자',
      value: systemStats.totalUsers,
      icon: <Users size={24} />,
      color: 'blue',
      trend: 12,
      isPositive: true
    },
    {
      title: '등록 광고주',
      value: systemStats.totalAdvertisers,
      icon: <Building2 size={24} />,
      color: 'green',
      trend: 8,
      isPositive: true
    },
    {
      title: '활성 사용자',
      value: systemStats.activeUsers,
      icon: <UserCheck size={24} />,
      color: 'purple',
      trend: 15,
      isPositive: true
    },
    {
      title: '총 매출',
      value: formatCurrency(systemStats.totalRevenue),
      icon: <DollarSign size={24} />,
      color: 'orange',
      trend: systemStats.monthlyGrowth,
      isPositive: true,
      subtitle: `${dateRange.startDate.toLocaleDateString()} ~ ${dateRange.endDate.toLocaleDateString()}`
    },

  ];



  return (
    <div className="dashboard-container">
      {/* 날짜 필터 섹션 */}
      <div className="dashboard-section">
        <div className="filter-section" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '20px', 
          padding: '20px', 
          background: '#f8f9fa', 
          borderRadius: '8px', 
          border: '1px solid #e9ecef',
          marginBottom: '20px'
        }}>
          {/* 날짜 범위 피커 */}
          <div className="filter-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar size={20} />
            <label style={{ fontWeight: '600', color: '#495057' }}>기간:</label>
            <DatePicker
              selected={dateRange.startDate}
              onChange={(date) => setDateRange({ ...dateRange, startDate: date })}
              selectsStart
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              className="filter-input"
              dateFormat="yyyy-MM-dd"
              placeholderText="시작일"
              style={{ 
                padding: '8px 12px',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                fontSize: '0.9rem'
              }}
            />
            <span style={{ color: '#6c757d', fontWeight: '600' }}>~</span>
            <DatePicker
              selected={dateRange.endDate}
              onChange={(date) => setDateRange({ ...dateRange, endDate: date })}
              selectsEnd
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              minDate={dateRange.startDate}
              className="filter-input"
              dateFormat="yyyy-MM-dd"
              placeholderText="종료일"
              style={{ 
                padding: '8px 12px',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                fontSize: '0.9rem'
              }}
            />
          </div>

          {/* 미리 정의된 기간 버튼들 */}
          <div className="predefined-ranges" style={{ display: 'flex', gap: '8px' }}>
            {predefinedRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => handlePredefinedRangeSelect(range)}
                style={{ 
                  padding: '6px 12px',
                  fontSize: '0.8rem',
                  background: '#ffffff',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  color: '#495057'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#667eea';
                  e.target.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = '#ffffff';
                  e.target.style.color = '#495057';
                }}
              >
                {range.label}
              </button>
            ))}
          </div>

          {/* 초기화 버튼 */}
          <button
            onClick={handleReset}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              fontSize: '0.8rem',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#5a6268'}
            onMouseOut={(e) => e.target.style.background = '#6c757d'}
          >
            <RotateCcw size={14} />
            초기화
          </button>
        </div>
      </div>

      {/* 시스템 KPI 카드 */}
      <div className="kpi-grid">
        {systemKPIs.map((kpi, index) => (
          <div key={index} className="kpi-card">
            <div className="kpi-header">
              <div className={`kpi-icon ${kpi.color}`}>
                {kpi.icon}
              </div>
              {kpi.trend > 0 && (
                <div className={`kpi-trend ${kpi.isPositive ? 'positive' : 'negative'}`}>
                  <TrendingUp size={16} />
                  <span>{kpi.trend}%</span>
                </div>
              )}
            </div>
            <div className="kpi-value">
              {kpi.value}
            </div>
            <div className="kpi-label">
              {kpi.title}
              {kpi.subtitle && (
                <div style={{ fontSize: '0.7rem', color: '#6c757d', marginTop: '2px' }}>
                  {kpi.subtitle}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 메인 콘텐츠 그리드 */}
              <div style={{ display: 'block', marginBottom: '20px' }}>
        
        {/* 광고주 업종별 성과 분석 */}
        <div className="dashboard-section">
          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#2c3e50', marginBottom: '20px' }}>
            광고주 업종별 성과 분석 
            <span style={{ fontSize: '0.9rem', color: '#6c757d', fontWeight: '400' }}>
              ({dateRange.startDate.toLocaleDateString()} ~ {dateRange.endDate.toLocaleDateString()})
            </span>
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            {/* 업종별 월 평균 광고비 */}
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#495057', marginBottom: '15px' }}>
                업종별 월 평균 광고비 (단위: 백만원)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {advertisers.map((advertiser, index) => {
                  const avgSpend = Math.floor(Math.random() * 500) + 100;
                  const maxSpend = 600;
                  const percentage = (avgSpend / maxSpend) * 100;
                  const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'];
                  
                  return (
                    <div key={index} style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontWeight: '600', color: '#495057' }}>{advertiser.business}</span>
                        <span style={{ color: '#6c757d', fontWeight: '600' }}>{avgSpend}백만원</span>
                      </div>
                      <div style={{ 
                        width: '100%', 
                        height: '8px', 
                        backgroundColor: '#e9ecef', 
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{ 
                          width: `${percentage}%`, 
                          height: '100%', 
                          backgroundColor: colors[index % colors.length],
                          borderRadius: '4px',
                          transition: 'width 0.3s ease'
                        }}></div>
                </div>
                      <div style={{ fontSize: '0.8rem', color: '#6c757d', marginTop: '4px' }}>
                        {advertiser.name} ({percentage.toFixed(1)}%)
                </div>
                </div>
                  );
                })}
              </div>
            </div>

            {/* 업종별 ROI 성과 */}
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#495057', marginBottom: '15px' }}>
                업종별 ROI 성과 (Return on Investment)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {advertisers.map((advertiser, index) => {
                  const roi = Math.floor(Math.random() * 300) + 150;
                  const isPositive = roi > 200;
                  const roiColor = isPositive ? '#28a745' : roi > 150 ? '#ffc107' : '#dc3545';
                  
                  return (
                    <div key={index} style={{ 
                      padding: '15px', 
                      background: '#f8f9fa', 
                      borderRadius: '8px', 
                      border: '1px solid #e9ecef',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <div style={{ fontWeight: '600', color: '#495057', marginBottom: '4px' }}>
                          {advertiser.business}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                          {advertiser.name}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ 
                          fontSize: '1.2rem', 
                          fontWeight: '700', 
                          color: roiColor,
                          marginBottom: '4px'
                        }}>
                          {roi}%
                        </div>
                        <div style={{ 
                          fontSize: '0.7rem', 
                          color: roiColor,
                          fontWeight: '600'
                        }}>
                          {isPositive ? '우수' : roi > 150 ? '보통' : '개선필요'}
                        </div>
                      </div>
                  </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>


      </div>



      {/* 문의 관리 */}
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
              {[
                { id: 1, type: '계정 문의', content: '로그인이 되지 않습니다', time: '2시간 전', priority: 'high' },
                { id: 2, type: '기술 문의', content: '대시보드 데이터가 로드되지 않습니다', time: '4시간 전', priority: 'medium' },
                { id: 3, type: '일반 문의', content: '새로운 기능 요청', time: '1일 전', priority: 'low' }
              ].map((inquiry, index) => (
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
    </div>
  );
};

export default SuperAdminDashboard; 