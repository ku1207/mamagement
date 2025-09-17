import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const FilterSection = ({ 
  dateRange, 
  setDateRange, 
  selectedFilters, 
  setSelectedFilters, 
  onApplyFilters 
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const platforms = [
    { value: 'naver', label: '네이버' },
    { value: 'kakao', label: '카카오' },
    { value: 'google', label: '구글' },
    { value: 'facebook', label: '페이스북' },
    { value: 'tiktok', label: '틱톡' }
  ];

  const adTypes = [
    { value: 'search', label: '검색광고' },
    { value: 'banner', label: '배너광고' },
    { value: 'video', label: '영상광고' },
    { value: 'shopping', label: '쇼핑광고' }
  ];

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

  const handlePlatformChange = (platformValue) => {
    const newPlatforms = selectedFilters.platforms || [];
    const updatedPlatforms = newPlatforms.includes(platformValue)
      ? newPlatforms.filter(p => p !== platformValue)
      : [...newPlatforms, platformValue];
    
    setSelectedFilters({
      ...selectedFilters,
      platforms: updatedPlatforms
    });
  };

  const handleAdTypeChange = (adTypeValue) => {
    const newAdTypes = selectedFilters.adTypes || [];
    const updatedAdTypes = newAdTypes.includes(adTypeValue)
      ? newAdTypes.filter(a => a !== adTypeValue)
      : [...newAdTypes, adTypeValue];
    
    setSelectedFilters({
      ...selectedFilters,
      adTypes: updatedAdTypes
    });
  };

  const handlePredefinedRangeSelect = (range) => {
    setDateRange({
      startDate: range.startDate,
      endDate: range.endDate
    });
  };

  const handleReset = () => {
    setSelectedFilters({
      platforms: [],
      adTypes: []
    });
    setDateRange({
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endDate: new Date()
    });
  };

  return (
    <div className="dashboard-section">
      <div className="filter-section">
        {/* 날짜 범위 피커 */}
        <div className="filter-group">
          <label>기간:</label>
          <div className="filter-group">
            <DatePicker
              selected={dateRange?.startDate}
              onChange={(date) => setDateRange({ ...dateRange, startDate: date })}
              selectsStart
              startDate={dateRange?.startDate}
              endDate={dateRange?.endDate}
              className="filter-input"
              dateFormat="yyyy-MM-dd"
              placeholderText="시작일"
            />
            <span>~</span>
            <DatePicker
              selected={dateRange?.endDate}
              onChange={(date) => setDateRange({ ...dateRange, endDate: date })}
              selectsEnd
              startDate={dateRange?.startDate}
              endDate={dateRange?.endDate}
              minDate={dateRange?.startDate}
              className="filter-input"
              dateFormat="yyyy-MM-dd"
              placeholderText="종료일"
            />
          </div>
        </div>

        {/* 미리 정의된 기간 버튼들 */}
        <div className="filter-group">
          {predefinedRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => handlePredefinedRangeSelect(range)}
              className="filter-input"
              style={{ 
                background: '#f8f9fa', 
                border: '1px solid #e9ecef',
                cursor: 'pointer',
                fontSize: '0.8rem',
                padding: '6px 12px'
              }}
            >
              {range.label}
            </button>
          ))}
        </div>

        {/* 필터 토글 버튼 */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="filter-button"
        >
          필터
        </button>

        {/* 초기화 버튼 */}
        <button
          onClick={handleReset}
          className="filter-reset"
        >
          초기화
        </button>
      </div>

      {/* 확장된 필터 섹션 */}
      {showFilters && (
        <div className="filter-expanded">
          <div className="filter-row">
            {/* 매체 필터 */}
            <div className="filter-category">
              <h4>매체 선택</h4>
              <div className="checkbox-group">
                {platforms.map((platform) => (
                  <label key={platform.value} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={selectedFilters.platforms?.includes(platform.value) || false}
                      onChange={() => handlePlatformChange(platform.value)}
                    />
                    <span>{platform.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 광고 유형 필터 */}
            <div className="filter-category">
              <h4>광고 유형 선택</h4>
              <div className="checkbox-group">
                {adTypes.map((adType) => (
                  <label key={adType.value} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={selectedFilters.adTypes?.includes(adType.value) || false}
                      onChange={() => handleAdTypeChange(adType.value)}
                    />
                    <span>{adType.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div style={{ 
            marginTop: '20px', 
            display: 'flex', 
            justifyContent: 'flex-end',
            position: 'relative'
          }}>
            <button
              onClick={onApplyFilters}
              className="filter-button"
              style={{ 
                background: '#28a745',
                position: 'absolute',
                bottom: '10px',
                right: '10px'
              }}
            >
              검색
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterSection; 