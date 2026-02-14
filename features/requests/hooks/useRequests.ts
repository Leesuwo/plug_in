import { createClient } from '@/lib/supabase/server'
import type { PluginRequest } from '../types'

// plugin_requests 테이블의 Row 타입 정의 (타입이 생성되기 전까지 사용)
type PluginRequestRow = {
  id: string
  plugin_name: string
  description: string | null
  developer: string | null
  website_url: string | null
  created_at: string
  updated_at: string
}

/**
 * 모든 플러그인 요청 가져오기 (최신순)
 */
export async function getRequests() {
  // 환경 변수 확인
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL 환경 변수가 설정되지 않았습니다.')
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY 환경 변수가 설정되지 않았습니다.')
  }

  const supabase = await createClient()
  
  // plugin_requests 테이블이 타입에 아직 없으므로 타입 단언 사용
  const { data, error } = await (supabase as any)
    .from('plugin_requests')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Supabase 쿼리 오류:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    })
    throw new Error(`요청 데이터를 가져오는데 실패했습니다: ${error.message} (코드: ${error.code})`)
  }

  if (!data) {
    console.warn('요청 데이터가 null입니다.')
    return []
  }

  return (data as PluginRequestRow[]).map((row) => ({
    id: row.id,
    plugin_name: row.plugin_name,
    developer: row.developer || undefined,
    description: row.description || undefined,
    website_url: row.website_url || undefined,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }))
}

/**
 * 페이지네이션을 지원하는 플러그인 요청 가져오기
 * @param page - 페이지 번호 (1부터 시작)
 * @param pageSize - 페이지당 항목 수 (기본값: 20)
 */
export async function getRequestsPaginated(
  page: number = 1,
  pageSize: number = 20
) {
  // 환경 변수 확인
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL 환경 변수가 설정되지 않았습니다.')
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY 환경 변수가 설정되지 않았습니다.')
  }

  const supabase = await createClient()
  
  // 전체 개수 조회 (plugin_requests 테이블이 타입에 아직 없으므로 타입 단언 사용)
  const { count, error: countError } = await (supabase as any)
    .from('plugin_requests')
    .select('*', { count: 'exact', head: true })

  if (countError) {
    console.error('Supabase count 쿼리 오류:', countError)
    throw new Error(`요청 개수를 가져오는데 실패했습니다: ${countError.message}`)
  }

  const totalCount = count || 0
  const totalPages = Math.ceil(totalCount / pageSize)
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  // 페이지네이션된 데이터 조회 (plugin_requests 테이블이 타입에 아직 없으므로 타입 단언 사용)
  const { data, error } = await (supabase as any)
    .from('plugin_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Supabase 쿼리 오류:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    })
    throw new Error(`요청 데이터를 가져오는데 실패했습니다: ${error.message} (코드: ${error.code})`)
  }

  if (!data) {
    console.warn('요청 데이터가 null입니다.')
    return {
      requests: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: page,
      pageSize,
    }
  }

  return {
    requests: (data as PluginRequestRow[]).map((row) => ({
      id: row.id,
      plugin_name: row.plugin_name,
      developer: row.developer || undefined,
      description: row.description || undefined,
      website_url: row.website_url || undefined,
      created_at: row.created_at,
      updated_at: row.updated_at,
    })),
    totalCount,
    totalPages,
    currentPage: page,
    pageSize,
  }
}
