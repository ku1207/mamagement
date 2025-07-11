import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import KPICards from './KPICards';
import FilterSection from './FilterSection';
import InteractiveChart from './InteractiveChart';
import DataTable from './DataTable';
import ExportBar from './ExportBar';

const DashboardContainer = () => {
  const { user, selectedAdvertiser } = useAuth();
  const [dashboardData, setDashboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endDate: new Date()
  });
  const [selectedFilters, setSelectedFilters] = useState({
    platforms: [],
    adTypes: []
  });

  // 가상 데이터 생성
  const generateMockData = () => {
    const platforms = ['naver', 'kakao', 'google', 'facebook', 'tiktok'];
    const adTypes = ['search', 'banner', 'video', 'shopping'];
    const campaigns = [
      '브랜딩 캠페인', '세일 프로모션', '신제품 런칭', '리타겟팅 캠페인',
      '키워드 마케팅', '디스플레이 광고', '동영상 광고', '쇼핑 광고'
    ];
    
    // 틱톡 전용 캠페인 추가
    const tiktokCampaigns = [
      '챌린지 캠페인', '인플루언서 콜라보', '바이럴 마케팅', '트렌드 마케팅'
    ];
    
    const adGroups = [
      '브랜드 키워드', '일반 키워드', '경쟁사 키워드', '상품명 키워드',
      '카테고리 키워드', '지역 키워드', '시즌 키워드', '이벤트 키워드'
    ];
    
    // 틱톡 전용 광고 그룹 추가
    const tiktokAdGroups = [
      '해시태그 그룹', '트렌드 그룹', '댄스 챌린지', '브랜드 챌린지'
    ];

    const data = [];
    const dateCount = 30; // 30일치 데이터

    for (let i = 0; i < dateCount; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];

      platforms.forEach(platform => {
        const currentAdTypes = platform === 'tiktok' 
          ? [...adTypes, 'spark_ads', 'brand_takeover', 'in_feed', 'branded_hashtag']
          : adTypes;
        
        const currentCampaigns = platform === 'tiktok' 
          ? [...campaigns, ...tiktokCampaigns]
          : campaigns;
        
        const currentAdGroups = platform === 'tiktok' 
          ? [...adGroups, ...tiktokAdGroups]
          : adGroups;

        currentAdTypes.forEach(adType => {
          currentCampaigns.forEach(campaign => {
            currentAdGroups.forEach(adGroup => {
              // 랜덤 성과 데이터 생성
              const impressions = Math.floor(Math.random() * 100000) + 1000;
              const clicks = Math.floor(impressions * (Math.random() * 0.1 + 0.01));
              const conversions = Math.floor(clicks * (Math.random() * 0.2 + 0.01));
              const cost = Math.floor((clicks * (Math.random() * 2000 + 100)));
              const revenue = Math.floor(conversions * (Math.random() * 50000 + 10000));

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
                advertiser: selectedAdvertiser || 'A광고주'
              });
            });
          });
        });
      });
    }

    return data;
  };

  useEffect(() => {
    // 실제 환경에서는 API 호출
    const loadDashboardData = async () => {
      setLoading(true);
      
      try {
        // 가상 데이터 생성 (실제로는 API 호출)
        const mockData = generateMockData();
        
        // 광고주 필터링
        const filteredData = mockData.filter(item => 
          !selectedAdvertiser || item.advertiser === selectedAdvertiser
        );
        
        // 날짜 범위 필터링
        const dateFilteredData = filteredData.filter(item => {
          const itemDate = new Date(item.date);
          return itemDate >= dateRange.startDate && itemDate <= dateRange.endDate;
        });
        
        setDashboardData(dateFilteredData);
      } catch (error) {
        console.error('대시보드 데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [selectedAdvertiser, dateRange]);

  const handleApplyFilters = () => {
    // 필터 적용 시 데이터 새로고침
    const filteredData = dashboardData.filter(item => {
      if (selectedFilters.platforms && selectedFilters.platforms.length > 0) {
        if (!selectedFilters.platforms.includes(item.platform)) return false;
      }
      if (selectedFilters.adTypes && selectedFilters.adTypes.length > 0) {
        if (!selectedFilters.adTypes.includes(item.adType)) return false;
      }
      return true;
    });

    setDashboardData(filteredData);
  };

  const handleRowSelect = (rows) => {
    setSelectedRows(rows);
  };

  const handleExport = (type, rows) => {
    // 내보내기 로직 구현
    console.log(`Exporting ${type} for rows:`, rows);
    
    // 실제 구현에서는 여기서 서버로 내보내기 요청을 보내거나
    // 클라이언트 사이드에서 파일 생성
    switch (type) {
      case 'csv':
        // CSV 내보내기
        break;
      case 'excel':
        // Excel 내보내기
        break;
      case 'pdf':
        // PDF 내보내기
        break;
      case 'image':
        // 이미지 내보내기
        break;
      default:
        break;
    }
  };

  const handleClearSelection = () => {
    setSelectedRows([]);
  };

  if (loading) {
    return (
      <div className="loading-dashboard">
        <div className="loading-spinner"></div>
        <span className="loading-text">대시보드 로딩 중...</span>
      </div>
    );
  }

  if (!selectedAdvertiser) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '400px' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📊</div>
          <h3 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '600', 
            color: '#2c3e50', 
            marginBottom: '10px' 
          }}>
            광고주를 선택해주세요
          </h3>
          <p style={{ color: '#6c757d' }}>
            상단 네비게이션에서 광고주를 선택하면 해당 광고주의 데이터를 확인할 수 있습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
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
  );
};

export default DashboardContainer; 