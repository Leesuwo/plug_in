import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/src/types/supabase'
import type { Plugin } from '../types'
import { nameToSlug } from '../utils/slug'

type PluginRow = Database['public']['Tables']['plugins']['Row']

/**
 * Supabase 플러그인 데이터를 Plugin 타입으로 변환
 */
function transformPlugin(row: PluginRow): Plugin {
  // source 타입 안전하게 변환
  let source: 'Plugin Alliance' | 'Slate Digital' = 'Plugin Alliance'
  if (row.source === 'Plugin Alliance' || row.source === 'Slate Digital') {
    source = row.source
  }

  return {
    id: row.id,
    name: row.name,
    developer: row.developer,
    description: row.description || undefined,
    formats: [], // TODO: plugin_formats 테이블에서 조인 필요
    category: 'Other' as const, // TODO: plugin_categories 테이블에서 조인 필요
    tags: [], // TODO: plugin_tags 테이블에서 조인 필요
    price: row.price ?? undefined,
    currency: row.currency || 'USD',
    website: row.website_url || undefined,
    imageUrl: row.image_url || undefined,
    rating: row.rating ?? undefined,
    reviewCount: row.review_count ?? undefined,
    releaseDate: row.release_date ? new Date(row.release_date) : undefined,
    lastUpdated: row.last_updated ? new Date(row.last_updated) : undefined,
    source,
    sourceUrl: row.source_url || undefined,
  }
}

/**
 * 모든 플러그인 가져오기
 */
export async function getPlugins() {
  // 환경 변수 확인
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL 환경 변수가 설정되지 않았습니다.')
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY 환경 변수가 설정되지 않았습니다.')
  }

  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('plugins')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Supabase 쿼리 오류:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    })
    throw new Error(`플러그인 데이터를 가져오는데 실패했습니다: ${error.message} (코드: ${error.code})`)
  }

  if (!data) {
    // 개발 환경에서만 경고 출력
    if (process.env.NODE_ENV === 'development') {
      console.warn('플러그인 데이터가 null입니다.')
    }
    return []
  }

  return data.map(transformPlugin)
}

/**
 * 페이지네이션을 지원하는 플러그인 가져오기
 * @param page - 페이지 번호 (1부터 시작)
 * @param pageSize - 페이지당 항목 수 (기본값: 20)
 * @param searchQuery - 검색어 (플러그인 이름, 제조사, 설명에서 검색)
 * @returns 플러그인 배열과 전체 개수
 */
export async function getPluginsPaginated(
  page: number = 1,
  pageSize: number = 20,
  searchQuery?: string
) {
  // 환경 변수 확인
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL 환경 변수가 설정되지 않았습니다.')
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY 환경 변수가 설정되지 않았습니다.')
  }

  const supabase = await createClient()
  
  // 검색어 처리
  const searchTerm = searchQuery?.trim()
  const searchPattern = searchTerm ? `%${searchTerm}%` : null

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  // count 쿼리와 data 쿼리를 병렬 처리하여 성능 개선
  // 검색 조건이 있으면 동일한 필터를 두 쿼리에 적용
  let countQuery = supabase.from('plugins').select('*', { count: 'exact', head: true })
  let dataQuery = supabase.from('plugins').select('*').order('created_at', { ascending: false }).range(from, to)
  
  if (searchPattern) {
    const searchFilter = `name.ilike.${searchPattern},developer.ilike.${searchPattern},description.ilike.${searchPattern}`
    countQuery = countQuery.or(searchFilter)
    dataQuery = dataQuery.or(searchFilter)
  }

  // 두 쿼리를 병렬 실행
  const [countResult, dataResult] = await Promise.all([countQuery, dataQuery])

  const { count, error: countError } = countResult
  const { data, error } = dataResult

  if (countError) {
    console.error('Supabase count 쿼리 오류:', countError)
    throw new Error(`플러그인 개수를 가져오는데 실패했습니다: ${countError.message}`)
  }

  const totalCount = count || 0
  const totalPages = Math.ceil(totalCount / pageSize)

  if (error) {
    console.error('Supabase 쿼리 오류:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    })
    throw new Error(`플러그인 데이터를 가져오는데 실패했습니다: ${error.message} (코드: ${error.code})`)
  }

  if (!data) {
    // 개발 환경에서만 경고 출력
    if (process.env.NODE_ENV === 'development') {
      console.warn('플러그인 데이터가 null입니다.')
    }
    return {
      plugins: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: page,
      pageSize,
    }
  }

  return {
    plugins: data.map(transformPlugin),
    totalCount,
    totalPages,
    currentPage: page,
    pageSize,
  }
}

/**
 * 플러그인 ID로 가져오기
 */
export async function getPluginById(id: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('plugins')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(`플러그인을 찾을 수 없습니다: ${error.message}`)
  }

  return transformPlugin(data)
}

/**
 * slug로 플러그인 가져오기
 * slug는 플러그인 이름을 URL-safe하게 변환한 값
 */
export async function getPluginBySlug(slug: string) {
  // 환경 변수 확인
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL 환경 변수가 설정되지 않았습니다.')
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY 환경 변수가 설정되지 않았습니다.')
  }

  const supabase = await createClient()
  
  // slug를 검색 패턴으로 변환 (하이픈을 공백으로)
  const searchPattern = slug.replace(/-/g, ' ').replace(/_/g, ' ')
  
  // 이름에서 검색 (부분 일치)
  // slug는 보통 이름의 변형이므로, 이름을 소문자로 변환해서 비교
  const { data, error } = await supabase
    .from('plugins')
    .select('*')
    .ilike('name', `%${searchPattern}%`)
    .limit(10) // 여러 결과가 나올 수 있으므로 제한

  if (error) {
    console.error('Supabase 쿼리 오류:', error)
    throw new Error(`플러그인을 찾는 중 오류가 발생했습니다: ${error.message}`)
  }

  if (!data || data.length === 0) {
    return null
  }

  // 정확한 매칭 찾기 (slug와 가장 유사한 이름)
  // 모든 플러그인을 가져와서 slug로 변환해서 비교
  for (const plugin of data) {
    const pluginSlug = nameToSlug(plugin.name)
    if (pluginSlug === slug) {
      return transformPlugin(plugin)
    }
  }

  // 정확한 매칭이 없으면 첫 번째 결과 반환
  return transformPlugin(data[0])
}
