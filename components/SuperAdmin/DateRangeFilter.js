// 날짜 범위 필터 컴포넌트

import React from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

const DateRangeFilter = ({ dateRange, onDateRangeChange }) => {
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
  ]

  const handlePredefinedRangeSelect = (range) => {
    onDateRangeChange({
      startDate: range.startDate,
      endDate: range.endDate
    })
  }

  const handleReset = () => {
    onDateRangeChange({
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endDate: new Date()
    })
  }

  return (
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
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#495057' }}>기간:</span>
        <DatePicker
          selected={dateRange.startDate}
          onChange={(date) => onDateRangeChange({ ...dateRange, startDate: date })}
          selectsStart
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          dateFormat="yyyy-MM-dd"
          style={{
            padding: '6px 8px',
            fontSize: '0.8rem',
            border: '1px solid #ced4da',
            borderRadius: '4px'
          }}
        />
        <span style={{ color: '#6c757d' }}>~</span>
        <DatePicker
          selected={dateRange.endDate}
          onChange={(date) => onDateRangeChange({ ...dateRange, endDate: date })}
          selectsEnd
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          minDate={dateRange.startDate}
          dateFormat="yyyy-MM-dd"
          style={{
            padding: '6px 8px',
            fontSize: '0.8rem',
            border: '1px solid #ced4da',
            borderRadius: '4px'
          }}
        />
      </div>

      {/* 미리 정의된 범위 버튼들 */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {predefinedRanges.map((range, index) => (
          <button
            key={index}
            onClick={() => handlePredefinedRangeSelect(range)}
            style={{
              padding: '6px 12px',
              fontSize: '0.8rem',
              background: '#ffffff',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              color: '#495057'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#667eea'
              e.target.style.color = 'white'
            }}
            onMouseOut={(e) => {
              e.target.style.background = '#ffffff'
              e.target.style.color = '#495057'
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
        초기화
      </button>
    </div>
  )
}

export default DateRangeFilter