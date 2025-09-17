// Next.js API 라우트 - 키워드 데이터 엔드포인트

import { generateKeywordData, validateKeywordData } from './data.js'
import { applyFilters } from '../../utils/filterUtils.js'
import { calculatePeriodSummary } from '../../utils/dataCalculations.js'

/**
 * 키워드 데이터 API 엔드포인트
 * GET /api/keyword/route - 키워드 데이터 조회
 * POST /api/keyword/route - 필터링된 키워드 데이터 조회
 */
export default async function handler(req, res) {
  try {
    const { method } = req

    switch (method) {
      case 'GET':
        // 기본 키워드 데이터 반환
        const basicData = generateKeywordData()
        
        if (!validateKeywordData(basicData)) {
          return res.status(500).json({
            error: 'Invalid keyword data format',
            message: '키워드 데이터 형식이 올바르지 않습니다.'
          })
        }

        return res.status(200).json({
          success: true,
          data: basicData,
          total: basicData.length
        })

      case 'POST':
        // 필터링된 키워드 데이터 반환
        const {
          selectedMedias = ['네이버', '카카오', '구글', '메타', '틱톡'],
          keywordMetric = '광고비',
          sortOrder = '내림차순',
          keywordCount = '',
          costRangeMin = '',
          costRangeMax = '',
          selectedDate = '',
          advertiser = ''
        } = req.body

        // 입력값 검증
        if (!selectedMedias || !Array.isArray(selectedMedias) || selectedMedias.length === 0) {
          return res.status(400).json({
            error: 'Invalid medias',
            message: '선택된 매체가 올바르지 않습니다.'
          })
        }

        // 원본 데이터 가져오기
        const rawData = generateKeywordData()

        // 필터 적용
        const filteredData = applyFilters({
          data: rawData,
          selectedMedias,
          metric: keywordMetric,
          order: sortOrder,
          count: keywordCount,
          minCost: costRangeMin,
          maxCost: costRangeMax
        })

        // 기간별 합산 정보 계산
        const periodSummary = calculatePeriodSummary(filteredData)

        return res.status(200).json({
          success: true,
          data: filteredData,
          periodSummary,
          total: filteredData.length,
          filters: {
            selectedMedias,
            keywordMetric,
            sortOrder,
            keywordCount,
            costRangeMin,
            costRangeMax,
            selectedDate,
            advertiser
          }
        })

      default:
        res.setHeader('Allow', ['GET', 'POST'])
        return res.status(405).json({
          error: 'Method not allowed',
          message: `Method ${method} not allowed`
        })
    }
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: '서버 내부 오류가 발생했습니다.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

/**
 * API 엔드포인트 설정
 */
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}