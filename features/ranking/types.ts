/**
 * 랭킹 및 차트 타입 정의
 */

export type RankingPeriod = 'daily' | 'weekly' | 'monthly' | 'all-time'

export interface RankingEntry {
  pluginId: string
  position: number
  previousPosition?: number
  change: number // 양수 = 상승, 음수 = 하락, 0 = 변화 없음
  metric: number // 평점, 다운로드 수, 리뷰 수 등
}

export interface RankingChart {
  id: string
  name: string
  period: RankingPeriod
  entries: RankingEntry[]
  updatedAt: Date
}
