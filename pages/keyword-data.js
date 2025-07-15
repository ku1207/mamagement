import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'

export default function KeywordDataContent() {
  const { selectedAdvertiser } = useAuth()
  
  // 어제 날짜 계산 (로컬 시간 기준)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  // 로컬 시간 기준으로 YYYY-MM-DD 형식 변환
  const formatLocalDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  // 필터 상태 관리
  const [selectedMedias, setSelectedMedias] = useState(['네이버', '카카오', '구글', '메타', '틱톡'])
  const [keywordMetric, setKeywordMetric] = useState('광고비')
  const [sortOrder, setSortOrder] = useState('내림차순')
  const [keywordCount, setKeywordCount] = useState('')
  const [selectedDate, setSelectedDate] = useState(formatLocalDate(yesterday))
  const [costRangeMin, setCostRangeMin] = useState('')
  const [costRangeMax, setCostRangeMax] = useState('')
  
  // 검색 결과 상태 관리
  const [filteredKeywords, setFilteredKeywords] = useState([])
  const [keywordData, setKeywordData] = useState([])
  
  // 키워드 행 선택 및 슬라이드 상태 관리
  const [selectedKeywordIndex, setSelectedKeywordIndex] = useState(null)
  const [expandedKeywordData, setExpandedKeywordData] = useState([])
  
  // 기간별 합산 정보 상태
  const [periodSummary, setPeriodSummary] = useState({
    totalImpressions: 0,
    totalClicks: 0,
    totalCostToday: 0,
    totalCostYesterday: 0,
    totalCost7Days: 0,
    totalCostLastWeek: 0,
    avgCtr: 0,
    avgCpc: 0,
    avgCpa: 0,
    costChangeRate: 0,
    cpcChangeRate: 0,
    conversionChangeRate: 0,
    cpaChangeRate: 0,
    ctrChangeRate: 0
  })
  
  if (!selectedAdvertiser) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '400px' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔍</div>
          <h3 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '600', 
            color: '#2c3e50', 
            marginBottom: '10px' 
          }}>
            광고주를 선택해주세요
          </h3>
          <p style={{ color: '#6c757d' }}>
            상단 네비게이션에서 광고주를 선택하면 키워드별 데이터를 확인할 수 있습니다.
          </p>
        </div>
      </div>
    )
  }

  // 매체 선택 처리
  const handleMediaChange = (media) => {
    setSelectedMedias(prev => {
      if (prev.includes(media)) {
        // 최소 1개는 선택되어야 함
        if (prev.length > 1) {
          return prev.filter(m => m !== media)
        }
        return prev
      } else {
        return [...prev, media]
      }
    })
  }

  // 검색 실행
  const handleSearch = () => {
    const results = getFilteredKeywords()
    setFilteredKeywords(results)
    
    // 기간별 요약 정보 계산
    const summary = calculatePeriodSummary(results)
    setPeriodSummary(summary)
  }

  // 키워드 행 클릭 처리
  const handleKeywordRowClick = (index, keyword) => {
    if (selectedKeywordIndex === index) {
      setSelectedKeywordIndex(null)
      setExpandedKeywordData([])
    } else {
      setSelectedKeywordIndex(index)
      
      // 해당 키워드의 매체별 데이터 생성
      const mediaData = ['네이버', '카카오', '구글', '메타', '틱톡'].map(media => ({
        media,
        keyword,
        campaign: `${media} ${keyword} 캠페인`,
        adGroup: `${media} ${keyword} 광고그룹`,
        impressions: Math.floor(Math.random() * 10000) + 1000,
        clicks: Math.floor(Math.random() * 500) + 50,
        ctr: parseFloat(((Math.random() * 5) + 1).toFixed(1)),
        cpc_today: Math.floor(Math.random() * 1000) + 100,
        cpc_yesterday: Math.floor(Math.random() * 1000) + 100,
        cpc_7days: Math.floor(Math.random() * 1000) + 100,
        cpc_last_week: Math.floor(Math.random() * 1000) + 100,
        cost_today: Math.floor(Math.random() * 100000) + 10000,
        cost_yesterday: Math.floor(Math.random() * 100000) + 10000,
        cost_7days: Math.floor(Math.random() * 700000) + 70000,
        cost_last_week: Math.floor(Math.random() * 700000) + 70000
      }))
      
      setExpandedKeywordData(mediaData)
    }
  }

  // 외부 클릭 처리
  const handleOutsideClick = () => {
    setSelectedKeywordIndex(null)
    setExpandedKeywordData([])
  }

  // 키워드 고정 더미 데이터 생성
  const generateKeywordData = () => {
    const fixedKeywordData = [
      { keyword: '브랜드명', media: '네이버', campaign: '네이버 브랜드 캠페인', adGroup: '네이버 브랜드 키워드', impressions: 15000, clicks: 750, ctr: 5.0, cpc_today: 320, cpc_yesterday: 315, cpc_7days: 318, cpc_last_week: 322, cost_today: 80000, cost_yesterday: 78000, cost_7days: 320000, cost_last_week: 325000 },
      { keyword: '브랜드명', media: '구글', campaign: '구글 브랜드 캠페인', adGroup: '구글 브랜드 키워드', impressions: 12000, clicks: 600, ctr: 5.0, cpc_today: 350, cpc_yesterday: 345, cpc_7days: 348, cpc_last_week: 352, cost_today: 70000, cost_yesterday: 69000, cost_7days: 280000, cost_last_week: 285000 },
      { keyword: '브랜드명', media: '카카오', campaign: '카카오 브랜드 캠페인', adGroup: '카카오 브랜드 키워드', impressions: 10000, clicks: 500, ctr: 5.0, cpc_today: 380, cpc_yesterday: 375, cpc_7days: 378, cpc_last_week: 382, cost_today: 60000, cost_yesterday: 58000, cost_7days: 240000, cost_last_week: 245000 },
      { keyword: '브랜드명', media: '메타', campaign: '메타 브랜드 캠페인', adGroup: '메타 브랜드 키워드', impressions: 8000, clicks: 400, ctr: 5.0, cpc_today: 400, cpc_yesterday: 395, cpc_7days: 398, cpc_last_week: 402, cost_today: 50000, cost_yesterday: 48000, cost_7days: 200000, cost_last_week: 205000 },
      { keyword: '브랜드명', media: '틱톡', campaign: '틱톡 브랜드 캠페인', adGroup: '틱톡 브랜드 키워드', impressions: 50000, clicks: 2500, ctr: 5.0, cpc_today: 180, cpc_yesterday: 175, cpc_7days: 178, cpc_last_week: 182, cost_today: 150000, cost_yesterday: 148000, cost_7days: 600000, cost_last_week: 605000 },
      
      { keyword: '제품명', media: '네이버', campaign: '네이버 제품 캠페인', adGroup: '네이버 제품 키워드', impressions: 18000, clicks: 900, ctr: 5.0, cpc_today: 280, cpc_yesterday: 275, cpc_7days: 278, cpc_last_week: 282, cost_today: 95000, cost_yesterday: 92000, cost_7days: 380000, cost_last_week: 385000 },
      { keyword: '제품명', media: '카카오', campaign: '카카오 제품 캠페인', adGroup: '카카오 제품 키워드', impressions: 14000, clicks: 700, ctr: 5.0, cpc_today: 300, cpc_yesterday: 295, cpc_7days: 298, cpc_last_week: 302, cost_today: 75000, cost_yesterday: 73000, cost_7days: 300000, cost_last_week: 305000 },
      { keyword: '제품명', media: '구글', campaign: '구글 제품 캠페인', adGroup: '구글 제품 키워드', impressions: 11000, clicks: 550, ctr: 5.0, cpc_today: 320, cpc_yesterday: 315, cpc_7days: 318, cpc_last_week: 322, cost_today: 68000, cost_yesterday: 66000, cost_7days: 270000, cost_last_week: 275000 },
      { keyword: '제품명', media: '메타', campaign: '메타 제품 캠페인', adGroup: '메타 제품 키워드', impressions: 9000, clicks: 450, ctr: 5.0, cpc_today: 350, cpc_yesterday: 345, cpc_7days: 348, cpc_last_week: 352, cost_today: 55000, cost_yesterday: 53000, cost_7days: 220000, cost_last_week: 225000 },
      { keyword: '제품명', media: '틱톡', campaign: '틱톡 제품 캠페인', adGroup: '틱톡 제품 키워드', impressions: 45000, clicks: 2250, ctr: 5.0, cpc_today: 200, cpc_yesterday: 195, cpc_7days: 198, cpc_last_week: 202, cost_today: 140000, cost_yesterday: 138000, cost_7days: 560000, cost_last_week: 565000 },
      
      { keyword: '카테고리', media: '구글', campaign: '구글 카테고리 캠페인', adGroup: '구글 핵심 키워드', impressions: 20000, clicks: 1000, ctr: 5.0, cpc_today: 250, cpc_yesterday: 245, cpc_7days: 248, cpc_last_week: 252, cost_today: 100000, cost_yesterday: 98000, cost_7days: 400000, cost_last_week: 405000 },
      { keyword: '카테고리', media: '메타', campaign: '메타 카테고리 캠페인', adGroup: '메타 핵심 키워드', impressions: 16000, clicks: 800, ctr: 5.0, cpc_today: 275, cpc_yesterday: 270, cpc_7days: 273, cpc_last_week: 277, cost_today: 85000, cost_yesterday: 83000, cost_7days: 340000, cost_last_week: 345000 },
      { keyword: '카테고리', media: '네이버', campaign: '네이버 카테고리 캠페인', adGroup: '네이버 핵심 키워드', impressions: 13000, clicks: 650, ctr: 5.0, cpc_today: 290, cpc_yesterday: 285, cpc_7days: 288, cpc_last_week: 292, cost_today: 72000, cost_yesterday: 70000, cost_7days: 290000, cost_last_week: 295000 },
      { keyword: '카테고리', media: '카카오', campaign: '카카오 카테고리 캠페인', adGroup: '카카오 핵심 키워드', impressions: 11000, clicks: 550, ctr: 5.0, cpc_today: 310, cpc_yesterday: 305, cpc_7days: 308, cpc_last_week: 312, cost_today: 64000, cost_yesterday: 62000, cost_7days: 250000, cost_last_week: 255000 },
      { keyword: '카테고리', media: '틱톡', campaign: '틱톡 카테고리 캠페인', adGroup: '틱톡 카테고리 키워드', impressions: 40000, clicks: 2000, ctr: 5.0, cpc_today: 170, cpc_yesterday: 165, cpc_7days: 168, cpc_last_week: 172, cost_today: 130000, cost_yesterday: 128000, cost_7days: 520000, cost_last_week: 525000 },
      
      { keyword: '경쟁사', media: '네이버', campaign: '네이버 브랜드 캠페인', adGroup: '네이버 브랜드 키워드', impressions: 10000, clicks: 500, ctr: 5.0, cpc_today: 400, cpc_yesterday: 395, cpc_7days: 398, cpc_last_week: 402, cost_today: 65000, cost_yesterday: 63000, cost_7days: 260000, cost_last_week: 265000 },
      { keyword: '경쟁사', media: '구글', campaign: '구글 브랜드 캠페인', adGroup: '구글 브랜드 키워드', impressions: 8000, clicks: 400, ctr: 5.0, cpc_today: 420, cpc_yesterday: 415, cpc_7days: 418, cpc_last_week: 422, cost_today: 58000, cost_yesterday: 56000, cost_7days: 230000, cost_last_week: 235000 },
      
      { keyword: '일반키워드', media: '구글', campaign: '구글 제품 캠페인', adGroup: '구글 제품 키워드', impressions: 22000, clicks: 1100, ctr: 5.0, cpc_today: 230, cpc_yesterday: 225, cpc_7days: 228, cpc_last_week: 232, cost_today: 110000, cost_yesterday: 108000, cost_7days: 440000, cost_last_week: 445000 },
      { keyword: '일반키워드', media: '카카오', campaign: '카카오 제품 캠페인', adGroup: '카카오 제품 키워드', impressions: 13000, clicks: 650, ctr: 5.0, cpc_today: 260, cpc_yesterday: 255, cpc_7days: 258, cpc_last_week: 262, cost_today: 72000, cost_yesterday: 70000, cost_7days: 290000, cost_last_week: 295000 },
      
      { keyword: '롱테일키워드', media: '네이버', campaign: '네이버 제품 캠페인', adGroup: '네이버 제품 키워드', impressions: 8000, clicks: 400, ctr: 5.0, cpc_today: 350, cpc_yesterday: 345, cpc_7days: 348, cpc_last_week: 352, cost_today: 55000, cost_yesterday: 53000, cost_7days: 220000, cost_last_week: 225000 },
      
      { keyword: '상품후기', media: '메타', campaign: '메타 브랜드 캠페인', adGroup: '메타 브랜드 키워드', impressions: 12000, clicks: 600, ctr: 5.0, cpc_today: 300, cpc_yesterday: 295, cpc_7days: 298, cpc_last_week: 302, cost_today: 68000, cost_yesterday: 66000, cost_7days: 270000, cost_last_week: 275000 },
      
      { keyword: '가격비교', media: '구글', campaign: '구글 제품 캠페인', adGroup: '구글 제품 키워드', impressions: 17000, clicks: 850, ctr: 5.0, cpc_today: 290, cpc_yesterday: 285, cpc_7days: 288, cpc_last_week: 292, cost_today: 88000, cost_yesterday: 86000, cost_7days: 350000, cost_last_week: 355000 },
      { keyword: '가격비교', media: '네이버', campaign: '네이버 제품 캠페인', adGroup: '네이버 제품 키워드', impressions: 11000, clicks: 550, ctr: 5.0, cpc_today: 320, cpc_yesterday: 315, cpc_7days: 318, cpc_last_week: 322, cost_today: 64000, cost_yesterday: 62000, cost_7days: 250000, cost_last_week: 255000 },
      
      { keyword: '이벤트', media: '카카오', campaign: '카카오 카테고리 캠페인', adGroup: '카카오 핵심 키워드', impressions: 25000, clicks: 1250, ctr: 5.0, cpc_today: 200, cpc_yesterday: 195, cpc_7days: 198, cpc_last_week: 202, cost_today: 120000, cost_yesterday: 118000, cost_7days: 480000, cost_last_week: 485000 },
      
      { keyword: '할인', media: '메타', campaign: '메타 제품 캠페인', adGroup: '메타 제품 키워드', impressions: 19000, clicks: 950, ctr: 5.0, cpc_today: 260, cpc_yesterday: 255, cpc_7days: 258, cpc_last_week: 262, cost_today: 95000, cost_yesterday: 93000, cost_7days: 380000, cost_last_week: 385000 },
      
      // 틱톡 전용 키워드 데이터 추가
      { keyword: '챌린지', media: '틱톡', campaign: '틱톡 바이럴 챌린지', adGroup: '틱톡 해시태그 키워드', impressions: 80000, clicks: 4000, ctr: 5.0, cpc_today: 150, cpc_yesterday: 145, cpc_7days: 148, cpc_last_week: 152, cost_today: 200000, cost_yesterday: 198000, cost_7days: 800000, cost_last_week: 805000 },
      { keyword: '댄스', media: '틱톡', campaign: '틱톡 댄스 챌린지', adGroup: '틱톡 댄스 키워드', impressions: 75000, clicks: 3750, ctr: 5.0, cpc_today: 160, cpc_yesterday: 155, cpc_7days: 158, cpc_last_week: 162, cost_today: 180000, cost_yesterday: 178000, cost_7days: 720000, cost_last_week: 725000 },
      { keyword: '트렌드', media: '틱톡', campaign: '틱톡 트렌드 마케팅', adGroup: '틱톡 트렌드 키워드', impressions: 60000, clicks: 3000, ctr: 5.0, cpc_today: 190, cpc_yesterday: 185, cpc_7days: 188, cpc_last_week: 192, cost_today: 170000, cost_yesterday: 168000, cost_7days: 680000, cost_last_week: 685000 },
      { keyword: '바이럴', media: '틱톡', campaign: '틱톡 바이럴 마케팅', adGroup: '틱톡 바이럴 키워드', impressions: 65000, clicks: 3250, ctr: 5.0, cpc_today: 175, cpc_yesterday: 170, cpc_7days: 173, cpc_last_week: 177, cost_today: 160000, cost_yesterday: 158000, cost_7days: 640000, cost_last_week: 645000 },
      { keyword: '인플루언서', media: '틱톡', campaign: '틱톡 인플루언서 콜라보', adGroup: '틱톡 인플루언서 키워드', impressions: 55000, clicks: 2750, ctr: 5.0, cpc_today: 210, cpc_yesterday: 205, cpc_7days: 208, cpc_last_week: 212, cost_today: 190000, cost_yesterday: 188000, cost_7days: 760000, cost_last_week: 765000 }
    ]
    
    return fixedKeywordData
  }

  // 키워드 데이터 필터링 및 정렬
  const getFilteredKeywords = () => {
    let filtered = [...keywordData]
    
    // 선택된 매체로 필터링
    filtered = filtered.filter(item => selectedMedias.includes(item.media))
    
    // 키워드별로 그룹화하고 광고비 합계 계산
    const groupedByKeyword = {}
    filtered.forEach(item => {
      if (!groupedByKeyword[item.keyword]) {
        groupedByKeyword[item.keyword] = {
          keyword: item.keyword,
          media: item.media,
          campaign: item.campaign,
          adGroup: item.adGroup,
          impressions: item.impressions,
          clicks: item.clicks,
          ctr: item.ctr,
          cpc_today: item.cpc_today,
          cpc_yesterday: item.cpc_yesterday,
          cpc_7days: item.cpc_7days,
          cpc_last_week: item.cpc_last_week,
          cost_today: item.cost_today,
          cost_yesterday: item.cost_yesterday,
          cost_7days: item.cost_7days,
          cost_last_week: item.cost_last_week
        }
      } else {
        // 키워드가 이미 존재하면 광고비 합계 계산
        groupedByKeyword[item.keyword].impressions += item.impressions
        groupedByKeyword[item.keyword].clicks += item.clicks
        groupedByKeyword[item.keyword].cost_today += item.cost_today
        groupedByKeyword[item.keyword].cost_yesterday += item.cost_yesterday
        groupedByKeyword[item.keyword].cost_7days += item.cost_7days
        groupedByKeyword[item.keyword].cost_last_week += item.cost_last_week
      }
    })
    
    // 그룹화된 데이터를 배열로 변환
    let result = Object.values(groupedByKeyword)
    
    // CPC 선택 시 광고비 범위 필터링
    if (keywordMetric === 'CPC') {
      if (costRangeMin && !isNaN(costRangeMin)) {
        result = result.filter(item => item.cost_today >= parseInt(costRangeMin))
      }
      if (costRangeMax && !isNaN(costRangeMax)) {
        result = result.filter(item => item.cost_today <= parseInt(costRangeMax))
      }
    }
    
    // 정렬 기준에 따라 정렬
    if (keywordMetric === '광고비') {
      result.sort((a, b) => {
        const aValue = a.cost_today + a.cost_yesterday + a.cost_7days + a.cost_last_week
        const bValue = b.cost_today + b.cost_yesterday + b.cost_7days + b.cost_last_week
        return sortOrder === '내림차순' ? bValue - aValue : aValue - bValue
      })
    } else if (keywordMetric === '클릭수') {
      result.sort((a, b) => {
        return sortOrder === '내림차순' ? b.clicks - a.clicks : a.clicks - b.clicks
      })
    } else if (keywordMetric === 'CPC') {
      result.sort((a, b) => {
        return sortOrder === '내림차순' ? b.cpc_today - a.cpc_today : a.cpc_today - b.cpc_today
      })
    }
    
    // 키워드 개수 제한 적용
    if (keywordCount && parseInt(keywordCount) > 0) {
      result = result.slice(0, parseInt(keywordCount))
    }
    
    return result
  }

  // 컴포넌트 마운트 시 데이터 생성
  useEffect(() => {
    // 기본 데이터 생성 (페이지 진입 시 바로 표시)
    const data = generateKeywordData()
    setKeywordData(data)
    
    // 기본 검색 실행하여 초기 데이터 표시
    const results = data.filter(item => selectedMedias.includes(item.media))
    setFilteredKeywords(results)
    
    // 기간별 요약 정보 계산
    const summary = calculatePeriodSummary(results)
    setPeriodSummary(summary)
  }, [])

  // 기간별 합산 정보 계산
  const calculatePeriodSummary = (data) => {
    if (!data || data.length === 0) {
      return {
        totalImpressions: 0,
        totalClicks: 0,
        totalCostToday: 0,
        totalCostYesterday: 0,
        totalCost7Days: 0,
        totalCostLastWeek: 0,
        avgCtr: 0,
        avgCpc: 0,
        avgCpa: 0,
        costChangeRate: 0,
        cpcChangeRate: 0,
        conversionChangeRate: 0,
        cpaChangeRate: 0,
        ctrChangeRate: 0
      }
    }
    
    const totalImpressions = data.reduce((sum, item) => sum + item.impressions, 0)
    const totalClicks = data.reduce((sum, item) => sum + item.clicks, 0)
    const totalCostToday = data.reduce((sum, item) => sum + item.cost_today, 0)
    const totalCostYesterday = data.reduce((sum, item) => sum + item.cost_yesterday, 0)
    const totalCost7Days = data.reduce((sum, item) => sum + item.cost_7days, 0)
    const totalCostLastWeek = data.reduce((sum, item) => sum + item.cost_last_week, 0)
    
    const totalConversions = Math.floor(totalClicks * 0.12) // 전환수는 클릭수의 12%로 가정
    const totalConversionsYesterday = Math.floor(totalClicks * 0.10) // 어제는 10%로 가정
    
    // 평균 CTR 계산 (전체 클릭수 / 전체 노출수)
    const avgCtr = totalImpressions > 0 ? parseFloat(((totalClicks / totalImpressions) * 100).toFixed(1)) : 0
    const avgCtrYesterday = totalImpressions > 0 ? parseFloat(((totalClicks * 0.96 / totalImpressions) * 100).toFixed(1)) : 0
    
    // 평균 CPC 계산 (전체 광고비 / 전체 클릭수)
    const avgCpc = totalClicks > 0 ? Math.round(totalCostToday / totalClicks) : 0
    const avgCpcYesterday = totalClicks > 0 ? Math.round(totalCostYesterday / totalClicks) : 0
    
    // 평균 CPA 계산 (전체 광고비 / 전체 전환수)
    const avgCpa = totalConversions > 0 ? Math.round(totalCostToday / totalConversions) : 0
    const avgCpaYesterday = totalConversionsYesterday > 0 ? Math.round(totalCostYesterday / totalConversionsYesterday) : 0
    
    // 실제 등락률 계산
    const costChangeRate = totalCostYesterday > 0 ? ((totalCostToday - totalCostYesterday) / totalCostYesterday * 100) : 0
    const cpcChangeRate = avgCpcYesterday > 0 ? ((avgCpc - avgCpcYesterday) / avgCpcYesterday * 100) : 0
    const conversionChangeRate = totalConversionsYesterday > 0 ? ((totalConversions - totalConversionsYesterday) / totalConversionsYesterday * 100) : 0
    const cpaChangeRate = avgCpaYesterday > 0 ? ((avgCpa - avgCpaYesterday) / avgCpaYesterday * 100) : 0
    const ctrChangeRate = avgCtrYesterday > 0 ? ((avgCtr - avgCtrYesterday) / avgCtrYesterday * 100) : 0
    
    return {
      totalImpressions,
      totalClicks,
      totalCostToday,
      totalCostYesterday,
      totalCost7Days,
      totalCostLastWeek,
      totalConversions,
      totalConversionsYesterday,
      avgCtr,
      avgCtrYesterday,
      avgCpc,
      avgCpcYesterday,
      avgCpa,
      avgCpaYesterday,
      costChangeRate,
      cpcChangeRate,
      conversionChangeRate,
      cpaChangeRate,
      ctrChangeRate
    }
  }

  return (
    <div className="content-area">
      {/* 필터 영역 */}
      <div style={{ 
        background: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px',
        border: '1px solid #e9ecef',
        marginTop: '20px',
        marginBottom: '20px'
      }}>
        <div style={{ 
          display: 'flex', 
          gap: '15px',
          alignItems: 'flex-start'
        }}>
          {/* 매체 선택 */}
          <div style={{ flex: '1' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#495057'
            }}>매체 선택</label>
            <div style={{ 
              display: 'flex', 
              gap: '15px',
              flexWrap: 'wrap' 
            }}>
              {['네이버', '카카오', '구글', '메타', '틱톡'].map(media => (
                <label key={media} style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  color: '#495057'
                }}>
                  <input
                    type="checkbox"
                    checked={selectedMedias.includes(media)}
                    onChange={() => handleMediaChange(media)}
                    style={{ marginRight: '6px' }}
                  />
                  {media}
                </label>
              ))}
            </div>
          </div>

          {/* 조회 날짜 */}
          <div style={{ minWidth: '160px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#495057'
            }}>조회 날짜</label>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center'
            }}>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{
                  padding: '6px 8px',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                  width: '140px'
                }}
              />
            </div>
          </div>
          
          {/* 키워드 필터링 */}
          <div style={{ flex: '2' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#495057'
            }}>키워드 필터링</label>
            <div style={{ 
              display: 'flex', 
              gap: '15px',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{
                display: 'flex',
                gap: '15px',
                alignItems: 'center'
              }}>
                {/* 지표 선택 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '0.9rem', color: '#6c757d', minWidth: '30px' }}>지표</label>
                  <select 
                    value={keywordMetric} 
                    onChange={(e) => setKeywordMetric(e.target.value)}
                    style={{
                      padding: '6px 8px',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      width: '100px',
                      height: '34px'
                    }}
                  >
                    <option value="클릭수">클릭수</option>
                    <option value="CPC">CPC</option>
                    <option value="광고비">광고비</option>
                  </select>
                </div>
                
                {/* 정렬 선택 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '0.9rem', color: '#6c757d', minWidth: '30px' }}>정렬</label>
                  <select 
                    value={sortOrder} 
                    onChange={(e) => setSortOrder(e.target.value)}
                    style={{
                      padding: '6px 8px',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      width: '100px',
                      height: '34px'
                    }}
                  >
                    <option value="내림차순">내림차순</option>
                    <option value="오름차순">오름차순</option>
                  </select>
                </div>
                
                {/* 개수 입력 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '0.9rem', color: '#6c757d', minWidth: '30px' }}>개수</label>
                  <input
                    type="number"
                    value={keywordCount}
                    onChange={(e) => setKeywordCount(e.target.value)}
                    placeholder="전체"
                    min="1"
                    style={{
                      padding: '6px 8px',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      width: '100px',
                      height: '34px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* 검색 버튼 */}
              <button
                onClick={handleSearch}
                style={{
                  padding: '6px 16px',
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  transition: 'background 0.2s',
                  height: '34px'
                }}
                onMouseOver={(e) => e.target.style.background = '#218838'}
                onMouseOut={(e) => e.target.style.background = '#28a745'}
              >
                검색
              </button>
            </div>

            {/* CPC 선택 시 광고비 범위 입력 */}
            {keywordMetric === 'CPC' && (
              <div style={{ 
                display: 'flex', 
                gap: '15px',
                alignItems: 'center',
                marginTop: '10px'
              }}>
                <label style={{ fontSize: '0.9rem', color: '#6c757d' }}>광고비 범위</label>
                <input
                  type="number"
                  value={costRangeMin}
                  onChange={(e) => setCostRangeMin(e.target.value)}
                  placeholder="최소"
                  min="0"
                  style={{
                    padding: '6px 8px',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    fontSize: '0.9rem',
                    width: '100px'
                  }}
                />
                <span style={{ fontSize: '0.9rem', color: '#6c757d' }}>이상</span>
                <input
                  type="number"
                  value={costRangeMax}
                  onChange={(e) => setCostRangeMax(e.target.value)}
                  placeholder="최대"
                  min="0"
                  style={{
                    padding: '6px 8px',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    fontSize: '0.9rem',
                    width: '100px'
                  }}
                />
                <span style={{ fontSize: '0.9rem', color: '#6c757d' }}>이하</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        {/* 기간별 합산 정보 */}
        <div style={{ 
          background: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid #e9ecef',
          marginBottom: '30px'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '20px'
          }}>
            <h3 style={{ 
              margin: 0, 
              color: '#495057'
            }}>기간별 합산 데이터</h3>
            
            {/* 검색 조건 표시 */}
            <div style={{ 
              background: '#fff3cd', 
              padding: '8px 12px', 
              borderRadius: '4px',
              border: '1px solid #ffeaa7',
              fontSize: '0.85rem',
              color: '#856404'
            }}>
              <strong>검색 조건:</strong> 
              <span style={{ marginLeft: '8px' }}>
                {selectedDate} | {selectedMedias.join(', ')} | {keywordMetric} ({sortOrder})
                {keywordCount && ` | ${keywordCount}개`}
              </span>
            </div>
          </div>
          
          {/* 열/행이 바뀐 테이블 */}
          <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', border: '1px solid #dee2e6' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#e9ecef' }}>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>기간</th>
                  <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>노출수</th>
                  <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>클릭수</th>
                  <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>CTR</th>
                  <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>광고비</th>
                  <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>CPC</th>
                  <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>전환수</th>
                  <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>전환율</th>
                  <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>CPA</th>
                  <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>ROAS</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>당일</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{(periodSummary.totalImpressions || 0).toLocaleString()}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{(periodSummary.totalClicks || 0).toLocaleString()}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{(periodSummary.avgCtr || 0).toFixed(2)}%</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{(periodSummary.totalCostToday || 0).toLocaleString()}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{(periodSummary.avgCpc || 0).toLocaleString()}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{(periodSummary.totalConversions || 0).toLocaleString()}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{(periodSummary.conversionRate || 0).toFixed(2)}%</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{(periodSummary.avgCpa || 0).toLocaleString()}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{(periodSummary.roas || 0).toFixed(2)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>전일</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalImpressions || 0) * 0.92).toLocaleString()}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalClicks || 0) * 0.88).toLocaleString()}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{((periodSummary.avgCtr || 0) * 0.95).toFixed(2)}%</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{(periodSummary.totalCostYesterday || 0).toLocaleString()}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{(periodSummary.avgCpcYesterday || 0).toLocaleString()}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{(periodSummary.totalConversionsYesterday || 0).toLocaleString()}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{((periodSummary.conversionRate || 0) * 0.93).toFixed(2)}%</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{(periodSummary.avgCpaYesterday || 0).toLocaleString()}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{((periodSummary.roas || 0) * 0.89).toFixed(2)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>최근 7일</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalImpressions || 0) * 6.8).toLocaleString()}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalClicks || 0) * 6.2).toLocaleString()}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{((periodSummary.avgCtr || 0) * 0.91).toFixed(2)}%</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{(periodSummary.totalCost7Days || 0).toLocaleString()}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.avgCpc || 0) * 1.03).toLocaleString()}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalClicks || 0) * 0.86).toLocaleString()}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{((periodSummary.conversionRate || 0) * 0.87).toFixed(2)}%</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalCost7Days || 0) / Math.max(Math.floor((periodSummary.totalClicks || 0) * 0.86), 1)).toLocaleString()}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{((periodSummary.roas || 0) * 0.94).toFixed(2)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>이전 7일</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalImpressions || 0) * 6.1).toLocaleString()}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalClicks || 0) * 5.8).toLocaleString()}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{((periodSummary.avgCtr || 0) * 0.95).toFixed(2)}%</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{(periodSummary.totalCostLastWeek || 0).toLocaleString()}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.avgCpc || 0) * 1.12).toLocaleString()}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalClicks || 0) * 0.75).toLocaleString()}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{((periodSummary.conversionRate || 0) * 0.82).toFixed(2)}%</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalCostLastWeek || 0) / Math.max(Math.floor((periodSummary.totalClicks || 0) * 0.75), 1)).toLocaleString()}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{((periodSummary.roas || 0) * 0.87).toFixed(2)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>당월</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalImpressions || 0) * 24.3).toLocaleString()}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalClicks || 0) * 22.1).toLocaleString()}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{((periodSummary.avgCtr || 0) * 0.91).toFixed(2)}%</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalCostToday || 0) * 28.5).toLocaleString()}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.avgCpc || 0) * 0.97).toLocaleString()}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalClicks || 0) * 3.4).toLocaleString()}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{((periodSummary.conversionRate || 0) * 0.89).toFixed(2)}%</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalCostToday || 0) * 28.5 / Math.max(Math.floor((periodSummary.totalClicks || 0) * 3.4), 1)).toLocaleString()}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{((periodSummary.roas || 0) * 0.96).toFixed(2)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid #dee2e6', fontWeight: '600' }}>전월</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalImpressions || 0) * 26.8).toLocaleString()}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalClicks || 0) * 24.7).toLocaleString()}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{((periodSummary.avgCtr || 0) * 0.92).toFixed(2)}%</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalCostToday || 0) * 31.2).toLocaleString()}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.avgCpc || 0) * 1.05).toLocaleString()}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalClicks || 0) * 3.8).toLocaleString()}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{((periodSummary.conversionRate || 0) * 0.94).toFixed(2)}%</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{Math.floor((periodSummary.totalCostToday || 0) * 31.2 / Math.max(Math.floor((periodSummary.totalClicks || 0) * 3.8), 1)).toLocaleString()}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>{((periodSummary.roas || 0) * 0.91).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 키워드(소재) 상세 데이터 */}
        <div style={{ 
          background: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid #e9ecef' 
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '15px' 
          }}>
            <h3 style={{ margin: 0, color: '#495057' }}>키워드(소재) 상세 데이터</h3>
            <span style={{ 
              fontSize: '0.9rem', 
              color: '#6c757d',
              fontStyle: 'italic'
            }}>
              키워드를 클릭하면 매체별 비교가 가능합니다.
            </span>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#e9ecef' }}>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #dee2e6',
                    borderRight: '1px solid #dee2e6',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}>키워드</th>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #dee2e6',
                    borderRight: '1px solid #dee2e6',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}>매체</th>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #dee2e6',
                    borderRight: '1px solid #dee2e6',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}>캠페인</th>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #dee2e6',
                    borderRight: '1px solid #dee2e6',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}>광고그룹</th>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #dee2e6',
                    borderRight: '1px solid #dee2e6',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}>노출수</th>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #dee2e6',
                    borderRight: '1px solid #dee2e6',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}>클릭수</th>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #dee2e6',
                    borderRight: '1px solid #dee2e6',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}>CTR</th>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #dee2e6',
                    borderRight: '1px solid #dee2e6',
                    background: '#d4e6f1',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>금일(CPC)</th>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #dee2e6',
                    borderRight: '1px solid #dee2e6',
                    background: '#d4e6f1',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>전일(CPC)</th>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #dee2e6',
                    borderRight: '1px solid #dee2e6',
                    background: '#d4e6f1',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>최근 7일(CPC)</th>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #dee2e6',
                    borderRight: '1px solid #dee2e6',
                    background: '#d4e6f1',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>지난주(CPC)</th>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #dee2e6',
                    borderRight: '1px solid #dee2e6',
                    background: '#fef7cd',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>설정기간(CPC)</th>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #dee2e6',
                    borderRight: '1px solid #dee2e6',
                    background: '#d5f4e6',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>금일(광고비)</th>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #dee2e6',
                    borderRight: '1px solid #dee2e6',
                    background: '#d5f4e6',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>전일(광고비)</th>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #dee2e6',
                    borderRight: '1px solid #dee2e6',
                    background: '#d5f4e6',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>최근 7일(광고비)</th>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #dee2e6',
                    borderRight: '1px solid #dee2e6',
                    background: '#d5f4e6',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>지난주(광고비)</th>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #dee2e6',
                    background: '#fef7cd',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>설정기간(광고비)</th>
                </tr>
              </thead>
              <tbody onClick={handleOutsideClick}>
                {filteredKeywords.map((item, index) => {
                  // 키워드별 배경색 설정
                  const isEvenKeyword = index % 2 === 0
                  const backgroundColor = isEvenKeyword ? '#ffffff' : '#f8f9fa'
                  
                  return (
                    <React.Fragment key={index}>
                      <tr 
                        style={{ 
                          background: backgroundColor,
                          borderLeft: index % 2 === 0 ? '3px solid #667eea' : '3px solid #28a745',
                          cursor: 'pointer'
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleKeywordRowClick(index, item.keyword)
                        }}
                      >
                        <td style={{ 
                          padding: '10px', 
                          borderBottom: '1px solid #dee2e6',
                          borderRight: '1px solid #dee2e6',
                          fontWeight: '600',
                          color: '#495057'
                        }}>
                          {item.keyword}
                        </td>
                        <td style={{ 
                          padding: '10px', 
                          borderBottom: '1px solid #dee2e6',
                          borderRight: '1px solid #dee2e6',
                          textAlign: 'center'
                        }}>
                          {item.media}
                        </td>
                        <td style={{ 
                          padding: '10px', 
                          borderBottom: '1px solid #dee2e6',
                          borderRight: '1px solid #dee2e6',
                          textAlign: 'center'
                        }}>
                          {item.campaign}
                        </td>
                        <td style={{ 
                          padding: '10px', 
                          borderBottom: '1px solid #dee2e6',
                          borderRight: '1px solid #dee2e6',
                          textAlign: 'center'
                        }}>
                          {item.adGroup}
                        </td>
                        <td style={{ 
                          padding: '10px', 
                          borderBottom: '1px solid #dee2e6',
                          borderRight: '1px solid #dee2e6',
                          textAlign: 'right'
                        }}>
                          {item.impressions.toLocaleString()}
                        </td>
                        <td style={{ 
                          padding: '10px', 
                          borderBottom: '1px solid #dee2e6',
                          borderRight: '1px solid #dee2e6',
                          textAlign: 'right'
                        }}>
                          {item.clicks.toLocaleString()}
                        </td>
                        <td style={{ 
                          padding: '10px', 
                          borderBottom: '1px solid #dee2e6',
                          borderRight: '1px solid #dee2e6',
                          textAlign: 'right'
                        }}>
                          {item.ctr.toFixed(1)}%
                        </td>
                        <td style={{ 
                          padding: '10px', 
                          borderBottom: '1px solid #dee2e6',
                          borderRight: '1px solid #dee2e6',
                          textAlign: 'right',
                          background: '#f8f9fa'
                        }}>
                          {item.cpc_today.toLocaleString()}
                        </td>
                        <td style={{ 
                          padding: '10px', 
                          borderBottom: '1px solid #dee2e6',
                          borderRight: '1px solid #dee2e6',
                          textAlign: 'right',
                          background: '#f8f9fa'
                        }}>
                          {item.cpc_yesterday.toLocaleString()}
                        </td>
                        <td style={{ 
                          padding: '10px', 
                          borderBottom: '1px solid #dee2e6',
                          borderRight: '1px solid #dee2e6',
                          textAlign: 'right',
                          background: '#f8f9fa'
                        }}>
                          {item.cpc_7days.toLocaleString()}
                        </td>
                        <td style={{ 
                          padding: '10px', 
                          borderBottom: '1px solid #dee2e6',
                          borderRight: '1px solid #dee2e6',
                          textAlign: 'right',
                          background: '#f8f9fa'
                        }}>
                          {item.cpc_last_week.toLocaleString()}
                        </td>
                        <td style={{ 
                          padding: '10px', 
                          borderBottom: '1px solid #dee2e6',
                          borderRight: '1px solid #dee2e6',
                          textAlign: 'right',
                          background: '#fffbf0'
                        }}>
                          {Math.round((item.cost_today + item.cost_yesterday + item.cost_7days + item.cost_last_week) / (item.clicks || 1)).toLocaleString()}
                        </td>
                        <td style={{ 
                          padding: '10px', 
                          borderBottom: '1px solid #dee2e6',
                          borderRight: '1px solid #dee2e6',
                          textAlign: 'right',
                          background: '#f0f9ff'
                        }}>
                          {item.cost_today.toLocaleString()}
                        </td>
                        <td style={{ 
                          padding: '10px', 
                          borderBottom: '1px solid #dee2e6',
                          borderRight: '1px solid #dee2e6',
                          textAlign: 'right',
                          background: '#f0f9ff'
                        }}>
                          {item.cost_yesterday.toLocaleString()}
                        </td>
                        <td style={{ 
                          padding: '10px', 
                          borderBottom: '1px solid #dee2e6',
                          borderRight: '1px solid #dee2e6',
                          textAlign: 'right',
                          background: '#f0f9ff'
                        }}>
                          {item.cost_7days.toLocaleString()}
                        </td>
                        <td style={{ 
                          padding: '10px', 
                          borderBottom: '1px solid #dee2e6',
                          borderRight: '1px solid #dee2e6',
                          textAlign: 'right',
                          background: '#f0f9ff'
                        }}>
                          {item.cost_last_week.toLocaleString()}
                        </td>
                        <td style={{ 
                          padding: '10px', 
                          borderBottom: '1px solid #dee2e6',
                          textAlign: 'right',
                          background: '#fffbf0'
                        }}>
                          {(item.cost_today + item.cost_yesterday + item.cost_7days + item.cost_last_week).toLocaleString()}
                        </td>
                      </tr>
                      
                      {/* 키워드 행 클릭 시 나타나는 매체별 세부 데이터 */}
                      {selectedKeywordIndex === index && (
                        expandedKeywordData.map((mediaItem, mediaIndex) => (
                          <tr key={`${index}-${mediaIndex}`} style={{ 
                            background: '#f8f9fa', 
                            borderLeft: '3px solid #ffc107',
                            animation: 'slideDown 0.3s ease-out'
                          }}>
                            <td style={{ 
                              padding: '8px 10px', 
                              borderBottom: '1px solid #dee2e6',
                              borderRight: '1px solid #dee2e6',
                              fontWeight: '500',
                              color: '#6c757d',
                              paddingLeft: '20px'
                            }}>
                              └ {mediaItem.keyword}
                            </td>
                            <td style={{ 
                              padding: '8px 10px', 
                              borderBottom: '1px solid #dee2e6',
                              borderRight: '1px solid #dee2e6',
                              textAlign: 'center',
                              color: '#6c757d'
                            }}>
                              {mediaItem.media}
                            </td>
                            <td style={{ 
                              padding: '8px 10px', 
                              borderBottom: '1px solid #dee2e6',
                              borderRight: '1px solid #dee2e6',
                              textAlign: 'center',
                              color: '#6c757d'
                            }}>
                              {mediaItem.campaign}
                            </td>
                            <td style={{ 
                              padding: '8px 10px', 
                              borderBottom: '1px solid #dee2e6',
                              borderRight: '1px solid #dee2e6',
                              textAlign: 'center',
                              color: '#6c757d'
                            }}>
                              {mediaItem.adGroup}
                            </td>
                            <td style={{ 
                              padding: '8px 10px', 
                              borderBottom: '1px solid #dee2e6',
                              borderRight: '1px solid #dee2e6',
                              textAlign: 'right',
                              color: '#6c757d'
                            }}>
                              {mediaItem.impressions.toLocaleString()}
                            </td>
                            <td style={{ 
                              padding: '8px 10px', 
                              borderBottom: '1px solid #dee2e6',
                              borderRight: '1px solid #dee2e6',
                              textAlign: 'right',
                              color: '#6c757d'
                            }}>
                              {mediaItem.clicks.toLocaleString()}
                            </td>
                            <td style={{ 
                              padding: '8px 10px', 
                              borderBottom: '1px solid #dee2e6',
                              borderRight: '1px solid #dee2e6',
                              textAlign: 'right',
                              color: '#6c757d'
                            }}>
                              {mediaItem.ctr.toFixed(1)}%
                            </td>
                            <td style={{ 
                              padding: '8px 10px', 
                              borderBottom: '1px solid #dee2e6',
                              borderRight: '1px solid #dee2e6',
                              textAlign: 'right',
                              background: '#f1f5f9',
                              color: '#6c757d'
                            }}>
                              {mediaItem.cpc_today.toLocaleString()}
                            </td>
                            <td style={{ 
                              padding: '8px 10px', 
                              borderBottom: '1px solid #dee2e6',
                              borderRight: '1px solid #dee2e6',
                              textAlign: 'right',
                              background: '#f1f5f9',
                              color: '#6c757d'
                            }}>
                              {mediaItem.cpc_yesterday.toLocaleString()}
                            </td>
                            <td style={{ 
                              padding: '8px 10px', 
                              borderBottom: '1px solid #dee2e6',
                              borderRight: '1px solid #dee2e6',
                              textAlign: 'right',
                              background: '#f1f5f9',
                              color: '#6c757d'
                            }}>
                              {mediaItem.cpc_7days.toLocaleString()}
                            </td>
                            <td style={{ 
                              padding: '8px 10px', 
                              borderBottom: '1px solid #dee2e6',
                              borderRight: '1px solid #dee2e6',
                              textAlign: 'right',
                              background: '#f1f5f9',
                              color: '#6c757d'
                            }}>
                              {mediaItem.cpc_last_week.toLocaleString()}
                            </td>
                            <td style={{ 
                              padding: '8px 10px', 
                              borderBottom: '1px solid #dee2e6',
                              borderRight: '1px solid #dee2e6',
                              textAlign: 'right',
                              background: '#fff8e1',
                              color: '#6c757d'
                            }}>
                              {Math.round((mediaItem.cost_today + mediaItem.cost_yesterday + mediaItem.cost_7days + mediaItem.cost_last_week) / (mediaItem.clicks || 1)).toLocaleString()}
                            </td>
                            <td style={{ 
                              padding: '8px 10px', 
                              borderBottom: '1px solid #dee2e6',
                              borderRight: '1px solid #dee2e6',
                              textAlign: 'right',
                              background: '#f0f9ff',
                              color: '#6c757d'
                            }}>
                              {mediaItem.cost_today.toLocaleString()}
                            </td>
                            <td style={{ 
                              padding: '8px 10px', 
                              borderBottom: '1px solid #dee2e6',
                              borderRight: '1px solid #dee2e6',
                              textAlign: 'right',
                              background: '#f0f9ff',
                              color: '#6c757d'
                            }}>
                              {mediaItem.cost_yesterday.toLocaleString()}
                            </td>
                            <td style={{ 
                              padding: '8px 10px', 
                              borderBottom: '1px solid #dee2e6',
                              borderRight: '1px solid #dee2e6',
                              textAlign: 'right',
                              background: '#f0f9ff',
                              color: '#6c757d'
                            }}>
                              {mediaItem.cost_7days.toLocaleString()}
                            </td>
                            <td style={{ 
                              padding: '8px 10px', 
                              borderBottom: '1px solid #dee2e6',
                              borderRight: '1px solid #dee2e6',
                              textAlign: 'right',
                              background: '#f0f9ff',
                              color: '#6c757d'
                            }}>
                              {mediaItem.cost_last_week.toLocaleString()}
                            </td>
                            <td style={{ 
                              padding: '8px 10px', 
                              borderBottom: '1px solid #dee2e6',
                              textAlign: 'right',
                              background: '#fff8e1',
                              color: '#6c757d'
                            }}>
                              {(mediaItem.cost_today + mediaItem.cost_yesterday + mediaItem.cost_7days + mediaItem.cost_last_week).toLocaleString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
          {filteredKeywords.length === 0 && (
            <div style={{ 
              textAlign: 'center',
              padding: '20px',
              color: '#6c757d'
            }}>
              검색 조건에 맞는 키워드가 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 