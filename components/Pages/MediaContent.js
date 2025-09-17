// 매체별 콘텐츠 컴포넌트

import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext.js'
import KPICards from '../Dashboard/KPICards.js'
import InteractiveChart from '../Dashboard/InteractiveChart.js'
import DataTable from '../Dashboard/DataTable.js'
import ExportBar from '../Dashboard/ExportBar.js'
import { generateDailyData } from '../../utils/mediaDataGenerator.js'
import { utils } from '../../utils/dashboardUtils.js'

const MediaContent = ({ media }) => {
  const { selectedAdvertiser } = useAuth()
  const [mediaData, setMediaData] = useState([])
  const [dateRange] = useState({
    startDate: utils.getDateOffset(7),
    endDate: utils.getDateOffset(0)
  })

  // 매체별 설정
  const mediaConfig = {
    '구글': {
      icon: '🔍',
      color: '#4285f4',
      description: '구글 광고 성과 데이터를 확인하세요.'
    },
    '페이스북': {
      icon: '👥',
      color: '#1877f2',
      description: '페이스북 광고 성과 데이터를 확인하세요.'
    },
    '틱톡': {
      icon: '🎵',
      color: '#fe2c55',
      description: '틱톡 광고 성과 데이터를 확인하세요.'
    }
  }

  const config = mediaConfig[media] || {
    icon: '📊',
    color: '#6c757d',
    description: `${media} 광고 성과 데이터를 확인하세요.`
  }

  // 광고주가 선택되지 않은 경우
  if (!selectedAdvertiser) {
    return (
      <div className="content-area">
        <div className="empty-state">
          <div className="empty-state-content">
            <div className="empty-state-icon">{config.icon}</div>
            <h3 className="empty-state-title">광고주를 선택해주세요</h3>
            <p className="empty-state-description">
              상단 네비게이션에서 광고주를 선택하면 {media} 데이터를 확인할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // 매체별 데이터 생성
  useEffect(() => {
    const data = generateDailyData([media], dateRange)
    setMediaData(data)
  }, [media, dateRange])

  return (
    <div className="content-area">
      <div className="media-dashboard">
        <KPICards 
          data={mediaData} 
          dateRange={dateRange}
          mediaFocus={media}
        />
        
        <InteractiveChart 
          data={mediaData}
          title={`${media} 성과 트렌드`}
        />
        
        <ExportBar 
          data={mediaData}
          filename={`${media}_performance_data`}
        />
        
        <DataTable 
          data={mediaData}
          title={`${media} 상세 데이터`}
          columns={[
            { key: 'date', label: '날짜', type: 'date' },
            { key: 'impressions', label: '노출수', type: 'number' },
            { key: 'clicks', label: '클릭수', type: 'number' },
            { key: 'conversions', label: '전환수', type: 'number' },
            { key: 'cost', label: '비용', type: 'currency' },
            { key: 'ctr', label: 'CTR', type: 'percentage' },
            { key: 'cpc', label: 'CPC', type: 'currency' },
            { key: 'cpa', label: 'CPA', type: 'currency' },
            { key: 'roas', label: 'ROAS', type: 'number' }
          ]}
          sortable={true}
        />
      </div>
    </div>
  )
}

export default MediaContent